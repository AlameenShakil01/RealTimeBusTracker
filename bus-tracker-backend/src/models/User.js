const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone must be a 10-digit number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['driver', 'admin'],
        message: 'Role must be either driver or admin',
      },
      required: [true, 'Role is required'],
    },
    // Driver-only fields
    license_number: {
      type: String,
      trim: true,
      default: null,
    },
    assigned_bus_id: {
      type: String, // Ref → buses.bus_id (string, not ObjectId)
      default: null,
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

// ── Hash password before saving ───────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on every update)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare entered password with hash ───────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);