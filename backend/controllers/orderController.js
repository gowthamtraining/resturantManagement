const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    restaurantId, // New field from frontend
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      restaurant: restaurantId,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Update inventory atomically to handle concurrency
    for (const item of orderItems) {
      const menuItem = await Menu.findOneAndUpdate(
        { _id: item.menuItem, countInStock: { $gte: item.qty } },
        { $inc: { countInStock: -item.qty } },
        { new: true }
      );

      if (menuItem) {
        // Emit socket event for quantity change
        req.io.emit('quantityUpdate', {
          menuItemId: item.menuItem,
          countInStock: menuItem.countInStock,
        });
      } else {
        // Handle case where stock might have been depleted by a concurrent order
        console.error(`Failed to update stock for item ${item.menuItem} - Insufficient stock`);
      }
    }

    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  ).populate('restaurant', 'name');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'preparing';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Staff
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Staff
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Staff
const getOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get orders for a specific restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private/Staff/Admin
const getRestaurantOrders = async (req, res) => {
  const orders = await Order.find({ restaurant: req.params.restaurantId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getRestaurantOrders,
};
