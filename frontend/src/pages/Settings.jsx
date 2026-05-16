import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
      setEmail(res.data.email || '');
    } catch (err) {
      setMessage('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/auth/me', { email, password });
      setMessage('Settings updated successfully.');
      if (password) setPassword('');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to update settings.');
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Update your account email and password.</p>

      {message && <div className="glass-card" style={{ marginBottom: '20px', padding: '15px' }}>{message}</div>}

      <div className="glass-card" style={{ maxWidth: '640px' }}>
        {loading ? <p>Loading profile...</p> : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Mobile Number</label>
              <input value={user?.mobileNumber || ''} disabled />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Role</label>
              <input value={user?.role || ''} disabled />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </div>
            <button type="submit" className="btn">Save Settings</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
