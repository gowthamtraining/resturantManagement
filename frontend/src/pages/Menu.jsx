import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await api.get('/menu');
        setMenuItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = filter === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === filter);

  if (loading) return <div className="loading">Preparing Menu...</div>;

  return (
    <div className="menu-page animate-fade-in">
      <header className="menu-header">
        <h1>Our <span>Menu</span></h1>
        <p>Expertly curated dishes for every palate.</p>
        
        <div className="category-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item._id} className={`menu-item-card card ${item.countInStock === 0 ? 'out-of-stock' : ''}`}>
            <div className="item-image">
              <img src={item.image} alt={item.name} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'} />
              {item.countInStock <= 5 && item.countInStock > 0 && (
                <span className="stock-badge low">Only {item.countInStock} left!</span>
              )}
              {item.countInStock === 0 && (
                <span className="stock-badge out">Sold Out</span>
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
                  onClick={() => addToCart(item)}
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
