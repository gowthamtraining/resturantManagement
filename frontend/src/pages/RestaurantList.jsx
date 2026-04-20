import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Restaurants.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await api.get('/restaurants');
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loader">Loading Restaurants...</div>;

  return (
    <div className="restaurant-list-page animate-fade-in">
      <div className="section-header">
        <h2>Top <span>Restaurants</span> Near You</h2>
        <p>Expertly curated spots for every palate</p>
        <input
          type="text"
          placeholder="🔍  Search restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px', margin: '1.5rem auto 0', display: 'block' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</p>
          <h3>No restaurants found</h3>
          <p>Try a different search or check back later!</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {filtered.map((restaurant, i) => (
            <Link
              to={`/restaurant/${restaurant._id}`}
              key={restaurant._id}
              className="restaurant-card"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animation: `scaleUp 0.4s ease-out ${i * 0.06}s forwards` }}
            >
              <div className="card-image-wrap">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                />
                <div className="card-badge">⭐ {restaurant.rating || '4.5'}</div>
              </div>
              <div className="card-content">
                <h3>{restaurant.name}</h3>
                <p className="description">{restaurant.description || 'Delicious food awaits you.'}</p>
                <div className="card-footer">
                  <span className="address">{restaurant.address}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>View Menu →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
