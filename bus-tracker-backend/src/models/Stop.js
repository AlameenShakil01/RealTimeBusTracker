const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    stop_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    route_id: {
      type: String, // Ref → routes.route_id
      required: [true, 'Route ID is required'],
      trim: true,
    },
    stop_name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true,
    },
    stop_order: {
      type: Number,
      required: [true, 'Stop order is required'],
      min: [1, 'Stop order starts at 1'],
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
    distance_from_start_km: {
      type: Number,
      required: [true, 'Distance from start is required'],
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index — no duplicate stop_order within a route
stopSchema.index({ route_id: 1, stop_order: 1 }, { unique: true });

module.exports = mongoose.model('Stop', stopSchema);