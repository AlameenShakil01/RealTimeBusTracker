const { haversineDistance } = require('../utils/distance');
const GPSLog = require('../models/GPSLog');
const Trip = require('../models/Trip');

/**
 * Get the latest GPS location for a specific bus
 * @param {string} bus_id
 * @returns {object|null} Latest GPS log or null if no data
 */
const getLatestBusLocation = async (bus_id) => {
  const latest = await GPSLog.findOne({ bus_id })
    .sort({ timestamp: -1 })
    .lean();

  return latest || null;
};

/**
 * Get latest locations for ALL currently active buses
 * Returns a map: { bus_id → latest GPS log }
 */
const getAllActiveBusLocations = async () => {
  // Find all ongoing trips to know which buses are active
  const activeTrips = await Trip.find({ trip_status: 'ongoing' }).lean();
  const activeBusIds = activeTrips.map((t) => t.bus_id);

  if (activeBusIds.length === 0) return {};

  // For each active bus, get latest GPS log
  const locationPromises = activeBusIds.map(async (bus_id) => {
    const loc = await getLatestBusLocation(bus_id);
    return { bus_id, location: loc };
  });

  const results = await Promise.all(locationPromises);

  // Return as a map for O(1) lookup
  return results.reduce((map, { bus_id, location }) => {
    if (location) map[bus_id] = location;
    return map;
  }, {});
};

/**
 * Find buses within a given radius of a coordinate
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 * @param {object} locationMap - Result from getAllActiveBusLocations()
 * @returns {Array} Buses within radius with distance added
 */
const findNearbyBuses = (lat, lng, radiusKm, locationMap) => {
  const nearby = [];

  for (const [bus_id, loc] of Object.entries(locationMap)) {
    const distance = haversineDistance(lat, lng, loc.latitude, loc.longitude);
    if (distance <= radiusKm) {
      nearby.push({ bus_id, ...loc, distance_km: Math.round(distance * 100) / 100 });
    }
  }

  // Sort by closest first
  return nearby.sort((a, b) => a.distance_km - b.distance_km);
};

module.exports = { getLatestBusLocation, getAllActiveBusLocations, findNearbyBuses };