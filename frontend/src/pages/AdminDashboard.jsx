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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: orders } = await api.get('/orders');
        const { data: menuItems } = await api.get('/menu');

        const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
        const lowStock = menuItems.filter(item => item.countInStock < 10).length;

        setStats({
          totalOrders: orders.length,
          totalSales: totalSales.toFixed(2),
          activeMenuCount: menuItems.length,
          lowStockItems: lowStock,
        });

        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard animate-fade-in">
      <header className="admin-header">
        <h1>Admin Control Panel</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/inventory')} className="btn btn-primary">Manage Inventory</button>
          <button onClick={() => navigate('/admin/orders')} className="btn btn-outline">View All Orders</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalSales}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍕</div>
          <div className="stat-info">
            <h3>Active Menu</h3>
            <p className="stat-value">{stats.activeMenuCount} Items</p>
          </div>
        </div>
        <div className="stat-card low-stock">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p className="stat-value">{stats.lowStockItems}</p>
          </div>
        </div>
      </div>

      <section className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.substring(19)}</td>
                  <td>{order.user?.name || 'Customer'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-text" 
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
