const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, role } = req.body;

    // Validate name
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    if (!name || !nameRegex.test(name) || /\d/.test(name) || /[^a-zA-Z\s]/.test(name) || /(.)\1{2,}/.test(name)) {
      return res.status(400).json({ message: 'Invalid name format.' });
    }

    // Validate email
    const emailRegex = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z]+\.(com|in|org)(?:\.[a-z]{2,})?$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const domainParts = email.split('@')[1].split('.');
    if (domainParts.length > 3) {
      return res.status(400).json({ message: 'Email has too many subdomains.' });
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone) || /(.)\1{4,}/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number.' });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
    if (!password || !passwordRegex.test(password) || /(.)\1{4,}/.test(password)) {
      return res.status(400).json({ message: 'Invalid password format.' });
    }

    // Validate role
    const allowedRoles = ['user', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Check if phone number already exists
const phoneExists = await User.findOne({ phone });
if (phoneExists) {
  return res.status(400).json({ message: 'Phone number already in use.' });
}

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Registration successful! Please log in.',
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    console.error('Registration error:', err);
    // Instead of exposing internal errors, send a safe, predefined message
    return res.status(400).json({ message: 'Invalid input. Please check your information and try again.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
