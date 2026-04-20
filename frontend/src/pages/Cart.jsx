import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = 0.15 * itemsPrice;
  const shippingPrice = itemsPrice > 50 ? 0 : 5;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const placeOrderHandler = async () => {
    if (!address || !city) {
      alert('Please fill in your shipping details');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          menuItem: item._id,
        })),
        shippingAddress: { address, city },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      navigate(`/orders`);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Check stock levels.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty animate-fade-in">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/menu" className="btn btn-primary">Go to Menu</Link>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in">
      <h1>Your <span>Cart</span></h1>
      
      <div className="cart-grid">
        <div className="cart-items card">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>Qty: {item.qty} × ${item.price.toFixed(2)}</p>
              </div>
              <div className="item-price">
                ${(item.qty * item.price).toFixed(2)}
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item._id)}>🗑️</button>
            </div>
          ))}
          <div className="cart-actions">
             <Link to="/menu">← Continue Shopping</Link>
             <button className="clear-btn" onClick={clearCart}>Clear Everything</button>
          </div>
        </div>

        <div className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${itemsPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (15%):</span>
            <span>${taxPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>${shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <hr />

          <div className="checkout-form">
            <h4>Billing & Delivery</h4>
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                placeholder="Enter address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                placeholder="Enter city" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>

            <button 
              className="btn btn-primary btn-block" 
              onClick={placeOrderHandler}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
