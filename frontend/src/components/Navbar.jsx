import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Royal <span>Kitchen</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/restaurants">Restaurants</Link>
          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/menu">All Items</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/cart" className="cart-link">
                    🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                </>
              )}
              {user.role === 'staff' && (
                <>
                  <Link to="/restaurant-portal" className="nav-accent">Manage Restaurant</Link>
                  <Link to="/restaurant-portal?add=true" className="nav-accent" style={{ background: 'var(--accent)', color: 'white !important' }}>+ Add Item</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="nav-accent">System Admin</Link>
                  <Link to="/admin/inventory" className="nav-accent" style={{ background: 'var(--accent)', color: 'white !important' }}>+ Add Menu Item</Link>
                </>
              )}
              <div className="user-menu">
                <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/menu">All Items</Link>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
