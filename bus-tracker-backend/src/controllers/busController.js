const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Trip = require('../models/Trip');
const { getLatestBusLocation, getAllActiveBusLocations, findNearbyBuses } = require('../services/locationService');
const { calculateRouteETA } = require('../services/etaService');

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/buses
// @access  Public
// Returns all active buses with their current status
// ─────────────────────────────────────────────────────────────────
const getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({ is_active: true }).lean();

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/buses/:bus_id
// @access  Public
// Returns a single bus with its route info
// ─────────────────────────────────────────────────────────────────
const getBusById = async (req, res, next) => {
  try {
    const { bus_id } = req.params;

    const bus = await Bus.findOne({ bus_id, is_active: true }).lean();

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus ${bus_id} not found`,
      });
    }

    // Attach route info if available
    let route = null;
    if (bus.route_id) {
      route = await Route.findOne({ route_id: bus.route_id }).lean();
    }

    res.status(200).json({
      success: true,
      data: { ...bus, route },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/buses/:bus_id/location
// @access  Public
// Returns latest GPS coordinates for a bus + ETA to all upcoming stops
// ─────────────────────────────────────────────────────────────────
const getBusLocation = async (req, res, next) => {
  try {
    const { bus_id } = req.params;

    // Verify bus exists
    const bus = await Bus.findOne({ bus_id, is_active: true }).lean();
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus ${bus_id} not found`,
      });
    }

    // Get latest GPS location
    const location = await getLatestBusLocation(bus_id);

    if (!location) {
      return res.status(200).json({
        success: true,
        message: 'Bus has no active location data. It may not be on a trip.',
        data: {
          bus_id,
          location: null,
          eta_to_stops: [],
        },
      });
    }

    // Get upcoming stops for ETA calculation
    let eta_to_stops = [];
    if (bus.route_id) {
      const stops = await Stop.find({ route_id: bus.route_id, is_active: true })
        .sort({ stop_order: 1 })
        .lean();

      eta_to_stops = calculateRouteETA(location, stops);
    }

    res.status(200).json({
      success: true,
      data: {
        bus_id,
        bus_number: bus.bus_number,
        route_id: bus.route_id,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          speed_kmph: location.speed_kmph,
          bearing: location.bearing,
          timestamp: location.timestamp,
        },
        eta_to_stops,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/buses/nearby?lat=X&lng=Y&radius=5
// @access  Public
// Returns buses within radius (km) of a coordinate
// ─────────────────────────────────────────────────────────────────
const getNearbyBuses = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query params are required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng must be valid numbers',
      });
    }

    // Get all active bus locations
    const locationMap = await getAllActiveBusLocations();

    // Filter by radius
    const nearbyLocations = findNearbyBuses(userLat, userLng, radiusKm, locationMap);

    if (nearbyLocations.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No active buses found within ${radiusKm}km`,
        count: 0,
        data: [],
      });
    }

    // Enrich with bus details
    const busIds = nearbyLocations.map((l) => l.bus_id);
    const buses = await Bus.find({ bus_id: { $in: busIds } }).lean();
    const busMap = buses.reduce((m, b) => { m[b.bus_id] = b; return m; }, {});

    const enriched = nearbyLocations.map((loc) => ({
      ...busMap[loc.bus_id],
      current_location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed_kmph: loc.speed_kmph,
        timestamp: loc.timestamp,
      },
      distance_km: loc.distance_km,
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBuses, getBusById, getBusLocation, getNearbyBuses };