const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
// Get all bookings (with optional status filter)
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;  // Get the status from query params

    const filter = {};  // Initialize filter object

    if (status) {
      filter.status = status;  // Add status filter if present in query
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('vehicle', 'name brand');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get all bookings by user
exports.getBookingByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('user', 'name email')
      .populate('vehicle', 'name brand');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//get all bookings by vehicle
exports.getBookingByVehicle = async (req, res) => {
  try {
    const bookings = await Booking.find({ vehicle: req.params.vehicleId })
      .populate('user', 'name email')
      .populate('vehicle', 'name brand');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = req.body.status;
    await booking.save();

    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
