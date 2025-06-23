const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminBookingRoutes = require('./routes/adminBookingRoutes');
const adminVehicleRoutes = require('./routes/adminVehicleRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const path = require('path');


// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/vehicles', adminVehicleRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple test route to check if the server is working
app.get('/', (req, res) => res.send('API is running...'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on https://carent-soyj.onrender.com:${PORT}`);
});

module.exports = app;
