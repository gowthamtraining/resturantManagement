const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
const createRestaurant = async (req, res) => {
  const { name, description, address, image, user: ownerId } = req.body;

  try {
    const restaurant = new Restaurant({
      name,
      description,
      address,
      image,
      user: (req.user.role === 'admin' && ownerId) ? ownerId : req.user._id,
    });

    const createdRestaurant = await restaurant.save();
    res.status(201).json(createdRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my restaurants (for owners/staff)
// @route   GET /api/restaurants/myrestaurants
// @access  Private/Staff
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ user: req.user._id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
const updateRestaurant = async (req, res) => {
  const { name, description, address, image, user: ownerId } = req.body;

  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      restaurant.name = name || restaurant.name;
      restaurant.description = description || restaurant.description;
      restaurant.address = address || restaurant.address;
      restaurant.image = image || restaurant.image;
      if (req.user.role === 'admin' && ownerId) {
        restaurant.user = ownerId;
      }

      const updatedRestaurant = await restaurant.save();
      res.json(updatedRestaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim a restaurant
// @route   PUT /api/restaurants/:id/claim
// @access  Private/Staff
const claimRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      restaurant.user = req.user._id;
      await restaurant.save();
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurants with no staff owner
// @route   GET /api/restaurants/unowned
// @access  Private/Staff
const getUnownedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ 
      $or: [{ user: { $exists: false } }, { user: null }] 
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  claimRestaurant,
  getUnownedRestaurants,
  getMyRestaurants,
};
