const Route = require('../models/Route');
const Stop = require('../models/Stop');

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/routes
// @access  Public
// Returns all active routes
// ─────────────────────────────────────────────────────────────────
const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ is_active: true })
      .sort({ route_id: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/routes/search?source=X&destination=Y
// @access  Public
// Search routes by matching start/end points (case-insensitive)
// ─────────────────────────────────────────────────────────────────
const searchRoutes = async (req, res, next) => {
  try {
    const { source, destination, q } = req.query;

    let query = { is_active: true };

    if (q) {
      // Generic search — matches route_name, start_point, or end_point
      const regex = new RegExp(q, 'i');
      query.$or = [
        { route_name: regex },
        { start_point: regex },
        { end_point: regex },
      ];
    } else {
      // Specific source/destination search
      if (source) {
        query.$or = query.$or || [];
        query.start_point = new RegExp(source, 'i');
      }
      if (destination) {
        query.end_point = new RegExp(destination, 'i');
      }
    }

    const routes = await Route.find(query).lean();

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/routes/:route_id
// @access  Public
// Returns route details + all its stops ordered by stop_order
// ─────────────────────────────────────────────────────────────────
const getRouteById = async (req, res, next) => {
  try {
    const { route_id } = req.params;

    const route = await Route.findOne({ route_id, is_active: true }).lean();

    if (!route) {
      return res.status(404).json({
        success: false,
        message: `Route ${route_id} not found`,
      });
    }

    // Fetch all stops for this route, ordered
    const stops = await Stop.find({ route_id, is_active: true })
      .sort({ stop_order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...route,
        stops,
        total_stops: stops.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRoutes, searchRoutes, getRouteById };