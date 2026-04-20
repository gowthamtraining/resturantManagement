import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBill, setShowBill] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleViewBill = (order) => {
    setSelectedOrder(order);
    setShowBill(true);
  };

  if (loading) return <div>Loading Orders...</div>;

  return (
    <div className="admin-orders-page animate-fade-in">
      <header className="page-header">
        <h1>Order Management & Billing</h1>
      </header>

      <div className="orders-list card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.substring(19)}</td>
                  <td>
                    <strong>{order.user?.name}</strong><br />
                    <small>{order.user?.email}</small>
                  </td>
                  <td>{order.orderItems.length} items</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleViewBill(order)}>
                      📄 View Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBill && selectedOrder && (
        <div className="bill-modal-overlay">
          <div className="bill-modal card animate-fade-in">
            <div className="bill-header">
              <h2>INVOICE</h2>
              <button className="close-btn" onClick={() => setShowBill(false)}>×</button>
            </div>

            <div className="bill-content" id="printable-bill">
              <div className="restaurant-info">
                <h3>Royal Kitchen</h3>
                <p>123 Galaxy Way, Suite 42</p>
                <p>Tel: +1 (555) 000-1111</p>
              </div>

              <div className="bill-details">
                <div>
                  <strong>Bill To:</strong>
                  <p>{selectedOrder.user?.name}</p>
                  <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                </div>
                <div className="align-right">
                  <p><strong>Order ID:</strong> #{selectedOrder._id}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedOrder.status.toUpperCase()}</p>
                </div>
              </div>

              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bill-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${(selectedOrder.totalPrice - selectedOrder.taxPrice - selectedOrder.shippingPrice).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${selectedOrder.taxPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Service:</span>
                  <span>${selectedOrder.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="bill-footer">
                <p>Thank you for dining with us!</p>
                <div className="qr-placeholder">QR Code for Feedback</div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => window.print()}>Print Invoice</button>
              <button className="btn btn-outline" onClick={() => setShowBill(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
