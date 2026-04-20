const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getRestaurantOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, authorize('admin', 'staff'), getOrders);
router.route('/restaurant/:restaurantId').get(protect, authorize('admin', 'staff'), getRestaurantOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, protect, authorize('admin', 'staff'), updateOrderToDelivered);
router.route('/:id/status').put(protect, protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
