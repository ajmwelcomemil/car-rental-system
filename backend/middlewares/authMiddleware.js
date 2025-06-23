const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect route middleware - checks if token is valid
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('No token found!');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log('User not found!');
      return res.status(401).json({ message: 'User not found' });
    }
    console.log('User found:', req.user);
    next();
  } catch (err) {
    console.log('Token verification failed');
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, isAdmin };
