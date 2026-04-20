const mongoose = require('mongoose');

const gpsLogSchema = new mongoose.Schema(
  {
    trip_id: {
      type: String, // Ref → trips.trip_id
      required: [true, 'Trip ID is required'],
      index: true,
    },
    bus_id: {
      type: String, // Ref → buses.bus_id
      required: [true, 'Bus ID is required'],
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    speed_kmph: {
      type: Number,
      default: 0,
      min: 0,
    },
    bearing: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Critical — used for "latest location" queries
    },
  },
  {
    // No updatedAt needed — GPS logs are write-once
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Compound index for "get latest location of a bus" query
gpsLogSchema.index({ bus_id: 1, timestamp: -1 });

module.exports = mongoose.model('GPSLog', gpsLogSchema);