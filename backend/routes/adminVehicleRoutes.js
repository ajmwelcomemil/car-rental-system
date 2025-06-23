const express = require('express');
const {
  addVehicle, editVehicle, deleteVehicle, toggleAvailability
} = require('../controllers/adminVehicleController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // Corrected import

const router = express.Router();

// Add a new vehicle
router.post('/', protect, isAdmin, upload.array('images', 5), addVehicle);

// Edit an existing vehicle
router.put('/:id', protect, isAdmin, upload.array('images', 5), editVehicle);

// Delete a vehicle
router.delete('/:id', protect, isAdmin, deleteVehicle);

// Toggle vehicle availability
router.patch('/:id/availability', protect, isAdmin, toggleAvailability);
module.exports = router;
