import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Menu.css';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL);

const Menu = () => {
  const { id: restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuUrl = restaurantId ? `/menu?restaurantId=${restaurantId}` : '/menu';
        const { data } = await api.get(menuUrl);
        setMenuItems(data);
        if (restaurantId) {
          const { data: restData } = await api.get(`/restaurants/${restaurantId}`);
          setRestaurant(restData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.on('quantityUpdate', ({ menuItemId, countInStock }) => {
      setMenuItems(prev => prev.map(item => item._id === menuItemId ? { ...item, countInStock } : item));
    });
    return () => socket.off('quantityUpdate');
  }, [restaurantId]);

  const categories = ['All', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  const filteredItems = filter === 'All' ? menuItems : menuItems.filter(item => item.category === filter);

  const handleAddToCart = (item) => {
    addToCart(item);
    addToast(`${item.name} added to cart 🛒`, 'success');
  };

  if (loading) return <div className="loading">Preparing Menu...</div>;

  return (
    <div className="menu-page animate-fade-in">
      <div className="menu-page-header">
        <div className="header-text">
          <h1>{restaurant ? restaurant.name : 'All'} <span>Menu</span></h1>
          <p>{restaurant ? restaurant.description : 'Explore dishes from all our partner restaurants.'}</p>
        </div>

        {user && restaurant && (user.role === 'staff' || user.role === 'admin') && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {restaurant.user !== user._id && (
              <button
                className="btn btn-outline"
                onClick={async () => {
                  if (window.confirm(`Link "${restaurant.name}" to your account?`)) {
                    try {
                      await api.put(`/restaurants/${restaurant._id}/claim`);
                      addToast('Restaurant claimed successfully!', 'success');
                      window.location.reload();
                    } catch (e) {}
                  }
                }}
              >
                🙋 Manage This Restaurant
              </button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/restaurant-portal?add=true')}>
              + Add Menu Item
            </button>
          </div>
        )}
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {user && restaurant && user._id === (restaurant.user?._id || restaurant.user) && (
          <div className="menu-item-card add-item-placeholder" onClick={() => navigate('/restaurant-portal?add=true')}>
            <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>➕</div>
            <h3 style={{ color: 'var(--primary)', margin: 0, fontWeight: 700 }}>Add New Dish</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Expand your menu</p>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍽️</p>
            <h3>No items in this category yet</h3>
          </div>
        )}

        {filteredItems.map(item => (
          <div key={item._id} className={`menu-item-card ${item.countInStock === 0 ? 'out-of-stock' : ''}`}>
            <div className="item-image">
              <img
                src={item.image}
                alt={item.name}
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'}
              />
              {item.countInStock <= 5 && item.countInStock > 0 && (
                <span className="stock-badge low">ONLY {item.countInStock} LEFT!</span>
              )}
              {item.countInStock === 0 && (
                <span className="stock-badge out">SOLD OUT</span>
              )}
            </div>
            <div className="item-info">
              <div className="item-header">
                <h3>{item.name}</h3>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>
              <p className="item-desc">{item.description}</p>
              <div className="item-footer">
                <span className="item-category">{item.category}</span>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={item.countInStock === 0}
                  onClick={() => handleAddToCart(item)}
                >
                  {item.countInStock === 0 ? 'Unavailable' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
