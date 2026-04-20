import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const RestaurantPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [restaurants, setRestaurants] = useState([]);
  const [unowned, setUnowned] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: '', countInStock: '', image: '' });
  const [restaurantForm, setRestaurantForm] = useState({ name: '', description: '', address: '' });

  const fetchMyRestaurants = async () => {
    try {
      const [myRes, unownedRes] = await Promise.allSettled([
        api.get('/restaurants/myrestaurants'),
        api.get('/restaurants/unowned'),
      ]);
      const myData = myRes.status === 'fulfilled' ? myRes.value.data : [];
      const unownedData = unownedRes.status === 'fulfilled' ? unownedRes.value.data : [];
      setRestaurants(myData);
      setUnowned(unownedData);

      const urlParams = new URLSearchParams(location.search);
      const urlRestId = urlParams.get('restId');
      if (urlRestId) {
        const found = myData.find(r => r._id === urlRestId);
        if (found) setSelectedRest(found);
      } else if (myData.length > 0) {
        setSelectedRest(myData[0]);
      }
      if (urlParams.get('add') === 'true') setShowAddForm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantData = async (restId) => {
    try {
      const [menuRes, ordersRes] = await Promise.allSettled([
        api.get(`/menu?restaurantId=${restId}`),
        api.get(`/orders?restaurantId=${restId}`),
      ]);
      if (menuRes.status === 'fulfilled') setMenuItems(menuRes.value.data);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMyRestaurants(); }, []);
  useEffect(() => { if (selectedRest) fetchRestaurantData(selectedRest._id); }, [selectedRest]);

  const handleClaim = async (id) => {
    try {
      const { data } = await api.put(`/restaurants/${id}/claim`);
      setRestaurants(prev => [...prev, data]);
      setSelectedRest(data);
      setUnowned(prev => prev.filter(r => r._id !== id));
      addToast('Restaurant linked to your account! 🎉', 'success');
    } catch {}
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/restaurants', {
        ...restaurantForm,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      });
      setRestaurants(prev => [...prev, data]);
      setSelectedRest(data);
      setRestaurantForm({ name: '', description: '', address: '' });
      addToast('Restaurant created! 🚀', 'success');
    } catch {}
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/menu', { ...newItem, restaurantId: selectedRest._id });
      setMenuItems(prev => [...prev, data]);
      setNewItem({ name: '', price: '', description: '', category: '', countInStock: '', image: '' });
      setShowAddForm(false);
      addToast(`"${data.name}" added to menu! ✅`, 'success');
    } catch {}
  };

  if (loading) return <div className="loading">Loading Portal...</div>;

  return (
    <div className="admin-dashboard">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <h2>My Restaurants</h2>
        <div id="rest-list">
          {restaurants.map(r => (
            <div
              key={r._id}
              className={`rest-nav-item ${selectedRest?._id === r._id ? 'active' : ''}`}
              onClick={() => setSelectedRest(r)}
            >
              🍽️ {r.name}
            </div>
          ))}
        </div>
        <button
          className="btn btn-outline btn-sm"
          style={{ width: '100%', marginTop: '1.5rem' }}
          onClick={() => setSelectedRest(null)}
        >
          + New Restaurant
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="main-content">
        {!selectedRest ? (
          <div className="animate-fade-in" style={{ maxWidth: '720px' }}>
            {/* Claim unowned */}
            {unowned.length > 0 && (
              <div className="section-card" style={{ marginBottom: '2rem', borderColor: 'rgba(245,158,11,0.3)' }}>
                <div className="section-card-header">
                  <h2>🙋 Claim Your Restaurant</h2>
                </div>
                <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {unowned.map(r => (
                    <div key={r._id} className="card" style={{ textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}>
                      <h4 style={{ marginBottom: '0.3rem' }}>{r.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{r.address}</p>
                      <button className="btn btn-primary btn-sm" onClick={() => handleClaim(r._id)}>This Is Mine</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section-card">
              <div className="section-card-header"><h2>Create New Restaurant</h2></div>
              <div style={{ padding: '1.5rem' }}>
                <form onSubmit={handleCreateRestaurant} className="grid-form">
                  <div className="form-group full-width">
                    <label>Restaurant Name</label>
                    <input required value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} placeholder="e.g. The Golden Fork" />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <input required value={restaurantForm.address} onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })} placeholder="123 Main Street, City" />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea rows={3} required value={restaurantForm.description} onChange={e => setRestaurantForm({ ...restaurantForm, description: e.target.value })} placeholder="What makes your restaurant special?" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">🚀 Launch Restaurant</button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="dashboard-header">
              <div>
                <h1>{selectedRest.name} <span>Dashboard</span></h1>
                <p>📍 {selectedRest.address}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? '✕ Cancel' : '+ Add Menu Item'}
              </button>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="section-card animate-slide-down" style={{ marginBottom: '2rem' }}>
                <div className="section-card-header"><h2>Add New Dish to {selectedRest.name}</h2></div>
                <div style={{ padding: '1.5rem' }}>
                  <form onSubmit={handleAddItem} className="grid-form">
                    <div className="form-group">
                      <label>Dish Name</label>
                      <input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Wagyu Burger" />
                    </div>
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input type="number" step="0.01" min="0" required value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="9.99" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input required value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="e.g. Burgers" />
                    </div>
                    <div className="form-group">
                      <label>Stock Count</label>
                      <input type="number" min="0" required value={newItem.countInStock} onChange={e => setNewItem({ ...newItem, countInStock: e.target.value })} placeholder="10" />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea rows={2} required value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Describe this delicious dish..." />
                    </div>
                    <div className="form-group full-width">
                      <label>Image URL (optional)</label>
                      <input value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} placeholder="https://..." />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">✅ Save Menu Item</button>
                  </form>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-card" onClick={() => setActiveTab('menu')}>
                <div className="stat-icon">🍴</div>
                <span>Menu Items</span>
                <h3>{menuItems.length}</h3>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('orders')}>
                <div className="stat-icon">📦</div>
                <span>Live Orders</span>
                <h3>{orders.length}</h3>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <span>Rating</span>
                <h3>{selectedRest.rating || '—'}</h3>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('menu')}>🍴 Menu</button>
              <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>📦 Orders</button>
            </div>

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="inventory-section animate-fade-in">
                {menuItems.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍽️</p>
                    <h3 style={{ marginBottom: '0.5rem' }}>No dishes yet</h3>
                    <p>Click "+ Add Menu Item" to get started!</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item._id}>
                          <td>{item.name}</td>
                          <td><span className="badge-category">{item.category}</span></td>
                          <td style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.price.toFixed(2)}</td>
                          <td>
                            <span className={`stock-level ${item.countInStock > 5 ? 'high' : 'low'}`}>{item.countInStock}</span>
                          </td>
                          <td>
                            <button className="btn-icon delete" title="Delete" onClick={async () => {
                              if (window.confirm(`Delete "${item.name}"?`)) {
                                await api.delete(`/menu/${item._id}`);
                                setMenuItems(prev => prev.filter(i => i._id !== item._id));
                                addToast(`"${item.name}" removed.`, 'info');
                              }
                            }}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="orders-section animate-fade-in">
                {orders.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</p>
                    <h3>No orders yet</h3>
                    <p>Orders will appear here once customers start placing them.</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8)}</td>
                          <td>{order.user?.name || '—'}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: 700 }}>${order.totalPrice?.toFixed(2)}</td>
                          <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPortal;
