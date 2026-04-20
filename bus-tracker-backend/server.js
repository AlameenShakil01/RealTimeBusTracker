// ─────────────────────────────────────────────────────────────────
//  BusTracker Backend — server.js (Entry Point)
//  Real-Time Public Transport Tracking System
// ─────────────────────────────────────────────────────────────────

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const connectDB = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');

// ── Route imports ────────────────────────────────────────────────
const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// ── App setup ────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app); // needed for Socket.IO

// ── Connect Database ─────────────────────────────────────────────
connectDB();

// ── Initialize Socket.IO ─────────────────────────────────────────
const io = initSocket(httpServer);

// Attach io to app so controllers can access it via req.app.get('io')
app.set('io', io);

// ── Core Middleware ───────────────────────────────────────────────
app.use(helmet());           // Security headers
app.use(compression());      // Gzip responses
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());              // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// ── Request Logger (dev only) ─────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── API Routes ────────────────────────────────────────────────────
app.use('/api', publicRoutes);          // GET /api/routes, /api/buses, etc.
app.use('/api/auth', authRoutes);       // POST /api/auth/login, logout, refresh
app.use('/api', driverRoutes);          // GET /api/driver/..., POST /api/trips/...
app.use('/api/admin', adminRoutes);     // GET/POST /api/admin/...

// ── Socket stats endpoint (dev/admin use) ─────────────────────────
app.get('/api/socket/stats', (req, res) => {
  const io = req.app.get('io');
  res.json({
    success: true,
    data: {
      total_connected: io.engine.clientsCount,
      rooms: [...io.sockets.adapter.rooms.keys()].filter(r => r.startsWith('bus:')),
    }
  });
});

// ── Root health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚌 BusTracker API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      public: '/api',
      auth: '/api/auth',
      driver: '/api/driver  |  /api/trips',
      admin: '/api/admin',
    },
  });
});

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ── Global Error Handler (must be last) ──────────────────────────
app.use(errorHandler);

// ── Socket.IO GPS Handler ─────────────────────────────────────────
const gpsHandler = require('./src/socket/gpsHandler');
gpsHandler(io);

// ── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('');
  console.log('🚌 ─────────────────────────────────────────────');
  console.log(`🚌  BusTracker Backend running`);
  console.log(`🚌  Port     : ${PORT}`);
  console.log(`🚌  Mode     : ${process.env.NODE_ENV}`);
  console.log(`🚌  API      : http://localhost:${PORT}`);
  console.log(`🚌  Health   : http://localhost:${PORT}/`);
  console.log('🚌 ─────────────────────────────────────────────');
  console.log('');
});