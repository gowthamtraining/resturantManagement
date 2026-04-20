import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Reusing some base styles

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/restaurants');
        setRestaurants(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  if (loading) return <div className="loader">Loading Restaurants...</div>;

  return (
    <div className="restaurant-list-page">
      <div className="section-header">
        <h2>Top Restaurants in Your Area</h2>
        <p>Expertly curated spots for every palate</p>
      </div>
      
      <div className="restaurant-grid">
        {restaurants.length === 0 ? (
          <p>No restaurants found. Check back later!</p>
        ) : (
          restaurants.map(restaurant => (
            <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="restaurant-card animate-scale-up">
              <div className="card-image-wrap">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name} 
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                />
                <div className="card-badge">
                  {restaurant.rating} ⭐
                </div>
              </div>
              <div className="card-content">
                <h3>{restaurant.name}</h3>
                <p className="description">{restaurant.description}</p>
                <div className="card-footer">
                  <span className="address">{restaurant.address}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantList;
