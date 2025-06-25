const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true, // 🔧 Index for fast login
    match: /.+\@.+\..+/ // Basic email validation
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true // Do not index this!
  },
  profilePic: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Use this for admin checks
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 🔐 Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new or changed
  const salt = await bcrypt.genSalt(10); // Cost factor of 10: secure & fast
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Password comparison method
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ⚡ Explicitly ensure email index exists (even if schema changes in future)
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
