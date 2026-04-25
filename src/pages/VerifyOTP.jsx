import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState('');

  useEffect(() => {
    const savedChannel = localStorage.getItem('channel');
    if (savedChannel) setChannel(savedChannel);
    
    // Redirect if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/user/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const requestId = localStorage.getItem('otpRequestId');
    
    if (!requestId) {
      setError('Session expired. Please login again.');
      setTimeout(() => navigate('/user/login'), 2000);
      return;
    }
    
    try {
      const res = await api.post('/otp/verify', { requestId, otpCode });
      
      if (res.data.success) {
        // Store token and user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.removeItem('otpRequestId');
        localStorage.removeItem('channel');
        
        // Redirect to user dashboard
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const channelIcons = { email: '✉️', sms: '📱', whatsapp: '💬' };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{channelIcons[channel] || '🔐'}</div>
          <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
          <p className="text-gray-500 mt-2">Enter the 6-digit code sent via {channel}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;