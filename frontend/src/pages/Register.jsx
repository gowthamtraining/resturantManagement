import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const ROLES = [
  { value: 'customer', emoji: '🛍️', label: 'Customer' },
  { value: 'staff',    emoji: '🍳', label: 'Restaurant Owner' },
  { value: 'admin',    emoji: '⚙️', label: 'System Admin' },
];

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
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/restaurant-portal');
      else navigate('/restaurants');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    if (password !== confirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    await register(name, email, password, role);
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <h2>Create <span>Account</span></h2>
        <p>Join us for the ultimate dining experience.</p>

        {(error || regError) && <div className="error-msg">{error || regError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Select Your Role</label>
            <div className="role-picker">
              {ROLES.map(r => (
                <label key={r.value} className="role-option">
                  <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                  <span className="role-option-label">
                    <span className="role-emoji">{r.emoji}</span>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group row">
            <div>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label>Confirm</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem', fontSize: '1rem', padding: '0.85rem' }}>
            Create Account →
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
