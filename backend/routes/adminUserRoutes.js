const express = require('express');
const {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  updateUser // ✅ Import updateUser
} = require('../controllers/adminUserController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Admin-only routes
router.get('/', protect, isAdmin, getAllUsers); // view  all users
router.put('/:id', protect, isAdmin, updateUser); //  Update user profile
router.patch('/:id/block', protect, isAdmin, blockUser); //block user
router.patch('/:id/unblock', protect, isAdmin, unblockUser); //unblock user
router.delete('/:id', protect, isAdmin, deleteUser); //delete user

module.exports = router;
