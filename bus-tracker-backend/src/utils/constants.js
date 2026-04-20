module.exports = {
  ROLES: {
    DRIVER: 'driver',
    ADMIN: 'admin',
  },

  TRIP_STATUS: {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  BUS_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // GPS broadcast interval in milliseconds (driver sends every 5s)
  GPS_INTERVAL_MS: 5000,

  // Socket.IO room prefix for bus subscriptions
  // e.g. room name = "bus:B102"
  BUS_ROOM_PREFIX: 'bus:',
};