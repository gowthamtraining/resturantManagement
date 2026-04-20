import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    countInStock: 0,
    isAvailable: true,
    restaurantId: ''
  });

  const fetchInitialData = async () => {
    try {
      const [menuRes, restRes] = await Promise.all([
        api.get('/menu'),
        api.get('/restaurants')
      ]);
      setMenuItems(menuRes.data);
      setRestaurants(restRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      countInStock: item.countInStock,
      isAvailable: item.isAvailable,
      restaurantId: item.restaurant
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, formData);
      } else {
        await api.post('/menu', formData);
      }
      setEditingItem(null);
      setFormData({ name: '', price: 0, description: '', category: '', countInStock: 0, isAvailable: true, restaurantId: '' });
      fetchInitialData();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu/${id}`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) return <div>Loading Inventory...</div>;

  return (
    <div className="inventory-page animate-fade-in">
      <header className="page-header">
        <h1>Inventory & Menu Management</h1>
      </header>

      <div className="inventory-grid">
        <section className="item-list card">
          <h2>Menu Items</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Restaurant</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {restaurants.find(r => r._id === item.restaurant)?.name || 'Unknown'}
                    </td>
                    <td>{item.category}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td className={item.countInStock < 10 ? 'low-stock-text' : ''}>
                      {item.countInStock}
                    </td>
                    <td>{item.isAvailable ? '✅' : '❌'}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(item)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(item._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="item-form card">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Restaurant</label>
              <select 
                required 
                value={formData.restaurantId} 
                onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
              >
                <option value="">Select Restaurant...</option>
                {restaurants.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Item Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group row">
              <div>
                <label>Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
                  required 
                />
              </div>
              <div>
                <label>Stock Qty</label>
                <input 
                  type="number" 
                  value={formData.countInStock} 
                  onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})} 
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group checkbox">
              <input 
                type="checkbox" 
                id="isAvailable"
                checked={formData.isAvailable} 
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} 
              />
              <label htmlFor="isAvailable">Is Available</label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              {editingItem && (
                <button type="button" className="btn btn-outline" onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', price: 0, description: '', category: '', countInStock: 0, isAvailable: true });
                }}>Cancel</button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Inventory;
