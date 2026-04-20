import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <span className="badge-new">NEW SEASON MENU OUT</span>
          <h1>Experience Culinary <span>Excellence</span></h1>
          <p>Discover a world of flavors crafted with passion and precision. From local favorites to exotic delicacies, delivered with zero-gravity speed.</p>
          <div className="hero-btns">
            <Link to="/menu" className="btn btn-primary btn-lg">Explore Menu</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Join the Club</Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>50+</strong>
              <span>Unique Dishes</span>
            </div>
            <div className="stat">
              <strong>15min</strong>
              <span>Avg Delivery</span>
            </div>
            <div className="stat">
              <strong>4.9/5</strong>
              <span>Customer Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-blob">
            <img src="/assets/hero.png" alt="Delicious food" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'} />
          </div>
          <div className="floating-card glass top">
            <span>🔥 Popular: Wagyu Burger</span>
          </div>
          <div className="floating-card glass bottom">
            <span>✨ Zero-G Delivery Active</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Secure Ordering</h3>
          <p>JWT protected APIs ensuring your data and payments are always safe.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3>Real-time Inventory</h3>
          <p>Never order something that's out of stock. Live updates across all systems.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📑</div>
          <h3>Smart Billing</h3>
          <p>Instant digital invoices and easy order management for businesses.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
