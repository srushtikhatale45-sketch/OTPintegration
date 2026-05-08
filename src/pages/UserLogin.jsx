import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/user/dashboard');
    }
  }, [navigate]);

  const channels = [
    { id: 'email', name: 'Email', icon: '✉️', color: 'purple' },
    { id: 'sms', name: 'SMS', icon: '📱', color: 'blue' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'green' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/user/login', { identifier, channel });
      if (res.data.success) {
        localStorage.setItem('otpRequestId', res.data.requestId);
        localStorage.setItem('channel', res.data.channel);
        navigate('/verify');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-500 mt-2">Enter your email or phone to receive OTP</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Email or Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <div className="grid grid-cols-3 gap-3">
            {channels.map((ch) => (
              <button
                type="button"
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                className={`py-3 rounded-lg border transition-all capitalize ${
                  channel === ch.id
                    ? `bg-${ch.color}-600 text-white border-${ch.color}-600`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-xl">{ch.icon}</span>
                <div className="text-xs mt-1">{ch.name}</div>
              </button>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;