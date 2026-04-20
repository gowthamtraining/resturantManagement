const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  claimRestaurant,
  getUnownedRestaurants,
  getMyRestaurants,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getRestaurants).post(protect, authorize('admin', 'staff'), createRestaurant);
router.route('/myrestaurants').get(protect, authorize('admin', 'staff'), getMyRestaurants);
router.route('/unowned').get(protect, authorize('staff'), getUnownedRestaurants);
router.route('/:id').get(getRestaurantById).put(protect, authorize('admin'), updateRestaurant);
router.route('/:id/claim').put(protect, authorize('staff'), claimRestaurant);

module.exports = router;
