import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Menu.css';
import { useState } from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';

const socket = io('http://localhost:5000');

const Menu = () => {
  const { id: restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
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

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();

    // Socket listener for real-time quantity updates
    socket.on('quantityUpdate', ({ menuItemId, countInStock }) => {
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item._id === menuItemId ? { ...item, countInStock } : item
        )
      );
    });

    return () => {
      socket.off('quantityUpdate');
    };
  }, [restaurantId]);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = filter === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === filter);

  if (loading) return <div className="loading">Preparing Menu...</div>;

  return (
    <div className="menu-page animate-fade-in">
      <header className="menu-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{restaurant ? restaurant.name : 'Our'} <span>Menu</span></h1>
            <p>{restaurant ? restaurant.description : 'Expertly curated dishes for every palate.'}</p>
          </div>
          {user && (user.role === 'staff' || user.role === 'admin') && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {restaurant.user !== user._id && (
                <button 
                  className="btn btn-outline" 
                  onClick={async () => {
                    if(window.confirm(`Do you want to manage ${restaurant.name}? This will link it to your account.`)) {
                      try {
                        await api.put(`/restaurants/${restaurant._id}/claim`);
                        window.location.reload();
                      } catch (e) {
                        alert('Failed to claim restaurant');
                      }
                    }
                  }}
                >
                  🙋‍♂️ Manage This Restaurant
                </button>
              )}
              <button 
                 className="btn btn-primary" 
                 style={{ background: 'var(--accent)' }}
                 onClick={() => navigate('/restaurant-portal?add=true')}
              >
                + Add Menu Item
              </button>
            </div>
          )}
        </div>

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
        {user && restaurant && user._id === restaurant.user && (
           <div 
             className="menu-item-card card add-item-placeholder" 
             onClick={() => navigate('/restaurant-portal')}
             style={{ 
               border: '2px dashed var(--primary)', 
               cursor: 'pointer', 
               display: 'flex', 
               flexDirection: 'column', 
               alignItems: 'center', 
               justifyContent: 'center', 
               padding: '2rem', 
               textAlign: 'center',
               minHeight: '300px'
             }}
           >
              <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>➕</div>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Add New Dish</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Expand your menu with a new delicious item</p>
           </div>
        )}
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
