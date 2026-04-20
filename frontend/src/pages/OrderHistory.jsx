import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching my orders:', error);
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) return <div className="loading">Fetching your orders...</div>;

  return (
    <div className="orders-page animate-fade-in">
      <h1>My <span>Orders</span></h1>
      
      {orders.length === 0 ? (
        <div className="card empty-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card card">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order._id.substring(19)}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`badge status-${order.status}`}>{order.status}</span>
              </div>
              
              <div className="order-items">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.qty} × {item.name}</span>
                    <span>${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="payment-status">
                  Payment: <span className={order.isPaid ? 'paid' : 'unpaid'}>
                    {order.isPaid ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="total-price">
                  Total: <strong>${order.totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
