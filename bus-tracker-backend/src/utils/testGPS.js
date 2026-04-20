// ─────────────────────────────────────────────────────────────────
//  GPS Flow Test Script
//  Simulates the full real-time tracking flow:
//  1. Login as driver → get token
//  2. Start a trip via REST
//  3. Connect to Socket.IO as driver
//  4. Emit GPS location every 3 seconds (10 pings total)
//  5. In parallel, connect as commuter and print received updates
//
//  Usage: node src/utils/testGPS.js
//  Requires: server running on localhost:3000 + seeded DB
// ─────────────────────────────────────────────────────────────────

const { io: SocketClient } = require('socket.io-client');

const BASE_URL = 'http://localhost:3000';
const DRIVER_PHONE = '9876543210';
const DRIVER_PASS = 'driver123';
const BUS_ID = 'B102';
const ROUTE_ID = 'R12';

// Simulated route coordinates — Jaipur Railway Station → Mansarovar
const ROUTE_COORDS = [
  { lat: 26.9193, lng: 75.7889, speed: 0   },
  { lat: 26.9180, lng: 75.7878, speed: 15  },
  { lat: 26.9167, lng: 75.7856, speed: 28  },
  { lat: 26.9150, lng: 75.7834, speed: 32  },
  { lat: 26.9136, lng: 75.7812, speed: 35  },
  { lat: 26.9124, lng: 75.7798, speed: 30  },
  { lat: 26.9110, lng: 75.7776, speed: 25  },
  { lat: 26.9098, lng: 75.7754, speed: 28  },
  { lat: 26.9085, lng: 75.7731, speed: 32  },
  { lat: 26.9072, lng: 75.7710, speed: 20  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Step 1: Login ─────────────────────────────────────────────────
async function loginDriver() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: DRIVER_PHONE, password: DRIVER_PASS }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Login failed: ${data.message}`);
  console.log(`✅ Logged in as: ${data.user.name} (${data.user.role})`);
  return data.token;
}

// ── Step 2: Start Trip ────────────────────────────────────────────
async function startTrip(token) {
  const res = await fetch(`${BASE_URL}/api/trips/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bus_id: BUS_ID, route_id: ROUTE_ID }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Start trip failed: ${data.message}`);
  console.log(`✅ Trip started: ${data.data.trip_id}`);
  return data.data.trip_id;
}

// ── Step 3: Stop Trip ─────────────────────────────────────────────
async function stopTrip(token, trip_id) {
  const res = await fetch(`${BASE_URL}/api/trips/${trip_id}/stop`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Stop trip failed: ${data.message}`);
  console.log(`✅ Trip stopped at: ${data.data.completed_at}`);
}

// ── Main test flow ────────────────────────────────────────────────
async function runTest() {
  console.log('\n🚌 ─── BusTracker GPS Flow Test ───────────────────────\n');

  // Step 1: Login
  const token = await loginDriver();

  // Step 2: Start trip
  const trip_id = await startTrip(token);

  // Step 3: Connect COMMUTER socket (no auth)
  console.log('\n👁️  Connecting commuter socket...');
  const commuterSocket = SocketClient(BASE_URL);

  commuterSocket.on('connect', () => {
    console.log(`✅ Commuter connected: ${commuterSocket.id}`);
    commuterSocket.emit('subscribe-bus', { bus_id: BUS_ID });
  });

  commuterSocket.on('subscribed', (data) => {
    console.log(`✅ Commuter subscribed: ${data.message}`);
  });

  commuterSocket.on('bus-location', (data) => {
    if (data.is_initial) {
      console.log(`   📍 [INITIAL] lat:${data.latitude} lng:${data.longitude}`);
    } else {
      console.log(`   📍 [LIVE] lat:${data.latitude} lng:${data.longitude} speed:${data.speed_kmph}km/h`);
    }
  });

  commuterSocket.on('bus-no-data', (data) => {
    console.log(`   ℹ️  ${data.message}`);
  });

  commuterSocket.on('bus-signal-lost', (data) => {
    console.log(`   ⚠️  Signal lost: ${data.message}`);
  });

  await sleep(1000); // wait for commuter to connect

  // Step 4: Connect DRIVER socket (with JWT auth)
  console.log('\n🚌 Connecting driver socket...');
  const driverSocket = SocketClient(BASE_URL, {
    auth: { token },
  });

  driverSocket.on('connect', () => {
    console.log(`✅ Driver connected: ${driverSocket.id}`);

    // Register the active trip
    driverSocket.emit('register-trip', { trip_id, bus_id: BUS_ID });
  });

  driverSocket.on('trip-registered', (data) => {
    console.log(`✅ ${data.message}`);
  });

  driverSocket.on('location-ack', (data) => {
    process.stdout.write('.');  // dot per ack — shows real-time delivery
  });

  driverSocket.on('error', (err) => {
    console.error(`❌ Driver socket error: ${err.message}`);
  });

  await sleep(1000);

  // Step 5: Send GPS pings along simulated route
  console.log(`\n📡 Sending ${ROUTE_COORDS.length} GPS pings (3s interval)...\n`);

  for (let i = 0; i < ROUTE_COORDS.length; i++) {
    const coord = ROUTE_COORDS[i];
    const bearing = i > 0
      ? Math.round(Math.atan2(
          ROUTE_COORDS[i].lng - ROUTE_COORDS[i - 1].lng,
          ROUTE_COORDS[i].lat - ROUTE_COORDS[i - 1].lat
        ) * (180 / Math.PI))
      : 0;

    driverSocket.emit('location-update', {
      trip_id,
      bus_id: BUS_ID,
      latitude: coord.lat,
      longitude: coord.lng,
      speed_kmph: coord.speed,
      bearing,
    });

    await sleep(3000);
  }

  console.log('\n\n✅ All pings sent');

  // Step 6: Stop trip
  await sleep(500);
  await stopTrip(token, trip_id);

  // Step 7: Verify final location via REST
  const locRes = await fetch(`${BASE_URL}/api/buses/${BUS_ID}/location`);
  const locData = await locRes.json();
  console.log(`\n✅ Final bus location via REST API:`);
  console.log(`   lat: ${locData.data?.location?.latitude}`);
  console.log(`   lng: ${locData.data?.location?.longitude}`);
  console.log(`   ETA stops: ${locData.data?.eta_to_stops?.length} stops calculated`);

  // Cleanup
  driverSocket.disconnect();
  commuterSocket.disconnect();

  console.log('\n🎉 ─── Test Complete ───────────────────────────────────\n');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});