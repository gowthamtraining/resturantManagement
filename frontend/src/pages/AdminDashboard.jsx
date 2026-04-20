import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0, activeMenuCount: 0, lowStockItems: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddRest, setShowAddRest] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingRest, setEditingRest] = useState(null);
  const [newRest, setNewRest] = useState({ name: '', description: '', address: '', ownerId: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' });
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    const [ordersRes, menuRes, usersRes, restRes] = await Promise.allSettled([
      api.get('/orders'),
      api.get('/menu'),
      api.get('/users'),
      api.get('/restaurants'),
    ]);

    if (ordersRes.status === 'fulfilled') {
      const orders = ordersRes.value.data;
      const totalSales = orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0);
      setStats(prev => ({ ...prev, totalOrders: orders.length, totalSales: totalSales.toFixed(2) }));
      setRecentOrders(orders.slice(0, 8));
    }
    if (menuRes.status === 'fulfilled') {
      const menu = menuRes.value.data;
      setStats(prev => ({ ...prev, activeMenuCount: menu.length, lowStockItems: menu.filter(i => i.countInStock < 5).length }));
    }
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
    if (restRes.status === 'fulfilled') setRestaurants(restRes.value.data);
    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      if (editingRest) {
        const { data } = await api.put(`/restaurants/${editingRest._id}`, { ...newRest, user: newRest.ownerId });
        setRestaurants(restaurants.map(r => r._id === data._id ? data : r));
        addToast('Restaurant updated!', 'success');
        setEditingRest(null);
      } else {
        const { data } = await api.post('/restaurants', {
          ...newRest, user: newRest.ownerId,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        });
        setRestaurants([...restaurants, data]);
        addToast('Restaurant created!', 'success');
      }
      setShowAddRest(false);
      setNewRest({ name: '', description: '', address: '', ownerId: '' });
    } catch {}
  };

  const startEdit = (rest) => {
    setEditingRest(rest);
    setNewRest({ name: rest.name, description: rest.description, address: rest.address, ownerId: rest.user });
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
      addToast('User created!', 'success');
    } catch {}
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <h2>Navigation</h2>
        <nav>
          {[
            { id: 'orders',      icon: '📦', label: 'Orders' },
            { id: 'restaurants', icon: '🍽️', label: 'Restaurants' },
            { id: 'users',       icon: '👥', label: 'Users' },
          ].map(tab => (
            <div
              key={tab.id}
              className={`rest-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
          <div className="rest-nav-item" onClick={() => navigate('/admin/inventory')}>📋 Inventory</div>
        </nav>
      </aside>

      {/* ─── Main ─── */}
      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>System <span>Administration</span></h1>
            <p>Monitor platform growth and manage all entities.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchDashboardData}>🔄 Refresh</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => setActiveTab('orders')}>
            <div className="stat-icon">💰</div>
            <span>Total Revenue</span>
            <h3>${stats.totalSales}</h3>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('orders')}>
            <div className="stat-icon">📦</div>
            <span>Total Orders</span>
            <h3>{stats.totalOrders}</h3>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('restaurants')}>
            <div className="stat-icon">🍽️</div>
            <span>Restaurants</span>
            <h3>{restaurants.length}</h3>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('users')}>
            <div className="stat-icon">👥</div>
            <span>Total Users</span>
            <h3>{users.length}</h3>
          </div>
          <div className="stat-card" onClick={() => navigate('/admin/inventory')}>
            <div className="stat-icon">⚠️</div>
            <span>Low Stock Items</span>
            <h3 style={{ color: stats.lowStockItems > 0 ? 'var(--accent)' : 'var(--accent-green)' }}>{stats.lowStockItems}</h3>
          </div>
        </div>

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <div className="section-card">
              <div className="section-card-header">
                <h2>Recent Orders</h2>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>View All →</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Restaurant</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8)}</td>
                      <td>{order.user?.name || '—'}</td>
                      <td>{order.restaurant?.name || '—'}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>${order.totalPrice?.toFixed(2)}</td>
                      <td><span className={`badge status-${order.status}`}>{order.status}</span></td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RESTAURANTS TAB ── */}
        {activeTab === 'restaurants' && (
          <div className="animate-fade-in">
            <div className="section-card">
              <div className="section-card-header">
                <h2>All Restaurants</h2>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowAddRest(!showAddRest); setEditingRest(null); setNewRest({ name:'',description:'',address:'',ownerId:'' }); }}>
                  {showAddRest ? 'Cancel' : '+ Add Restaurant'}
                </button>
              </div>

              {showAddRest && (
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>
                    {editingRest ? 'Edit Restaurant' : 'Create New Restaurant'}
                  </h3>
                  <form onSubmit={handleCreateRestaurant} className="grid-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input required value={newRest.name} onChange={e => setNewRest({ ...newRest, name: e.target.value })} placeholder="Restaurant name" />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input required value={newRest.address} onChange={e => setNewRest({ ...newRest, address: e.target.value })} placeholder="Full address" />
                    </div>
                    <div className="form-group">
                      <label>Owner User ID</label>
                      <input value={newRest.ownerId} onChange={e => setNewRest({ ...newRest, ownerId: e.target.value })} placeholder="Paste staff user ID" />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input value={newRest.description} onChange={e => setNewRest({ ...newRest, description: e.target.value })} placeholder="Short description" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" style={{ gridColumn: '1 / -1' }}>
                      {editingRest ? '✅ Save Changes' : '🚀 Create Restaurant'}
                    </button>
                  </form>
                </div>
              )}

              <table className="admin-table">
                <thead><tr><th>Name</th><th>Address</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {restaurants.map(r => (
                    <tr key={r._id}>
                      <td>{r.name}</td>
                      <td>{r.address}</td>
                      <td>{r.rating} ⭐</td>
                      <td>
                        <button className="btn-icon" onClick={() => startEdit(r)} title="Edit">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="section-card">
              <div className="section-card-header">
                <h2>All Users</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(!showAddUser)}>
                  {showAddUser ? 'Cancel' : '+ New User'}
                </button>
              </div>

              {showAddUser && (
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Create New User</h3>
                  <form onSubmit={handleCreateUser} className="grid-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                        <option value="customer">Customer</option>
                        <option value="staff">Restaurant Owner (Staff)</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" style={{ gridColumn: '1 / -1' }}>
                      Create User Account
                    </button>
                  </form>
                </div>
              )}

              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
