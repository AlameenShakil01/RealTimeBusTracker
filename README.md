# 🚌 RealTimeBusTracker

A full-stack, cross-platform mobile application for real-time public bus tracking. Built for Tier-2/3 cities where commuters need live bus locations and ETAs without expensive hardware — just a driver's smartphone.

---

## 📸 Overview

| Role | What They Get |
|------|--------------|
| **Commuter** | Search routes, view live bus on map, get ETA — no login needed |
| **Driver** | Start/stop trips, broadcast GPS every 5 seconds via WebSocket |
| **Admin** | Manage fleet, routes, drivers — full CRUD dashboard |

---

## 🏗️ Architecture

```
RealTimeBusTracker/
├── bus-tracker-backend/     # Node.js + Express + MongoDB + Socket.IO
└── bus-tracker-frontend/    # React Native + Expo SDK 54
```
 
### Backend Folder Structure
 
```
bus-tracker-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection (Mongoose)
│   │   ├── jwt.js               # JWT secret & helpers
│   │   └── socket.js            # Socket.IO instance setup
│   ├── models/
│   │   ├── User.js              # users collection
│   │   ├── Bus.js               # buses collection
│   │   ├── Route.js             # routes collection
│   │   ├── Stop.js              # stops collection
│   │   ├── Trip.js              # trips collection
│   │   ├── GPSLog.js            # gps_logs collection
│   │   └── StopArrival.js       # stop_arrivals collection
│   ├── controllers/
│   │   ├── authController.js    # login / logout / refresh
│   │   ├── routeController.js   # route CRUD
│   │   ├── busController.js     # bus operations
│   │   ├── tripController.js    # trip start / stop / history
│   │   └── adminController.js   # admin dashboard + management
│   ├── routes/
│   │   ├── publicRoutes.js      # No auth — commuter APIs
│   │   ├── authRoutes.js        # Login / logout
│   │   ├── driverRoutes.js      # Driver-only endpoints
│   │   └── adminRoutes.js       # Admin-only endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # role === driver | admin
│   │   └── errorHandler.js      # Global error handler
│   ├── services/
│   │   ├── etaService.js        # Haversine ETA calculation
│   │   └── locationService.js   # Distance / nearby bus utils
│   ├── socket/
│   │   └── gpsHandler.js        # WS: receive GPS, broadcast to rooms
│   └── utils/
│       ├── distance.js          # Haversine formula
│       ├── idGenerator.js       # Human-readable ID generator
│       └── constants.js         # App-wide constants
├── .env.example
├── .gitignore
├── package.json
└── server.js                    # Entry point
```
 
### Frontend Folder Structure
 
```
bus-tracker-frontend/
├── src/
│   ├── screens/
│   │   ├── public/
│   │   │   ├── SplashScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── SettingsScreen.js
│   │   │   ├── SearchResultsScreen.js
│   │   │   ├── RouteDetailsScreen.js
│   │   │   └── LiveTrackingScreen.js
│   │   ├── auth/
│   │   │   └── PartnerLoginScreen.js
│   │   ├── driver/
│   │   │   ├── DriverDashboard.js
│   │   │   ├── ActiveTripScreen.js
│   │   │   └── TripHistoryScreen.js
│   │   └── admin/
│   │       ├── AdminDashboard.js
│   │       ├── FleetManagementScreen.js
│   │       ├── RouteManagementScreen.js
│   │       ├── DriverManagementScreen.js
│   │       └── AnalyticsScreen.js
│   ├── navigation/
│   │   ├── PublicNavigator.js
│   │   ├── DriverNavigator.js
│   │   ├── AdminNavigator.js
│   │   └── RootNavigator.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   ├── api.js
│   │   └── locationService.js
│   ├── components/
│   │   ├── GlassCard.js
│   │   ├── GlassButton.js
│   │   ├── RouteItem.js
│   │   └── Header.js
│   ├── theme/
│   │   ├── colors.js
│   │   ├── spacing.js
│   │   └── glass.js
│   └── utils/
│       └── constants.js
├── App.js
├── package.json
├── babel.config.js
└── app.json
```


### Data Flow

```
Driver Phone (GPS)
      │
      ▼ Socket.IO (every 5s)
  Backend Server
      │  ├─ Saves to gps_logs (MongoDB)
      │  └─ Broadcasts to room bus:{bus_id}
      ▼
  Commuter App
  (Live map update < 10s)
```

---

## ⚙️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.IO 4.x |
| Auth | JWT + bcryptjs (RBAC) |
| Security | helmet + cors |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 54) |
| Maps | react-native-maps (Google Maps) |
| Navigation | React Navigation v6 |
| Real-Time | socket.io-client |
| HTTP | Axios |
| Location | expo-location |

---

## 🗄️ Database Schema (7 Collections)

```
users          → drivers & admins (JWT auth + RBAC)
buses          → fleet info, assigned route & driver
routes         → route metadata, distance, estimated time
stops          → ordered stops per route with lat/lng
trips          → active & completed trip records
gps_logs       → high-frequency GPS stream (1 doc / 5s per bus)
stop_arrivals  → actual arrival times per stop (ETA training data)
```

Human-readable IDs throughout: `U001`, `B102`, `R12`, `T789`, `S101`

---

## 📡 API Reference (33 Endpoints)

### Public — No Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | All active routes |
| GET | `/api/routes/search?source=X&dest=Y` | Search routes |
| GET | `/api/routes/:id` | Route + stops |
| GET | `/api/buses` | All buses |
| GET | `/api/buses/:id/location` | Latest GPS coords |
| GET | `/api/trips/active` | All ongoing trips |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | `{ phone, password }` → JWT |
| POST | `/api/auth/logout` | Invalidate token |
| POST | `/api/auth/refresh` | Refresh JWT |

### Driver — JWT Required
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/driver/profile` | Driver info |
| GET | `/api/driver/assigned-bus` | Bus + route |
| POST | `/api/trips/start` | Begin trip |
| POST | `/api/trips/:id/stop` | End trip |
| POST | `/api/trips/:id/location` | REST GPS update |
| GET | `/api/trips/history` | Past trips |

### Admin — JWT Required (17 endpoints)
Routes, buses, drivers, stops — full CRUD. See [Backend Reference](bus-tracker-backend/README.md).

---

## 🌐 WebSocket Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `subscribe-bus` | `{ bus_id }` |
| Client → Server | `location-update` | `{ trip_id, bus_id, lat, lng, speed_kmph, bearing }` |
| Server → Client | `bus-location` | `{ bus_id, lat, lng, speed_kmph, timestamp }` |
| Server → Client | `trip-status` | `{ trip_id, status, bus_id }` |

---

## 📱 Screens (13 Total)

### Public (6)
- **SplashScreen** — Branding, auto-redirect
- **HomeScreen** — Source/destination search
- **SearchResultsScreen** — Route cards list
- **RouteDetailsScreen** — Stops, distance, active buses
- **LiveTrackingScreen** — Live map with moving bus marker ⭐
- **SettingsScreen** — Hidden partner login (tap logo 5×)

### Auth (1)
- **PartnerLoginScreen** — Phone + password, role-based redirect

### Driver (3)
- **DriverDashboard** — Start/stop trip, GPS status
- **ActiveTripScreen** — Live GPS broadcast every 5s
- **TripHistoryScreen** — Past trips list

### Admin (3)
- **AdminDashboard** — Stats, real-time fleet overview
- **FleetManagementScreen** — Bus CRUD
- **RouteManagementScreen** — Route + stop management
- **DriverManagementScreen** — Driver CRUD + bus assignment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/RealTimeBusTracker.git
cd RealTimeBusTracker
```

### 2. Backend Setup

```bash
cd bus-tracker-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev
# Server starts on http://localhost:3000
```

### 3. Frontend Setup

```bash
cd bus-tracker-frontend
npm install --legacy-peer-deps
npx expo start
# Scan QR with Expo Go app
```

### 4. Environment Variables

Copy `bus-tracker-backend/.env.example` and fill in:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/bus_tracker
JWT_SECRET=your-secret-here
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=another-secret-here
REFRESH_TOKEN_EXPIRE=7d
```

---

## 🧪 Test Credentials

| Role | Phone | Password |
|------|-------|----------|
| Driver | `9876543210` | `driver123` |
| Admin | `9999999999` | `admin123` |

> **Hidden login:** Open the app → Settings → Tap the logo 5 times

---

## 🔐 Security

- JWT access tokens (24h) + refresh tokens (7d)
- bcrypt password hashing
- Role-based middleware on all protected routes
- Hidden login UI — no visible login prompt for commuters
- helmet.js security headers

---

## 📊 Non-Functional Targets

| Metric | Target |
|--------|--------|
| GPS update latency | < 10 seconds |
| Driver data usage | < 20MB per 8hr shift |
| Battery drain (driver) | < 15% per hour |
| Commuter entry | ≤ 2 taps from app open |


## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
