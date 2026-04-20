const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { startTrip, stopTrip, updateLocation, getTripHistory } = require('../controllers/tripController');
const User = require('../models/User');
const Bus = require('../models/Bus');

// All driver routes require JWT + driver role
const driverOnly = [protect, roleCheck('driver')];

// ── Driver profile ────────────────────────────────────────────────
// GET /api/driver/profile
router.get('/driver/profile', ...driverOnly, async (req, res, next) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

// GET /api/driver/assigned-bus
router.get('/driver/assigned-bus', ...driverOnly, async (req, res, next) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id }).lean();
    if (!user?.assigned_bus_id) {
      return res.status(404).json({ success: false, message: 'No bus assigned to this driver' });
    }
    const bus = await Bus.findOne({ bus_id: user.assigned_bus_id }).lean();
    if (!bus) return res.status(404).json({ success: false, message: 'Assigned bus not found' });
    res.json({ success: true, data: bus });
  } catch (e) { next(e); }
});

// ── Trip management ───────────────────────────────────────────────
router.post('/trips/start', ...driverOnly, startTrip);           // POST /api/trips/start
router.post('/trips/:trip_id/stop', ...driverOnly, stopTrip);    // POST /api/trips/:id/stop
router.post('/trips/:trip_id/location', ...driverOnly, updateLocation); // POST /api/trips/:id/location
router.get('/trips/history', ...driverOnly, getTripHistory);     // GET  /api/trips/history

module.exports = router;