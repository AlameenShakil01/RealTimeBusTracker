const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const User = require('../models/User');
const GPSLog = require('../models/GPSLog');
const { generateId } = require('../utils/idGenerator');
const { getLatestBusLocation } = require('../services/locationService');

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/trips/active
// @access  Public
// Returns all ongoing trips with bus + route details populated
// ─────────────────────────────────────────────────────────────────
const getActiveTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ trip_status: 'ongoing' }).lean();

    if (trips.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active trips right now',
        count: 0,
        data: [],
      });
    }

    // Enrich each trip with bus, route, and latest location
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const [bus, route, location] = await Promise.all([
          Bus.findOne({ bus_id: trip.bus_id }).lean(),
          Route.findOne({ route_id: trip.route_id }).lean(),
          getLatestBusLocation(trip.bus_id),
        ]);

        return {
          ...trip,
          bus: bus ? { bus_id: bus.bus_id, bus_number: bus.bus_number, capacity: bus.capacity } : null,
          route: route ? { route_id: route.route_id, route_name: route.route_name, start_point: route.start_point, end_point: route.end_point } : null,
          current_location: location
            ? { latitude: location.latitude, longitude: location.longitude, speed_kmph: location.speed_kmph, bearing: location.bearing, timestamp: location.timestamp }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/trips/start
// @access  Private — Driver only
// ─────────────────────────────────────────────────────────────────
const startTrip = async (req, res, next) => {
  try {
    const { bus_id, route_id } = req.body;
    const driver_id = req.user.user_id;

    if (!bus_id || !route_id) {
      return res.status(400).json({
        success: false,
        message: 'bus_id and route_id are required',
      });
    }

    // Make sure bus exists and belongs to this driver
    const bus = await Bus.findOne({ bus_id, is_active: true });
    if (!bus) {
      return res.status(404).json({ success: false, message: `Bus ${bus_id} not found` });
    }
    if (bus.driver_id !== driver_id) {
      return res.status(403).json({ success: false, message: 'This bus is not assigned to you' });
    }

    // Prevent starting if a trip is already ongoing for this bus
    const existingTrip = await Trip.findOne({ bus_id, trip_status: 'ongoing' });
    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message: `Bus ${bus_id} already has an ongoing trip: ${existingTrip.trip_id}`,
      });
    }

    // Verify route exists
    const route = await Route.findOne({ route_id, is_active: true });
    if (!route) {
      return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
    }

    // Create trip
    const trip_id = generateId('T');
    const trip = await Trip.create({
      trip_id,
      bus_id,
      driver_id,
      route_id,
      trip_status: 'ongoing',
      start_time: new Date(),
    });

    // Mark bus as active
    await Bus.findOneAndUpdate({ bus_id }, { status: 'active' });

    // Notify all connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('trip-status', {
        event: 'trip_started',
        trip_id: trip.trip_id,
        bus_id,
        route_id,
        status: 'ongoing',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Trip started successfully',
      data: {
        trip_id: trip.trip_id,
        bus_id: trip.bus_id,
        route_id: trip.route_id,
        started_at: trip.start_time,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/trips/:trip_id/stop
// @access  Private — Driver only
// ─────────────────────────────────────────────────────────────────
const stopTrip = async (req, res, next) => {
  try {
    const { trip_id } = req.params;
    const driver_id = req.user.user_id;

    const trip = await Trip.findOne({ trip_id });
    if (!trip) {
      return res.status(404).json({ success: false, message: `Trip ${trip_id} not found` });
    }

    // Only the driver who started it can stop it
    if (trip.driver_id !== driver_id) {
      return res.status(403).json({ success: false, message: 'You did not start this trip' });
    }

    if (trip.trip_status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: `Trip is already ${trip.trip_status}`,
      });
    }

    // Complete the trip
    const now = new Date();
    trip.trip_status = 'completed';
    trip.end_time = now;
    await trip.save();

    // Mark bus as inactive
    await Bus.findOneAndUpdate({ bus_id: trip.bus_id }, { status: 'inactive' });

    // Notify connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('trip-status', {
        event: 'trip_ended',
        trip_id,
        bus_id: trip.bus_id,
        status: 'completed',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      data: {
        trip_id: trip.trip_id,
        bus_id: trip.bus_id,
        completed_at: trip.end_time,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/trips/:trip_id/location
// @access  Private — Driver only (REST fallback for WebSocket)
// ─────────────────────────────────────────────────────────────────
const updateLocation = async (req, res, next) => {
  try {
    const { trip_id } = req.params;
    const { latitude, longitude, speed_kmph = 0, bearing = 0 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required',
      });
    }

    // Verify trip is ongoing
    const trip = await Trip.findOne({ trip_id, trip_status: 'ongoing' }).lean();
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: `Active trip ${trip_id} not found`,
      });
    }

    // Save GPS log
    await GPSLog.create({
      trip_id,
      bus_id: trip.bus_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed_kmph: parseFloat(speed_kmph),
      bearing: parseFloat(bearing),
      timestamp: new Date(),
    });

    // Broadcast to subscribed commuters via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const { BUS_ROOM_PREFIX } = require('../utils/constants');
      io.to(`${BUS_ROOM_PREFIX}${trip.bus_id}`).emit('bus-location', {
        bus_id: trip.bus_id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed_kmph: parseFloat(speed_kmph),
        bearing: parseFloat(bearing),
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/trips/history
// @access  Private — Driver only
// ─────────────────────────────────────────────────────────────────
const getTripHistory = async (req, res, next) => {
  try {
    const driver_id = req.user.user_id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find({ driver_id })
      .sort({ start_time: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Trip.countDocuments({ driver_id });

    // Enrich with route info
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const route = await Route.findOne({ route_id: trip.route_id }).lean();
        return {
          ...trip,
          route_name: route ? route.route_name : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActiveTrips, startTrip, stopTrip, updateLocation, getTripHistory };