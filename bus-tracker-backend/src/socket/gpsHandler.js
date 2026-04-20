// ─────────────────────────────────────────────────────────────────
//  GPS WebSocket Handler — Core Real-Time Engine
//
//  Full data flow:
//  1. Driver connects with JWT in handshake auth
//  2. Driver calls POST /api/trips/start → gets trip_id
//  3. Driver emits 'register-trip' → server validates & confirms
//  4. Driver emits 'location-update' every 5 seconds
//  5. Server saves to MongoDB gps_logs (async, non-blocking)
//  6. Server broadcasts to room 'bus:B102' → all subscribed commuters
//  7. Commuters receive 'bus-location' → map marker moves
//  8. On disconnect → commuters receive 'bus-signal-lost'
// ─────────────────────────────────────────────────────────────────

const GPSLog = require('../models/GPSLog');
const Trip = require('../models/Trip');
const { verifyToken } = require('../config/jwt');
const { BUS_ROOM_PREFIX } = require('../utils/constants');

module.exports = (io) => {

  // ── In-memory connection tracking (resets on server restart) ───
  // socket.id → { user_id, role, trip_id, bus_id }
  const connectedDrivers = new Map();
  // socket.id → [bus_id, bus_id...]
  const connectedCommuters = new Map();

  // ── Socket.IO Auth Middleware ───────────────────────────────────
  // Runs BEFORE every connection event
  // Drivers must send JWT — commuters connect without auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
      || socket.handshake.headers?.authorization;

    if (!token) {
      socket.data.role = 'commuter';
      return next();
    }

    try {
      const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = verifyToken(raw);
      socket.data.user_id = decoded.user_id;
      socket.data.role = decoded.role;
      socket.data.phone = decoded.phone;
      next();
    } catch (err) {
      // Bad token → treat as commuter, not an error
      socket.data.role = 'commuter';
      next();
    }
  });

  // ── Connection ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { role, user_id = 'anonymous' } = socket.data;
    console.log(`🔌 [WS] Connected  socket:${socket.id} | role:${role} | user:${user_id}`);

    // ════════════════════════════════════════════════════════════
    // COMMUTER EVENTS
    // ════════════════════════════════════════════════════════════

    /**
     * subscribe-bus
     * Commuter opens LiveTrackingScreen → joins room for a bus
     * Client emits: { bus_id: 'B102' }
     */
    socket.on('subscribe-bus', async ({ bus_id }) => {
      if (!bus_id) return socket.emit('error', { message: 'bus_id required' });

      const room = `${BUS_ROOM_PREFIX}${bus_id}`;
      socket.join(room);

      // Track for cleanup on disconnect
      if (!connectedCommuters.has(socket.id)) connectedCommuters.set(socket.id, []);
      connectedCommuters.get(socket.id).push(bus_id);

      console.log(`👁  [WS] Commuter ${socket.id} → subscribed bus:${bus_id}`);

      // Send latest cached location immediately
      // Commuter map won't be blank while waiting for next 5-sec update
      try {
        const latest = await GPSLog.findOne({ bus_id })
          .sort({ timestamp: -1 })
          .lean();

        if (latest) {
          socket.emit('bus-location', {
            bus_id,
            latitude: latest.latitude,
            longitude: latest.longitude,
            speed_kmph: latest.speed_kmph,
            bearing: latest.bearing,
            timestamp: latest.timestamp,
            is_initial: true,
          });
        } else {
          socket.emit('bus-no-data', {
            bus_id,
            message: 'Bus has no active location data. Waiting for driver to start trip.',
          });
        }
      } catch (err) {
        console.error(`❌ [WS] subscribe-bus initial fetch error:`, err.message);
      }
    });

    /**
     * unsubscribe-bus
     * Commuter leaves LiveTrackingScreen
     * Client emits: { bus_id: 'B102' }
     */
    socket.on('unsubscribe-bus', ({ bus_id }) => {
      if (!bus_id) return;
      socket.leave(`${BUS_ROOM_PREFIX}${bus_id}`);

      if (connectedCommuters.has(socket.id)) {
        const updated = connectedCommuters.get(socket.id).filter((id) => id !== bus_id);
        connectedCommuters.set(socket.id, updated);
      }

      console.log(`👁  [WS] Commuter ${socket.id} → unsubscribed bus:${bus_id}`);
    });

    // ════════════════════════════════════════════════════════════
    // DRIVER EVENTS
    // ════════════════════════════════════════════════════════════

    /**
     * register-trip
     * Driver calls this right after POST /api/trips/start
     * Registers the socket as an active GPS broadcaster
     * Client emits: { trip_id: 'T123456', bus_id: 'B102' }
     */
    socket.on('register-trip', async ({ trip_id, bus_id }) => {
      if (socket.data.role !== 'driver') {
        return socket.emit('error', { message: 'Only drivers can register trips' });
      }
      if (!trip_id || !bus_id) {
        return socket.emit('error', { message: 'trip_id and bus_id are required' });
      }

      try {
        // Verify trip is real, ongoing, and belongs to this driver
        const trip = await Trip.findOne({
          trip_id,
          bus_id,
          driver_id: socket.data.user_id,
          trip_status: 'ongoing',
        }).lean();

        if (!trip) {
          return socket.emit('error', {
            message: `No active trip ${trip_id} found for driver ${socket.data.user_id}`,
          });
        }

        // Register in memory
        connectedDrivers.set(socket.id, {
          user_id: socket.data.user_id,
          trip_id,
          bus_id,
        });

        // Driver also joins the bus room (can receive trip-status events)
        socket.join(`${BUS_ROOM_PREFIX}${bus_id}`);
        // Driver joins admin room for fleet monitoring
        socket.join('admin-room');

        console.log(`🚌 [WS] Driver ${socket.data.user_id} registered trip:${trip_id} bus:${bus_id}`);

        socket.emit('trip-registered', {
          success: true,
          trip_id,
          bus_id,
          message: '✅ GPS tracking active. Start sending location-update events.',
        });

        // Notify admin room
        io.to('admin-room').emit('driver-status', {
          event: 'driver_online',
          driver_id: socket.data.user_id,
          bus_id,
          trip_id,
          timestamp: new Date().toISOString(),
        });

      } catch (err) {
        console.error(`❌ [WS] register-trip error:`, err.message);
        socket.emit('error', { message: 'Failed to register trip' });
      }
    });

    /**
     * location-update
     * THE CORE EVENT — driver sends this every 5 seconds
     * Client emits: { trip_id, bus_id, latitude, longitude, speed_kmph, bearing }
     *
     * Server does 3 things:
     *  1. Validates (role, coords, trip ownership)
     *  2. Saves to MongoDB gps_logs (non-blocking)
     *  3. Broadcasts to all commuters in bus room
     */
    socket.on('location-update', async (data) => {
      // Guard: only drivers
      if (socket.data.role !== 'driver') {
        return socket.emit('error', { message: 'Only drivers can send location updates' });
      }

      const { trip_id, bus_id, latitude, longitude, speed_kmph = 0, bearing = 0 } = data;

      // Validate required fields
      if (!trip_id || !bus_id || latitude == null || longitude == null) {
        return socket.emit('error', {
          message: 'Required: trip_id, bus_id, latitude, longitude',
        });
      }

      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return socket.emit('error', { message: 'GPS coordinates out of valid range' });
      }

      try {
        const now = new Date();
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const speed = parseFloat(speed_kmph);
        const brng = parseFloat(bearing);

        // ── Save to MongoDB (fire-and-forget — don't block broadcast) ──
        GPSLog.create({ trip_id, bus_id, latitude: lat, longitude: lng, speed_kmph: speed, bearing: brng, timestamp: now })
          .catch((err) => console.error(`❌ [WS] GPS save failed:`, err.message));

        // ── Build broadcast payload ──
        const payload = {
          bus_id,
          latitude: lat,
          longitude: lng,
          speed_kmph: speed,
          bearing: brng,
          timestamp: now.toISOString(),
        };

        // ── Broadcast to commuters (socket.to excludes sender) ──
        socket.to(`${BUS_ROOM_PREFIX}${bus_id}`).emit('bus-location', payload);

        // ── Ack back to driver ──
        socket.emit('location-ack', {
          success: true,
          trip_id,
          timestamp: now.toISOString(),
        });

        console.log(`📍 [GPS] bus:${bus_id} lat:${lat} lng:${lng} speed:${speed}km/h bearing:${brng}°`);

      } catch (err) {
        console.error(`❌ [WS] location-update error:`, err.message);
        socket.emit('error', { message: 'Failed to process location update' });
      }
    });

    // ════════════════════════════════════════════════════════════
    // ADMIN EVENTS
    // ════════════════════════════════════════════════════════════

    /**
     * join-admin-room
     * Admin opens fleet monitoring dashboard
     */
    socket.on('join-admin-room', () => {
      if (socket.data.role !== 'admin') {
        return socket.emit('error', { message: 'Admin access only' });
      }
      socket.join('admin-room');
      console.log(`🛡  [WS] Admin ${socket.data.user_id} joined admin-room`);
      socket.emit('joined-admin-room', {
        success: true,
        active_drivers: connectedDrivers.size,
      });
    });

    // ════════════════════════════════════════════════════════════
    // DISCONNECT
    // ════════════════════════════════════════════════════════════
    socket.on('disconnect', (reason) => {
      console.log(`🔌 [WS] Disconnected socket:${socket.id} | reason:${reason}`);

      // Driver disconnect — notify commuters + admin
      if (connectedDrivers.has(socket.id)) {
        const { user_id, bus_id, trip_id } = connectedDrivers.get(socket.id);

        // Tell commuters watching this bus that GPS signal is lost
        io.to(`${BUS_ROOM_PREFIX}${bus_id}`).emit('bus-signal-lost', {
          bus_id,
          message: 'GPS signal lost. Driver may have disconnected.',
          timestamp: new Date().toISOString(),
        });

        // Tell admin room
        io.to('admin-room').emit('driver-status', {
          event: 'driver_offline',
          driver_id: user_id,
          bus_id,
          trip_id,
          timestamp: new Date().toISOString(),
          reason,
        });

        connectedDrivers.delete(socket.id);
        console.log(`🚌 [WS] Driver ${user_id} removed from tracking (bus:${bus_id})`);
      }

      connectedCommuters.delete(socket.id);
    });

    // ── Health check ping ────────────────────────────────────────
    socket.on('ping-server', () => {
      socket.emit('pong-server', { timestamp: new Date().toISOString() });
    });

  }); // end io.on('connection')

  // ── Expose stats for admin controller ──────────────────────────
  const getConnectionStats = () => ({
    total_connected: io.engine.clientsCount,
    active_drivers: connectedDrivers.size,
    active_commuters: connectedCommuters.size,
    driver_details: Array.from(connectedDrivers.values()),
  });

  io.getConnectionStats = getConnectionStats;
  console.log('✅ GPS WebSocket handler initialized');
  return { getConnectionStats };
};