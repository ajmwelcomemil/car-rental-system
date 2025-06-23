const express = require('express');
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/:id', getReviews); // id = vehicleId

module.exports = router;
