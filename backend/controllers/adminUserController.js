const User = require('../models/User');
const validator = require('validator');

exports.getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {};

    const users = await User.find(keyword).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const { search, isBlocked } = req.query;  // Destructure query params
    let query = {};

    // If 'search' query is provided, filter by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // If 'isBlocked' query is provided, filter by blocked status
    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';  // Convert 'true'/'false' string to boolean
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//block user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    res.json({ message: 'User blocked', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// add this export alongside blockUser/deleteUser
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );
    res.json({ message: 'User unblocked', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//update user profile
// Helper function for name and password checks
function hasConsecutiveLettersOrNumbers(str) {
  return /([a-zA-Z])\1{1,}|([0-9])\2{1,}/.test(str) || /(abc|123|xyz|789)/i.test(str);
}

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate name
    if (name !== undefined) {
      const nameTrimmed = name.trim();
      if (
        nameTrimmed.length < 2 ||
        /[^a-zA-Z]/.test(nameTrimmed) ||
        hasConsecutiveLettersOrNumbers(nameTrimmed)
      ) {
        return res.status(400).json({ message: 'Invalid name. Only alphabets, no spaces, numbers, or repeating letters.' });
      }
      user.name = nameTrimmed;
    }

    // Validate email
    if (email !== undefined) {
      if (
        !validator.isEmail(email) ||
        email.split('@')[1].split('.').length > 3
      ) {
        return res.status(400).json({ message: 'Invalid email format or too many subdomains (max 2).' });
      }
      user.email = email.trim();
    }

    // Validate phone
    if (phone !== undefined) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits, start with 6-9, no letters/symbols/spaces.' });
      }
      user.phone = phone;
    }

    // Assign role if present (optional: add strict role validation)
    if (role !== undefined) {
      user.role = role;
    }

    // Validate isBlocked
    if (typeof isBlocked === 'boolean') {
      user.isBlocked = isBlocked;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'User profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked
      }
    });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: err.message });
  }
};