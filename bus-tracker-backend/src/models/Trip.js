const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    trip_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bus_id: {
      type: String, // Ref → buses.bus_id
      required: [true, 'Bus ID is required'],
    },
    driver_id: {
      type: String, // Ref → users.user_id
      required: [true, 'Driver ID is required'],
    },
    route_id: {
      type: String, // Ref → routes.route_id
      required: [true, 'Route ID is required'],
    },
    start_time: {
      type: Date,
      default: Date.now,
    },
    end_time: {
      type: Date,
      default: null,
    },
    trip_status: {
      type: String,
      enum: {
        values: ['ongoing', 'completed', 'cancelled'],
        message: 'Status must be ongoing, completed, or cancelled',
      },
      default: 'ongoing',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for fast lookup of ongoing trips
tripSchema.index({ trip_status: 1 });
tripSchema.index({ bus_id: 1, trip_status: 1 });

module.exports = mongoose.model('Trip', tripSchema);