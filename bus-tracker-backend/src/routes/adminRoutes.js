const express = require('express');
const router = express.Router();
const protect   = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const {
  getStats, getActiveTrips,
  createRoute, updateRoute, deleteRoute, addStop,
  getAllDrivers, createDriver, updateDriver, deleteDriver, assignBus,
  getAllBuses, createBus, updateBus, deleteBus,
  getAllStops, createStop,
} = require('../controllers/adminController');

// Every admin route: JWT required + must be admin role
const adminOnly = [protect, roleCheck('admin')];

// ── Dashboard ─────────────────────────────────────────────────────
router.get('/stats',         ...adminOnly, getStats);         // GET  /api/admin/stats
router.get('/active-trips',  ...adminOnly, getActiveTrips);   // GET  /api/admin/active-trips

// ── Route management ─────────────────────────────────────────────
router.get   ('/routes',               ...adminOnly, (req, res, next) => {
  // Reuse public getAllRoutes but from admin context (sees inactive too)
  const Route = require('../models/Route');
  Route.find().sort({ route_id: 1 }).lean()
    .then(routes => res.json({ success: true, count: routes.length, data: routes }))
    .catch(next);
});
router.post  ('/routes',               ...adminOnly, createRoute);   // POST   /api/admin/routes
router.put   ('/routes/:route_id',     ...adminOnly, updateRoute);   // PUT    /api/admin/routes/:id
router.delete('/routes/:route_id',     ...adminOnly, deleteRoute);   // DELETE /api/admin/routes/:id
router.post  ('/routes/:route_id/stops', ...adminOnly, addStop);     // POST   /api/admin/routes/:id/stops

// ── Driver management ─────────────────────────────────────────────
router.get   ('/drivers',              ...adminOnly, getAllDrivers);  // GET    /api/admin/drivers
router.post  ('/drivers',              ...adminOnly, createDriver);  // POST   /api/admin/drivers
router.put   ('/drivers/:user_id',     ...adminOnly, updateDriver);  // PUT    /api/admin/drivers/:id
router.delete('/drivers/:user_id',     ...adminOnly, deleteDriver);  // DELETE /api/admin/drivers/:id
router.post  ('/drivers/:user_id/assign-bus', ...adminOnly, assignBus); // POST /api/admin/drivers/:id/assign-bus

// ── Bus management ────────────────────────────────────────────────
router.get   ('/buses',                ...adminOnly, getAllBuses);    // GET    /api/admin/buses
router.post  ('/buses',                ...adminOnly, createBus);     // POST   /api/admin/buses
router.put   ('/buses/:bus_id',        ...adminOnly, updateBus);     // PUT    /api/admin/buses/:id
router.delete('/buses/:bus_id',        ...adminOnly, deleteBus);     // DELETE /api/admin/buses/:id

// ── Stop management ───────────────────────────────────────────────
router.get ('/stops',                  ...adminOnly, getAllStops);   // GET    /api/admin/stops
router.post('/stops',                  ...adminOnly, createStop);   // POST   /api/admin/stops

module.exports = router;