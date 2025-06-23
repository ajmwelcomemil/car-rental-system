const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.addReview = async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;

    // Check if the user has a completed booking for this vehicle
    const booking = await Booking.findOne({
      user: req.user._id,
      vehicle: vehicleId,
      status: 'Completed'
    });

    if (!booking) {
      return res.status(400).json({ message: 'No completed booking found for this vehicle' });
    }

    // Check if the user has already reviewed this vehicle
    const existingReview = await Review.findOne({
      user: req.user._id,
      vehicle: vehicleId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this vehicle' });
    }

    // Create and save the review
    const review = new Review({ user: req.user._id, vehicle: vehicleId, rating, comment });
    await review.save();

    // Update the vehicle's rating and review count
    const reviews = await Review.find({ vehicle: vehicleId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Vehicle.findByIdAndUpdate(vehicleId, {
      ratings: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// review.js
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.id })
      .populate('user', 'name email phone'); // Fetch name, email, phone

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
