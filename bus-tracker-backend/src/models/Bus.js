const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    bus_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bus_number: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      trim: true,
    },
    license_plate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      trim: true,
    },
    route_id: {
      type: String, // Ref → routes.route_id
      default: null,
    },
    driver_id: {
      type: String, // Ref → users.user_id
      default: null,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
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

module.exports = mongoose.model('Bus', busSchema);