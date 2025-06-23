// routes/adminBookingRoutes.js

const express = require('express');
const {
  getAllBookings,
  getBookingByUser,
  getBookingByVehicle,
  updateBookingStatus
} = require('../controllers/adminBookingController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, isAdmin, getAllBookings);
router.get('/user/:userId', protect, isAdmin, getBookingByUser);
router.get('/vehicle/:vehicleId', protect, isAdmin, getBookingByVehicle);
router.put('/:id', protect, isAdmin, updateBookingStatus);

module.exports = router;
