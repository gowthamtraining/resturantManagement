const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

// @desc    Fetch all menu items or menu items by restaurant
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  const { restaurantId } = req.query;
  const query = restaurantId ? { restaurant: restaurantId } : {};
  const menuItems = await Menu.find(query);
  res.json(menuItems);
};

// @desc    Fetch single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin/Staff
const createMenuItem = async (req, res) => {
  const { name, price, description, image, category, countInStock, restaurantId } = req.body;

  let finalRestaurantId;

  if (req.user.role === 'admin' && restaurantId) {
    finalRestaurantId = restaurantId;
  } else if (restaurantId) {
    // Verify staff owns this specific restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, user: req.user._id });
    if (!restaurant) {
      res.status(403);
      throw new Error('Not authorized to add items to this restaurant');
    }
    finalRestaurantId = restaurant._id;
  } else {
    // Fallback: Find the first restaurant owned by this user
    const restaurant = await Restaurant.findOne({ user: req.user._id });
    if (!restaurant) {
      res.status(404);
      throw new Error('No restaurant found for this user. Please create one first.');
    }
    finalRestaurantId = restaurant._id;
  }

  const menuItem = new Menu({
    restaurant: finalRestaurantId,
    name: name || 'Sample name',
    price: price || 0,
    image: image || '/images/sample.jpg',
    category: category || 'Sample category',
    description: description || 'Sample description',
    countInStock: countInStock || 0,
  });

  const createdMenuItem = await menuItem.save();
  res.status(201).json(createdMenuItem);
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin/Staff
const updateMenuItem = async (req, res) => {
  const { name, price, description, image, category, isAvailable, countInStock } = req.body;

  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    menuItem.name = name || menuItem.name;
    menuItem.price = price ?? menuItem.price;
    menuItem.description = description || menuItem.description;
    menuItem.image = image || menuItem.image;
    menuItem.category = category || menuItem.category;
    menuItem.isAvailable = isAvailable ?? menuItem.isAvailable;
    menuItem.countInStock = countInStock ?? menuItem.countInStock;

    const updatedMenuItem = await menuItem.save();
    res.json(updatedMenuItem);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
