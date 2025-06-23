const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  generateInvoice
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.put('/cancel/:id', protect, cancelBooking);
router.get('/:id/invoice', protect, generateInvoice);

module.exports = router;
