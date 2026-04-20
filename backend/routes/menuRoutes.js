const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getMenuItems).post(protect, authorize('admin', 'staff'), createMenuItem);
router
  .route('/:id')
  .get(getMenuItemById)
  .put(protect, authorize('admin', 'staff'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

module.exports = router;
