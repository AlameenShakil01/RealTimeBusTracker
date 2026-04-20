const express = require('express');
const router = express.Router();
const { login, logout, refresh, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');

// POST /api/auth/login    — hidden in UI (Settings → Partner Login)
router.post('/login', login);

// POST /api/auth/logout   — clears session signal
router.post('/logout', protect, logout);

// POST /api/auth/refresh  — get new access token using refresh token
router.post('/refresh', refresh);

// GET  /api/auth/me       — get current user profile
router.get('/me', protect, getMe);

module.exports = router;