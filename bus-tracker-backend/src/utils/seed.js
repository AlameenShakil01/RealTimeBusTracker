// ─────────────────────────────────────────────────────────────────
//  Seed Script — Run once to populate test data
//  Usage: node src/utils/seed.js
// ─────────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding\n');
};

// ── Seed Data ─────────────────────────────────────────────────────

const users = [
  {
    user_id: 'U001',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    password: 'driver123',
    role: 'driver',
    license_number: 'RJ-2023-9988',
    assigned_bus_id: 'B102',
  },
  {
    user_id: 'U002',
    name: 'Suresh Singh',
    phone: '9876543211',
    password: 'driver456',
    role: 'driver',
    license_number: 'RJ-2022-7654',
    assigned_bus_id: 'B205',
  },
  {
    user_id: 'U003',
    name: 'Admin User',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
  },
];

const routes = [
  {
    route_id: 'R12',
    route_name: 'Railway Station → Mansarovar',
    start_point: 'Railway Station',
    end_point: 'Mansarovar',
    total_distance_km: 18.5,
    estimated_time_min: 45,
  },
  {
    route_id: 'R24',
    route_name: 'Central Bus Stand → Airport',
    start_point: 'Central Bus Stand',
    end_point: 'International Airport',
    total_distance_km: 25.0,
    estimated_time_min: 60,
  },
];

const stops = [
  // Route R12 stops
  { stop_id: 'S101', route_id: 'R12', stop_name: 'Railway Station',  stop_order: 1,  latitude: 26.9193, longitude: 75.7889, distance_from_start_km: 0.0 },
  { stop_id: 'S102', route_id: 'R12', stop_name: 'Sindhi Camp',      stop_order: 2,  latitude: 26.9124, longitude: 75.7873, distance_from_start_km: 1.2 },
  { stop_id: 'S103', route_id: 'R12', stop_name: 'MI Road',          stop_order: 3,  latitude: 26.9167, longitude: 75.7789, distance_from_start_km: 3.5 },
  { stop_id: 'S104', route_id: 'R12', stop_name: 'Ajmeri Gate',      stop_order: 4,  latitude: 26.9203, longitude: 75.7712, distance_from_start_km: 5.8 },
  { stop_id: 'S105', route_id: 'R12', stop_name: 'Tonk Road',        stop_order: 5,  latitude: 26.9001, longitude: 75.7698, distance_from_start_km: 8.3 },
  { stop_id: 'S106', route_id: 'R12', stop_name: 'Jawahar Circle',   stop_order: 6,  latitude: 26.8892, longitude: 75.7654, distance_from_start_km: 11.0 },
  { stop_id: 'S107', route_id: 'R12', stop_name: 'Mansarovar',       stop_order: 7,  latitude: 26.8726, longitude: 75.7562, distance_from_start_km: 18.5 },
  // Route R24 stops
  { stop_id: 'S201', route_id: 'R24', stop_name: 'Central Bus Stand',  stop_order: 1,  latitude: 26.9215, longitude: 75.7873, distance_from_start_km: 0.0 },
  { stop_id: 'S202', route_id: 'R24', stop_name: 'Bani Park',          stop_order: 2,  latitude: 26.9312, longitude: 75.7756, distance_from_start_km: 3.2 },
  { stop_id: 'S203', route_id: 'R24', stop_name: 'Sodala',             stop_order: 3,  latitude: 26.9423, longitude: 75.7534, distance_from_start_km: 8.7 },
  { stop_id: 'S204', route_id: 'R24', stop_name: 'International Airport', stop_order: 4, latitude: 26.9893, longitude: 75.7123, distance_from_start_km: 25.0 },
];

const buses = [
  {
    bus_id: 'B102',
    bus_number: 'RJ14-PA-4567',
    license_plate: 'RJ14PA4567',
    route_id: 'R12',
    driver_id: 'U001',
    capacity: 50,
    status: 'active',
  },
  {
    bus_id: 'B205',
    bus_number: 'RJ14-PA-8910',
    license_plate: 'RJ14PA8910',
    route_id: 'R24',
    driver_id: 'U002',
    capacity: 45,
    status: 'active',
  },
];

// ── Run Seed ──────────────────────────────────────────────────────

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Bus.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert routes
    const createdRoutes = await Route.insertMany(routes);
    console.log(`✅ ${createdRoutes.length} routes inserted`);

    // Insert stops
    const createdStops = await Stop.insertMany(stops);
    console.log(`✅ ${createdStops.length} stops inserted`);

    // Insert buses
    const createdBuses = await Bus.insertMany(buses);
    console.log(`✅ ${createdBuses.length} buses inserted`);

    // Insert users (password hashing runs via pre-save hook)
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // triggers bcrypt hash
    }
    console.log(`✅ ${users.length} users inserted (passwords hashed)`);

    console.log('\n🎉 Seed complete! Test credentials:');
    console.log('─────────────────────────────────────────');
    console.log('  Driver 1 → phone: 9876543210  password: driver123');
    console.log('  Driver 2 → phone: 9876543211  password: driver456');
    console.log('  Admin    → phone: 9999999999  password: admin123');
    console.log('─────────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

seed();