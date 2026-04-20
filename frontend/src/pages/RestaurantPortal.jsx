import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css'; // Reusing dashboard styles

const RestaurantPortal = () => {
  const location = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [unowned, setUnowned] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    countInStock: '',
    image: ''
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: ''
  });

  const fetchMyRestaurants = async () => {
    try {
      const [{ data: myData }, { data: unownedData }] = await Promise.all([
        api.get('/restaurants/myrestaurants'),
        api.get('/restaurants/unowned')
      ]);
      
      setRestaurants(myData);
      setUnowned(unownedData);
      
      // Auto-select first one or from URL
      const urlRestId = new URLSearchParams(location.search).get('restId');
      if (urlRestId) {
        const found = myData.find(r => r._id === urlRestId);
        if (found) setSelectedRest(found);
      } else if (myData.length > 0) {
        setSelectedRest(myData[0]);
      }
      
      if (new URLSearchParams(location.search).get('add') === 'true') {
        setShowAddForm(true);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      const { data } = await api.put(`/restaurants/${id}/claim`);
      setRestaurants([...restaurants, data]);
      setSelectedRest(data);
      setUnowned(unowned.filter(r => r._id !== id));
    } catch (error) {
      alert('Error claiming restaurant');
    }
  };

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRest) {
      const fetchRestDetails = async () => {
        try {
          const [menuRes, orderRes] = await Promise.all([
            api.get(`/menu?restaurantId=${selectedRest._id}`),
            api.get(`/orders/restaurant/${selectedRest._id}`)
          ]);
          setMenuItems(menuRes.data);
          setOrders(orderRes.data);
        } catch (error) {
          console.error('Error fetching details:', error);
        }
      };
      fetchRestDetails();
    }
  }, [selectedRest]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/menu', { ...newItem, restaurantId: selectedRest._id });
      setMenuItems([...menuItems, data]);
      setShowAddForm(false);
      setNewItem({ name: '', price: '', description: '', category: '', countInStock: '', image: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding item');
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/restaurants', {
        ...restaurantForm,
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80'
      });
      setRestaurants([...restaurants, data]);
      setSelectedRest(data);
      setRestaurantForm({ name: '', description: '', address: '' });
    } catch (error) {
      alert('Error creating restaurant');
    }
  };

  if (loading) return <div className="loader">Loading Your Portal...</div>;

  return (
    <div className="admin-dashboard">
      <div className="sidebar" style={{ width: '280px', background: 'var(--surface)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>My Restaurants</h2>
        <div className="rest-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {restaurants.map(r => (
            <div 
              key={r._id} 
              className={`rest-nav-item ${selectedRest?._id === r._id ? 'active' : ''}`}
              onClick={() => { setSelectedRest(r); setShowAddForm(false); }}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                background: selectedRest?._id === r._id ? 'var(--primary)' : 'transparent',
                color: selectedRest?._id === r._id ? 'white' : 'var(--text-primary)',
                transition: '0.3s'
              }}
            >
              {r.name}
            </div>
          ))}
          <button 
            className="btn btn-outline" 
            onClick={() => setSelectedRest(null)}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            + New Restaurant
          </button>
        </div>
      </div>

      <div className="main-content" style={{ flex: 1, padding: '2rem' }}>
        {!selectedRest ? (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
             {unowned.length > 0 && (
               <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--primary-subtle)' }}>
                 <h2 style={{ color: 'var(--primary)' }}>Claim Your Restaurant</h2>
                 <p style={{ marginBottom: '1.5rem' }}>We found some restaurants that don't have an assigned owner. Is one of these yours?</p>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {unowned.map(r => (
                      <div key={r._id} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                         <h4 style={{ marginBottom: '0.5rem' }}>{r.name}</h4>
                         <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{r.address}</p>
                         <button className="btn btn-primary btn-sm" onClick={() => handleClaim(r._id)}>🙋‍♂️ This Is Mine</button>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             <div className="card" style={{ padding: '2rem' }}>
                <h2>Create New Restaurant</h2>
                <form onSubmit={handleCreateRestaurant} className="grid-form" style={{ marginTop: '1rem' }}>
                  <div className="form-group full-width">
                    <label>Restaurant Name</label>
                    <input type="text" required value={restaurantForm.name} onChange={e => setRestaurantForm({...restaurantForm, name: e.target.value})} />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <input type="text" required value={restaurantForm.address} onChange={e => setRestaurantForm({...restaurantForm, address: e.target.value})} />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea required value={restaurantForm.description} onChange={e => setRestaurantForm({...restaurantForm, description: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Add Restaurant 🚀</button>
                </form>
             </div>
          </div>
        ) : (
          <div className="dashboard-view">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
              <div>
                <h1>{selectedRest.name} Dashboard</h1>
                <p>{selectedRest.address}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Item'}
              </button>
            </div>

            {showAddForm && (
              <div className="card animate-slide-down" style={{ marginBottom: '2rem', padding: '2rem' }}>
                <h3>Add New Dish to {selectedRest.name}</h3>
                <form onSubmit={handleAddItem} className="grid-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" required value={newItem.countInStock} onChange={e => setNewItem({...newItem, countInStock: e.target.value})} />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea required value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary">Save Menu Item</button>
                </form>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('menu')}>
                <span>Menu Items</span>
                <h3>{menuItems.length}</h3>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('orders')}>
                <span>Live Orders</span>
                <h3>{orders.length}</h3>
              </div>
              <div className="stat-card">
                <span>Rating</span>
                <h3>{selectedRest.rating} ⭐</h3>
              </div>
            </div>

            <div className="portal-tabs" style={{ marginBottom: '2rem', marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('menu')}>Menu</button>
              <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>Orders</button>
            </div>

            {activeTab === 'menu' ? (
              <div className="inventory-section animate-fade-in">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td><span className="badge-category">{item.category}</span></td>
                        <td>${item.price.toFixed(2)}</td>
                        <td><span className={`stock-level ${item.countInStock > 5 ? 'high' : 'low'}`}>{item.countInStock}</span></td>
                        <td>
                          <button className="btn-icon delete" onClick={async () => {
                             if(window.confirm('Delete?')) {
                               await api.delete(`/menu/${item._id}`);
                               setMenuItems(menuItems.filter(i => i._id !== item._id));
                             }
                          }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="orders-section animate-fade-in">
                <table className="admin-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>#{order._id.substring(19)}</td>
                        <td>{order.user?.name}</td>
                        <td>${order.totalPrice.toFixed(2)}</td>
                        <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPortal;
