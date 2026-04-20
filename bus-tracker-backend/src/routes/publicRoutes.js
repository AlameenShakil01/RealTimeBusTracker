const express = require('express');
const router = express.Router();

const { getAllRoutes, searchRoutes, getRouteById } = require('../controllers/routeController');
const { getAllBuses, getBusById, getBusLocation, getNearbyBuses } = require('../controllers/busController');
const { getActiveTrips } = require('../controllers/tripController');

// ── Route endpoints ───────────────────────────────────────────────
// ORDER MATTERS: /routes/search must be before /routes/:route_id
// otherwise Express matches "search" as a route_id param
router.get('/routes/search', searchRoutes);          // GET /api/routes/search?source=X&destination=Y
router.get('/routes', getAllRoutes);                  // GET /api/routes
router.get('/routes/:route_id', getRouteById);        // GET /api/routes/R12

// ── Bus endpoints ─────────────────────────────────────────────────
// ORDER MATTERS: /buses/nearby before /buses/:bus_id
router.get('/buses/nearby', getNearbyBuses);          // GET /api/buses/nearby?lat=X&lng=Y&radius=5
router.get('/buses', getAllBuses);                    // GET /api/buses
router.get('/buses/:bus_id', getBusById);             // GET /api/buses/B102
router.get('/buses/:bus_id/location', getBusLocation);// GET /api/buses/B102/location

// ── Trip endpoints ────────────────────────────────────────────────
router.get('/trips/active', getActiveTrips);          // GET /api/trips/active

module.exports = router;