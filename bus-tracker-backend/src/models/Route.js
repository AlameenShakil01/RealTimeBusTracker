const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    route_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    route_name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    start_point: {
      type: String,
      required: [true, 'Start point is required'],
      trim: true,
    },
    end_point: {
      type: String,
      required: [true, 'End point is required'],
      trim: true,
    },
    total_distance_km: {
      type: Number,
      required: [true, 'Total distance is required'],
      min: [0, 'Distance cannot be negative'],
    },
    estimated_time_min: {
      type: Number,
      required: [true, 'Estimated time is required'],
      min: [1, 'Estimated time must be at least 1 minute'],
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

module.exports = mongoose.model('Route', routeSchema);