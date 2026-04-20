// ─────────────────────────────────────────────────────────────────
//  adminController.js — All Admin APIs
//  Protected: JWT + roleCheck('admin') on every route
// ─────────────────────────────────────────────────────────────────

const User     = require('../models/User');
const Bus      = require('../models/Bus');
const Route    = require('../models/Route');
const Stop     = require('../models/Stop');
const Trip     = require('../models/Trip');
const GPSLog   = require('../models/GPSLog');
const { generateId } = require('../utils/idGenerator');
const bcrypt   = require('bcryptjs');

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [
      totalBuses,
      activeBuses,
      totalRoutes,
      activeRoutes,
      totalDrivers,
      activeTrips,
      totalTripsToday,
    ] = await Promise.all([
      Bus.countDocuments({ is_active: true }),
      Bus.countDocuments({ is_active: true, status: 'active' }),
      Route.countDocuments({ is_active: true }),
      Route.countDocuments({ is_active: true }),
      User.countDocuments({ role: 'driver', is_active: true }),
      Trip.countDocuments({ trip_status: 'ongoing' }),
      Trip.countDocuments({
        created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    // Socket connection stats (if available)
    const io = req.app.get('io');
    const socketStats = io?.getConnectionStats?.() || {
      total_connected: io?.engine?.clientsCount || 0,
      active_drivers: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        buses: { total: totalBuses, active: activeBuses, inactive: totalBuses - activeBuses },
        routes: { total: totalRoutes, active: activeRoutes },
        drivers: { total: totalDrivers },
        trips: { ongoing: activeTrips, today: totalTripsToday },
        realtime: {
          connected_sockets: socketStats.total_connected,
          active_driver_sockets: socketStats.active_drivers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/active-trips
const getActiveTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ trip_status: 'ongoing' }).lean();

    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const [bus, driver, route, latestGPS] = await Promise.all([
          Bus.findOne({ bus_id: trip.bus_id }).lean(),
          User.findOne({ user_id: trip.driver_id }).lean(),
          Route.findOne({ route_id: trip.route_id }).lean(),
          GPSLog.findOne({ bus_id: trip.bus_id }).sort({ timestamp: -1 }).lean(),
        ]);

        return {
          ...trip,
          bus:    bus    ? { bus_id: bus.bus_id, bus_number: bus.bus_number }        : null,
          driver: driver ? { user_id: driver.user_id, name: driver.name, phone: driver.phone } : null,
          route:  route  ? { route_id: route.route_id, route_name: route.route_name } : null,
          current_location: latestGPS
            ? { latitude: latestGPS.latitude, longitude: latestGPS.longitude,
                speed_kmph: latestGPS.speed_kmph, timestamp: latestGPS.timestamp }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════
// ROUTE MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// POST /api/admin/routes
const createRoute = async (req, res, next) => {
  try {
    const { route_name, start_point, end_point, total_distance_km, estimated_time_min } = req.body;

    if (!route_name || !start_point || !end_point || !total_distance_km || !estimated_time_min) {
      return res.status(400).json({
        success: false,
        message: 'route_name, start_point, end_point, total_distance_km, estimated_time_min are required',
      });
    }

    const route_id = generateId('R');

    const route = await Route.create({
      route_id,
      route_name,
      start_point,
      end_point,
      total_distance_km: parseFloat(total_distance_km),
      estimated_time_min: parseInt(estimated_time_min),
    });

    res.status(201).json({ success: true, message: 'Route created', data: route });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/routes/:route_id
const updateRoute = async (req, res, next) => {
  try {
    const { route_id } = req.params;
    const updates = req.body;

    // Prevent changing the ID itself
    delete updates.route_id;

    const route = await Route.findOneAndUpdate(
      { route_id, is_active: true },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
    }

    res.status(200).json({ success: true, message: 'Route updated', data: route });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/routes/:route_id  (soft delete)
const deleteRoute = async (req, res, next) => {
  try {
    const { route_id } = req.params;

    // Block deletion if buses are assigned to this route
    const assignedBuses = await Bus.countDocuments({ route_id, is_active: true });
    if (assignedBuses > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete route — ${assignedBuses} bus(es) are assigned to it. Reassign them first.`,
      });
    }

    const route = await Route.findOneAndUpdate(
      { route_id },
      { is_active: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
    }

    res.status(200).json({ success: true, message: `Route ${route_id} deactivated` });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/routes/:route_id/stops  — add a stop to a route
const addStop = async (req, res, next) => {
  try {
    const { route_id } = req.params;
    const { stop_name, stop_order, latitude, longitude, distance_from_start_km } = req.body;

    if (!stop_name || !stop_order || latitude == null || longitude == null || distance_from_start_km == null) {
      return res.status(400).json({
        success: false,
        message: 'stop_name, stop_order, latitude, longitude, distance_from_start_km are required',
      });
    }

    // Verify route exists
    const route = await Route.findOne({ route_id, is_active: true });
    if (!route) {
      return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
    }

    const stop_id = generateId('S');

    const stop = await Stop.create({
      stop_id,
      route_id,
      stop_name,
      stop_order: parseInt(stop_order),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distance_from_start_km: parseFloat(distance_from_start_km),
    });

    res.status(201).json({ success: true, message: 'Stop added', data: stop });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════
// DRIVER MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/drivers
const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ role: 'driver', is_active: true })
      .sort({ created_at: -1 })
      .lean();

    // Enrich with assigned bus info
    const enriched = await Promise.all(
      drivers.map(async (driver) => {
        let bus = null;
        if (driver.assigned_bus_id) {
          bus = await Bus.findOne({ bus_id: driver.assigned_bus_id }).lean();
        }
        return {
          ...driver,
          assigned_bus: bus
            ? { bus_id: bus.bus_id, bus_number: bus.bus_number, status: bus.status }
            : null,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/drivers
const createDriver = async (req, res, next) => {
  try {
    const { name, phone, password, license_number } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, phone, and password are required',
      });
    }

    // Check phone not already taken
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Phone ${phone} is already registered`,
      });
    }

    const user_id = generateId('U');

    const driver = new User({
      user_id,
      name,
      phone,
      password,      // pre-save hook hashes it
      role: 'driver',
      license_number: license_number || null,
    });

    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created',
      data: {
        user_id: driver.user_id,
        name: driver.name,
        phone: driver.phone,
        role: driver.role,
        license_number: driver.license_number,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/drivers/:user_id
const updateDriver = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    // Never allow role or password update through this endpoint
    delete updates.user_id;
    delete updates.role;
    delete updates.password;

    const driver = await User.findOneAndUpdate(
      { user_id, role: 'driver' },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: `Driver ${user_id} not found` });
    }

    res.status(200).json({ success: true, message: 'Driver updated', data: driver });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/drivers/:user_id  (soft delete)
const deleteDriver = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Block if driver has an ongoing trip
    const activeTrip = await Trip.findOne({ driver_id: user_id, trip_status: 'ongoing' });
    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: `Driver has an ongoing trip (${activeTrip.trip_id}). Stop the trip first.`,
      });
    }

    const driver = await User.findOneAndUpdate(
      { user_id, role: 'driver' },
      { is_active: false },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: `Driver ${user_id} not found` });
    }

    res.status(200).json({ success: true, message: `Driver ${user_id} deactivated` });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/drivers/:user_id/assign-bus
const assignBus = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { bus_id } = req.body;

    if (!bus_id) {
      return res.status(400).json({ success: false, message: 'bus_id is required' });
    }

    // Verify driver exists
    const driver = await User.findOne({ user_id, role: 'driver', is_active: true });
    if (!driver) {
      return res.status(404).json({ success: false, message: `Driver ${user_id} not found` });
    }

    // Verify bus exists and isn't already assigned to another driver
    const bus = await Bus.findOne({ bus_id, is_active: true });
    if (!bus) {
      return res.status(404).json({ success: false, message: `Bus ${bus_id} not found` });
    }

    if (bus.driver_id && bus.driver_id !== user_id) {
      return res.status(400).json({
        success: false,
        message: `Bus ${bus_id} is already assigned to driver ${bus.driver_id}. Unassign first.`,
      });
    }

    // Unassign driver's current bus (if any)
    if (driver.assigned_bus_id && driver.assigned_bus_id !== bus_id) {
      await Bus.findOneAndUpdate(
        { bus_id: driver.assigned_bus_id },
        { driver_id: null }
      );
    }

    // Do the assignment — both sides updated
    await Promise.all([
      User.findOneAndUpdate({ user_id }, { assigned_bus_id: bus_id }),
      Bus.findOneAndUpdate({ bus_id }, { driver_id: user_id }),
    ]);

    res.status(200).json({
      success: true,
      message: `Bus ${bus_id} assigned to driver ${user_id}`,
      data: { user_id, bus_id },
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════
// BUS MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/buses
const getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({ is_active: true }).sort({ bus_id: 1 }).lean();

    // Enrich with driver + route info
    const enriched = await Promise.all(
      buses.map(async (bus) => {
        const [driver, route] = await Promise.all([
          bus.driver_id ? User.findOne({ user_id: bus.driver_id }).lean() : null,
          bus.route_id  ? Route.findOne({ route_id: bus.route_id }).lean() : null,
        ]);
        return {
          ...bus,
          driver: driver ? { user_id: driver.user_id, name: driver.name, phone: driver.phone } : null,
          route:  route  ? { route_id: route.route_id, route_name: route.route_name }           : null,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/buses
const createBus = async (req, res, next) => {
  try {
    const { bus_number, license_plate, capacity, route_id } = req.body;

    if (!bus_number || !license_plate || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'bus_number, license_plate, and capacity are required',
      });
    }

    // Verify route if provided
    if (route_id) {
      const route = await Route.findOne({ route_id, is_active: true });
      if (!route) {
        return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
      }
    }

    const bus_id = generateId('B');

    const bus = await Bus.create({
      bus_id,
      bus_number,
      license_plate,
      capacity: parseInt(capacity),
      route_id: route_id || null,
      status: 'inactive',
    });

    res.status(201).json({ success: true, message: 'Bus created', data: bus });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/buses/:bus_id
const updateBus = async (req, res, next) => {
  try {
    const { bus_id } = req.params;
    const updates = req.body;

    delete updates.bus_id;

    const bus = await Bus.findOneAndUpdate(
      { bus_id, is_active: true },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({ success: false, message: `Bus ${bus_id} not found` });
    }

    res.status(200).json({ success: true, message: 'Bus updated', data: bus });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/buses/:bus_id  (soft delete)
const deleteBus = async (req, res, next) => {
  try {
    const { bus_id } = req.params;

    // Block if bus has an ongoing trip
    const activeTrip = await Trip.findOne({ bus_id, trip_status: 'ongoing' });
    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: `Bus has an ongoing trip (${activeTrip.trip_id}). Stop the trip first.`,
      });
    }

    const bus = await Bus.findOneAndUpdate(
      { bus_id },
      { is_active: false, status: 'inactive' },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ success: false, message: `Bus ${bus_id} not found` });
    }

    // Unassign the driver
    if (bus.driver_id) {
      await User.findOneAndUpdate(
        { user_id: bus.driver_id },
        { assigned_bus_id: null }
      );
    }

    res.status(200).json({ success: true, message: `Bus ${bus_id} deactivated` });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════
// STOP MANAGEMENT
// ══════════════════════════════════════════════════════════════════

// GET /api/admin/stops
const getAllStops = async (req, res, next) => {
  try {
    const { route_id } = req.query;
    const query = { is_active: true };
    if (route_id) query.route_id = route_id;

    const stops = await Stop.find(query)
      .sort({ route_id: 1, stop_order: 1 })
      .lean();

    res.status(200).json({ success: true, count: stops.length, data: stops });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/stops  (standalone stop creation)
const createStop = async (req, res, next) => {
  try {
    const { route_id, stop_name, stop_order, latitude, longitude, distance_from_start_km } = req.body;

    if (!route_id || !stop_name || !stop_order || latitude == null || longitude == null || distance_from_start_km == null) {
      return res.status(400).json({
        success: false,
        message: 'route_id, stop_name, stop_order, latitude, longitude, distance_from_start_km are required',
      });
    }

    const route = await Route.findOne({ route_id, is_active: true });
    if (!route) {
      return res.status(404).json({ success: false, message: `Route ${route_id} not found` });
    }

    const stop_id = generateId('S');

    const stop = await Stop.create({
      stop_id,
      route_id,
      stop_name,
      stop_order: parseInt(stop_order),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distance_from_start_km: parseFloat(distance_from_start_km),
    });

    res.status(201).json({ success: true, message: 'Stop created', data: stop });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Dashboard
  getStats,
  getActiveTrips,
  // Routes
  createRoute,
  updateRoute,
  deleteRoute,
  addStop,
  // Drivers
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  assignBus,
  // Buses
  getAllBuses,
  createBus,
  updateBus,
  deleteBus,
  // Stops
  getAllStops,
  createStop,
};