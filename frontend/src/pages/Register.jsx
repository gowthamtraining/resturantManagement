import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [regError, setRegError] = useState(null);

  const { register, user, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'customer' ? '/restaurants' : '/restaurant-portal');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    await register(name, email, password, role);
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card card glass">
        <h2>Create <span>Account</span></h2>
        <p>Join Royal Kitchen for the ultimate dining experience.</p>

        {(error || regError) && <div className="error-msg">{error || regError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Registration Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
              <option value="customer">Customer (Order Food)</option>
              <option value="staff">Restaurant Owner (Add Menu)</option>
              <option value="admin">System Admin (Manage Restaurants)</option>
            </select>
          </div>
          <div className="form-group row">
            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Confirm</label>
              <input
                type="password"
                placeholder="Confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
