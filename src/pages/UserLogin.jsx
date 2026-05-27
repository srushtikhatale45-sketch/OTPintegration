import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserLogin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/user/login', { identifier, channel, name });
      if (res.data.success) {
        sessionStorage.setItem('otpRequestId', res.data.requestId);
        sessionStorage.setItem('channel', res.data.channel);
        sessionStorage.setItem('identifier', identifier);
        sessionStorage.setItem('customerName', name);
        if (res.data.devOtp) alert(`Your OTP is: ${res.data.devOtp}`);
        navigate('/verify');
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { id: 'email', name: 'Email', icon: '✉️', color: 'blue', price: 'Free' },
    { id: 'sms', name: 'SMS', icon: '📱', color: 'green', price: 'Free' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'purple', price: 'Free' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-900 px-6 py-8 text-white text-center">
        
          <h1 className="text-2xl font-bold">Welcome to OTPless</h1>
          <p className="text-blue-100 mt-2">Verify your identity with one‑time code</p>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
              <input type="text" placeholder="e.g., John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
              <input type="text" placeholder="email@example.com or +91 9876543210" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Channel</label>
              <div className="grid grid-cols-3 gap-3">
                {channels.map((ch) => (
                  <button type="button" key={ch.id} onClick={() => setChannel(ch.id)} className={`py-3 rounded-xl border-2 transition-all ${channel === ch.id ? `bg-${ch.color}-600 text-white border-${ch.color}-600 shadow-md` : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                    <span className="text-2xl">{ch.icon}</span>
                    <div className="text-xs mt-1 font-medium">{ch.name}</div>
                    <div className="text-xs opacity-75">{ch.price}</div>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50 shadow-md">
              {loading ? 'Sending OTP...' : 'Send '}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>We'll send a verification code to your selected channel.</p>
            <p className="mt-1">No credit card required – completely free for end users.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;