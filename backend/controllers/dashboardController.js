const User = require('../models/User');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();

    res.json({ totalUsers, totalBookings, totalVehicles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingChartData = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $month: '$pickupDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get Vehicle Usage Stats: Count Bookings per Vehicle
exports.getVehicleUsageStats = async (req, res) => {
  try {
    // Aggregate the number of bookings for each vehicle
    const vehicleUsage = await Booking.aggregate([
      {
        $group: {
          _id: '$vehicle', // Group by vehicle ID
          usageCount: { $sum: 1 } // Count the number of bookings for each vehicle
        }
      },
      {
        $lookup: {
          from: 'vehicles', // Join with the 'vehicles' collection to get vehicle details
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      {
        $unwind: '$vehicleDetails' // Flatten the array from the $lookup
      },
      {
        $project: {
          _id: 0, // Exclude the original _id field
          vehicleName: '$vehicleDetails.name', // Include vehicle name
          usageCount: 1 // Include the usage count
        }
      }
    ]);

    res.json(vehicleUsage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};