const mongoose = require('mongoose');

// Your friend's best addition — records actual arrival/departure at each stop.
// Used for: ETA calculation (current) + ML training data (future)

const stopArrivalSchema = new mongoose.Schema(
  {
    trip_id: {
      type: String, // Ref → trips.trip_id
      required: [true, 'Trip ID is required'],
      index: true,
    },
    stop_id: {
      type: String, // Ref → stops.stop_id
      required: [true, 'Stop ID is required'],
    },
    arrival_time: {
      type: Date,
      required: [true, 'Arrival time is required'],
    },
    departure_time: {
      type: Date,
      default: null, // Null until bus departs the stop
    },
    delay_minutes: {
      type: Number,
      default: 0, // 0 = on time, positive = delayed, negative = early
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Compound index — one arrival record per stop per trip
stopArrivalSchema.index({ trip_id: 1, stop_id: 1 }, { unique: true });

module.exports = mongoose.model('StopArrival', stopArrivalSchema);