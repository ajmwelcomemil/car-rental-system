// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: String,
  brand: String,
  type: String, // SUV, Sedan, etc.
  fuelType: String,
  pricePerDay: Number,
  images: [String],
  availability: { type: Boolean, default: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
