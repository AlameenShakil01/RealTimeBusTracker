const User = require('../models/User');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public (but hidden in UI — Settings → Partner Login)
// ─────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // 1. Basic validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required',
      });
    }

    // 2. Find user — explicitly select password (it's hidden by default)
    const user = await User.findOne({ phone, is_active: true }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 3. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 4. Build token payload
    const payload = {
      user_id: user.user_id,
      role: user.role,
      phone: user.phone,
    };

    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    // 5. Send response
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
      token,
      refreshToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        assigned_bus_id: user.assigned_bus_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
// Note: JWT is stateless — logout is handled on the client by
// deleting the token. This endpoint is a clean signal to the app.
// ─────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete token on client.',
  });
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/refresh
// @access  Public (called with refresh token when access token expires)
// ─────────────────────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check user still exists and is active
    const user = await User.findOne({ user_id: decoded.user_id, is_active: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or is inactive',
      });
    }

    // Issue new access token
    const payload = {
      user_id: user.user_id,
      role: user.role,
      phone: user.phone,
    };

    const newToken = signToken(payload);

    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private — returns currently logged-in user's profile
// ─────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id, is_active: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        license_number: user.license_number,
        assigned_bus_id: user.assigned_bus_id,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, refresh, getMe };