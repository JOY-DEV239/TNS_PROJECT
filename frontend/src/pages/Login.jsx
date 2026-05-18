import React, { useState } from 'react';
import axios from '../axiosConfig';
import Cookies from 'js-cookie';

const Login = ({ setAuth }) => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Setup Password (if new), 4: Login
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const requestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/request-otp', { mobileNumber });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) { setMessage('Error requesting OTP'); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/verify-otp', { mobileNumber, otp: otp.trim() });
      setMessage(res.data.message);
      if (res.data.message.includes('configure email')) setStep(3);
      else setStep(4);
    } catch (err) { setMessage(err.response?.data?.message || 'Invalid OTP'); }
  };

  const setupPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/setup-password', { mobileNumber, email, password });
      setMessage(res.data.message);
      setStep(4);
    } catch (err) { setMessage(err.response?.data?.message || 'Error setting up password'); }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { mobileNumber, password });
      Cookies.set('jwt_token', res.data.token, { expires: 1 });
      setAuth(true);
    } catch (err) { setMessage('Invalid credentials'); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--accent)' }}>Placement Coordinator Login</h2>
        {message && <div style={{ padding: '10px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', marginBottom: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>{message}</div>}
        
        {step === 1 && (
          <form onSubmit={requestOtp}>
            <div className="form-group">
              <label>Mobile Number (Indian)</label>
              <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div className="form-group">
              <label>Enter OTP from Console</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={setupPassword}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Setup Password & Login</button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={login}>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
            <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setStep(1)}>Forgot Password?</p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
