const Menu = require('../models/Menu');

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  const menuItems = await Menu.find({});
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
  const { name, price, description, image, category } = req.body;

  const menuItem = new Menu({
    name: name || 'Sample name',
    price: price || 0,
    user: req.user._id,
    image: image || '/images/sample.jpg',
    category: category || 'Sample category',
    description: description || 'Sample description',
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
