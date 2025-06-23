const User = require('../models/User');
// view profile
exports.getProfile = async (req, res) => {
  const user = req.user;
  res.json(user);
};

const validator = require('validator');

function hasConsecutiveLettersOrNumbers(str) {
  return /([a-zA-Z])\1{1,}|([0-9])\2{1,}/.test(str) || /(abc|123|xyz|789)/i.test(str);
}
// update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, password } = req.body;

    // Validate Name
if (name !== undefined) {
  const nameTrimmed = name.trim();
  if (
    nameTrimmed.length < 2 ||
    /[^a-zA-Z\s]/.test(nameTrimmed) // allow letters and spaces only
  ) {
    return res.status(400).json({
      message: 'Invalid name. Only alphabets and spaces are allowed.'
    });
  }
  user.name = nameTrimmed;
}
    // Validate Email
if (email !== undefined) {
  const trimmedEmail = email.trim();

  if (
    !validator.isEmail(trimmedEmail) ||
    trimmedEmail.split('@')[1].split('.').length > 3
  ) {
    return res.status(400).json({ message: 'Invalid email format or too many subdomains (max 2).' });
  }

  // Check if email already exists in another user
  const existingEmailUser = await User.findOne({ email: trimmedEmail, _id: { $ne: user._id } });
  if (existingEmailUser) {
    return res.status(400).json({ message: 'Email already in use by another user.' });
  }

  user.email = trimmedEmail;
}

// Validate Phone
if (phone !== undefined) {
  const phoneRegex = /^[6-9]\d{9}$/;
  const isRepeatedDigits = /^(\d)\1{9}$/.test(phone);

  if (!phoneRegex.test(phone) || isRepeatedDigits) {
    return res.status(400).json({
      message: 'Invalid phone number. Must be 10 digits, start with 6-9, no repeated digits like 6666666666.',
    });
  }

  // Check if phone already exists in another user
  const existingPhoneUser = await User.findOne({ phone, _id: { $ne: user._id } });
  if (existingPhoneUser) {
    return res.status(400).json({ message: 'Phone number already in use by another user.' });
  }

  user.phone = phone;
}
    // Validate Password
    if (password !== undefined) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (
        !passwordRegex.test(password) ||
        /\s/.test(password) ||
        hasConsecutiveLettersOrNumbers(password)
      ) {
        return res.status(400).json({
          message:
            'Invalid password. Must contain at least 1 uppercase letter, 1 number, 1 special character, no spaces, no consecutive letters/numbers.',
        });
      }
      user.password = password;
    }

    // Handle profile picture
    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
