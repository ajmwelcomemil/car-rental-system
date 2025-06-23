const express = require('express');
const { getDashboardStats, getBookingChartData ,getVehicleUsageStats} = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/charts/bookings', protect, isAdmin, getBookingChartData);
router.get('/charts/vehicles/usage', protect, isAdmin, getVehicleUsageStats);

module.exports = router;
