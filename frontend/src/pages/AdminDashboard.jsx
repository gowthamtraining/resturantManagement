import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    activeMenuCount: 0,
    lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'restaurants', 'users'
  const [showAddRest, setShowAddRest] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', description: '', address: '', ownerId: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' });
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, usersRes, restRes] = await Promise.allSettled([
        api.get('/orders'),
        api.get('/menu'),
        api.get('/users'),
        api.get('/restaurants')
      ]);

      if (ordersRes.status === 'fulfilled') {
        const orders = ordersRes.value.data;
        const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalSales: totalSales.toFixed(2),
        }));
        setRecentOrders(orders.slice(0, 5));
      }

      if (menuRes.status === 'fulfilled') {
        const menuItems = menuRes.value.data;
        setStats(prev => ({
          ...prev,
          activeMenuCount: menuItems.length,
          lowStockItems: menuItems.filter(item => item.countInStock < 10).length,
        }));
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data);
      }

      if (restRes.status === 'fulfilled') {
        setRestaurants(restRes.value.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Fetch everything on mount

  const [editingRest, setEditingRest] = useState(null);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      if (editingRest) {
        const { data } = await api.put(`/restaurants/${editingRest._id}`, {
          ...newRest,
          user: newRest.ownerId,
        });
        setRestaurants(restaurants.map(r => r._id === data._id ? data : r));
        setEditingRest(null);
      } else {
        const { data } = await api.post('/restaurants', {
          ...newRest,
          user: newRest.ownerId,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
        });
        setRestaurants([...restaurants, data]);
      }
      setShowAddRest(false);
      setNewRest({ name: '', description: '', address: '', ownerId: '' });
    } catch (error) {
      alert('Error saving restaurant');
    }
  };

  const startEdit = (rest) => {
    setEditingRest(rest);
    setNewRest({
      name: rest.name,
      description: rest.description,
      address: rest.address,
      ownerId: rest.user
    });
    setShowAddRest(true);
    setActiveTab('restaurants');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users', newUser);
      setUsers([...users, data]);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'customer' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="container" style={{ flex: 1, padding: '2rem' }}>
        <header className="admin-header">
          <div>
            <h1>System Administration</h1>
            <p>Monitor platform growth and manage multi-tenant entities.</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-outline" onClick={fetchDashboardData}>
              <span>🔄 Refresh Data</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/inventory')}>
              📦 Global Inventory
            </button>
          </div>
        </header>

        <div className="tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={`btn ${activeTab === 'restaurants' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('restaurants')}>Restaurants</button>
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}>Users</button>
        </div>

      {activeTab === 'orders' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Revenue</h3>
                <p className="stat-value">${stats.totalSales}</p>
              </div>
            </div>
            {/* ... stats ... */}
          </div>

          <section className="recent-orders">
            <h2>Recent Orders</h2>
            <div className="table-container card">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Restaurant</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(19)}</td>
                      <td>{order.user?.name}</td>
                      <td>{order.restaurant?.name || 'N/A'}</td>
                      <td>${order.totalPrice.toFixed(2)}</td>
                      <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === 'restaurants' && (
        <section className="restaurants-management">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Managed Restaurants</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddRest(!showAddRest)}>
              {showAddRest ? 'Cancel' : '+ New Restaurant'}
            </button>
          </div>

          {showAddRest && (
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3>{editingRest ? 'Edit Restaurant' : 'Assign Restaurant to User'}</h3>
              <form onSubmit={handleCreateRestaurant} className="grid-form">
                <div className="form-group">
                  <label>Name</label>
                  <input required value={newRest.name} onChange={e => setNewRest({...newRest, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input required value={newRest.address} onChange={e => setNewRest({...newRest, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Assign to Owner (Staff/Admin)</label>
                  <select required value={newRest.ownerId} onChange={e => setNewRest({...newRest, ownerId: e.target.value})}>
                    <option value="">Select a user...</option>
                    {users.filter(u => u.role !== 'customer').map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea value={newRest.description} onChange={e => setNewRest({...newRest, description: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">{editingRest ? 'Update' : 'Create & Assign'}</button>
                {editingRest && <button type="button" className="btn btn-outline" onClick={() => { setEditingRest(null); setShowAddRest(false); setNewRest({ name: '', description: '', address: '', ownerId: '' }); }}>Cancel Edit</button>}
              </form>
            </div>
          )}

          <div className="table-container card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(r => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td>{r.address}</td>
                    <td>{users.find(u => u._id === r.user)?.name || 'Unknown'}</td>
                    <td>
                      <button className="btn-text" onClick={() => startEdit(r)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="users-management">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>All Users</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? 'Cancel' : '+ New User'}
            </button>
          </div>

          {showAddUser && (
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3>Create New User Account</h3>
              <form onSubmit={handleCreateUser} className="grid-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Initial Password</label>
                  <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="customer">Customer</option>
                    <option value="staff">Restaurant Owner (Staff)</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Create User</button>
              </form>
            </div>
          )}
          <div className="table-container card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                    <td>
                      <button className="btn-text delete">Disable</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
