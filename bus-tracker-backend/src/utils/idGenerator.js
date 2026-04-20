/**
 * Generates human-readable IDs like your friend's schema uses
 * U001, B102, R12, T789, S101 etc.
 *
 * Usage:
 *   generateId('U')  → "U001", "U002" ...
 *   generateId('B')  → "B001" ...
 *
 * In production you'd query the DB for the last ID.
 * For now these are timestamp-based to avoid collisions.
 */

const generateId = (prefix) => {
  const timestamp = Date.now().toString().slice(-6); // last 6 digits of timestamp
  return `${prefix}${timestamp}`;
};

module.exports = { generateId };