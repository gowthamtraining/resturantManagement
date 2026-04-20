import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, restaurantId } = useContext(CartContext);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const itemsPrice   = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice     = 0.05 * itemsPrice;
  const shippingPrice = itemsPrice > 50 ? 0 : 5;
  const totalPrice   = itemsPrice + taxPrice + shippingPrice;

  const placeOrderHandler = async () => {
    if (!address || !city) {
      addToast('Please fill in your shipping details', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        orderItems: cartItems.map(item => ({
          name: item.name, qty: item.qty, image: item.image,
          price: item.price, menuItem: item.menuItem,
        })),
        shippingAddress: { address, city },
        paymentMethod,
        itemsPrice, taxPrice, shippingPrice, totalPrice, restaurantId,
      });
      clearCart();
      addToast('Order placed successfully! 🎉', 'success');
      navigate('/orders');
    } catch (error) {
      // toast shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty animate-fade-in">
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade-in">
      <h1>Your <span>Cart</span></h1>

      <div className="cart-grid">
        <div className="cart-items card">
          {cartItems.map(item => (
            <div key={item.menuItem} className="cart-item">
              <img src={item.image} alt={item.name} onError={e => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'} />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>Qty: {item.qty} × ${item.price.toFixed(2)}</p>
              </div>
              <div className="item-price">${(item.qty * item.price).toFixed(2)}</div>
              <button className="remove-btn" onClick={() => removeFromCart(item.menuItem)}>🗑️</button>
            </div>
          ))}
          <div className="cart-actions">
            <Link to="/restaurants">← Continue Shopping</Link>
            <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>

        <div className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>${itemsPrice.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>${taxPrice.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{shippingPrice === 0 ? '🎉 FREE' : `$${shippingPrice.toFixed(2)}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>

          <hr />

          <div className="checkout-form">
            <h4>Delivery Details</h4>
            <div className="form-group">
              <label>Delivery Address</label>
              <input type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" placeholder="Your city" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option>Cash on Delivery</option>
                <option>Credit Card</option>
                <option>PayPal</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: '1.25rem', padding: '0.9rem', fontSize: '1rem' }} onClick={placeOrderHandler} disabled={loading}>
              {loading ? 'Placing Order...' : '🚀 Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
