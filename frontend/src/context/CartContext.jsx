import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cartItems'));
    const savedRest = localStorage.getItem('restaurantId');
    if (savedCart) setCartItems(savedCart);
    if (savedRest) setRestaurantId(savedRest);
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    if (restaurantId) localStorage.setItem('restaurantId', restaurantId);
    else localStorage.removeItem('restaurantId');
  }, [cartItems, restaurantId]);

  const addToCart = (product, qty = 1) => {
    // Check if adding from same restaurant
    if (restaurantId && restaurantId !== product.restaurant) {
      if (window.confirm('Reset cart and add items from this restaurant?')) {
        setCartItems([{ menuItem: product._id, name: product.name, image: product.image, price: product.price, qty, restaurant: product.restaurant }]);
        setRestaurantId(product.restaurant);
      }
      return;
    }

    const existItem = cartItems.find((x) => x.menuItem === product._id);
    if (existItem) {
      setCartItems(cartItems.map((x) => x.menuItem === product._id ? { ...existItem, qty: existItem.qty + qty } : x));
    } else {
      setCartItems([...cartItems, { menuItem: product._id, name: product.name, image: product.image, price: product.price, qty, restaurant: product.restaurant }]);
      setRestaurantId(product.restaurant);
    }
  };

  const removeFromCart = (id) => {
    const updatedItems = cartItems.filter((x) => x.menuItem !== id);
    setCartItems(updatedItems);
    if (updatedItems.length === 0) setRestaurantId(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
