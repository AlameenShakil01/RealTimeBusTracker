const { haversineDistance } = require('../utils/distance');

/**
 * Simple ETA calculation — no ML, just physics + route data.
 * Good enough for MVP. Replace with ML model in v2.
 *
 * Strategy:
 *  1. Find the bus's current position (latest GPS log)
 *  2. Find the target stop's position
 *  3. Calculate straight-line distance remaining
 *  4. Use current speed (or route average) to estimate time
 */

const AVERAGE_SPEED_KMPH = 25; // Conservative city bus average for Tier-2/3 cities
const TRAFFIC_BUFFER_FACTOR = 1.2; // Add 20% buffer for traffic/stops

/**
 * Calculate ETA from a bus's current location to a target stop
 * @param {number} busLat - Current bus latitude
 * @param {number} busLng - Current bus longitude
 * @param {number} stopLat - Target stop latitude
 * @param {number} stopLng - Target stop longitude
 * @param {number} currentSpeed - Bus current speed in kmph (0 = use average)
 * @returns {{ eta_minutes: number, distance_km: number }}
 */
const calculateETA = (busLat, busLng, stopLat, stopLng, currentSpeed = 0) => {
  const distance_km = haversineDistance(busLat, busLng, stopLat, stopLng);

  // Use current speed if available and reasonable, else use city average
  const speed = currentSpeed > 5 ? currentSpeed : AVERAGE_SPEED_KMPH;

  // Time = Distance / Speed, converted to minutes, with traffic buffer
  const eta_minutes = Math.ceil((distance_km / speed) * 60 * TRAFFIC_BUFFER_FACTOR);

  return {
    eta_minutes: Math.max(1, eta_minutes), // Minimum 1 minute
    distance_km: Math.round(distance_km * 100) / 100,
  };
};

/**
 * Get ETA for a bus to reach each remaining stop on its route
 * @param {object} busLocation - { latitude, longitude, speed_kmph }
 * @param {Array} stops - Array of stop objects from DB (ordered by stop_order)
 * @param {number} currentStopOrder - The stop the bus just passed (0 if not started)
 * @returns {Array} stops with eta_minutes added
 */
const calculateRouteETA = (busLocation, stops, currentStopOrder = 0) => {
  return stops
    .filter((stop) => stop.stop_order > currentStopOrder)
    .map((stop) => {
      const { eta_minutes, distance_km } = calculateETA(
        busLocation.latitude,
        busLocation.longitude,
        stop.latitude,
        stop.longitude,
        busLocation.speed_kmph
      );

      return {
        stop_id: stop.stop_id,
        stop_name: stop.stop_name,
        stop_order: stop.stop_order,
        latitude: stop.latitude,
        longitude: stop.longitude,
        eta_minutes,
        distance_km,
        estimated_arrival: new Date(Date.now() + eta_minutes * 60 * 1000).toISOString(),
      };
    });
};

module.exports = { calculateETA, calculateRouteETA };