const jwt = require('jsonwebtoken');

// Sign a new access token
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Sign a refresh token
const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

// Verify an access token — returns decoded payload or throws
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify a refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

module.exports = { signToken, signRefreshToken, verifyToken, verifyRefreshToken };