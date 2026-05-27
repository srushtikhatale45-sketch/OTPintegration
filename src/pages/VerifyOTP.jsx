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
    const savedChannel = sessionStorage.getItem('channel');
    if (savedChannel) setChannel(savedChannel);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const requestId = sessionStorage.getItem('otpRequestId');
    if (!requestId) {
      setError('Session expired. Please go back and try again.');
      setTimeout(() => navigate('/user/login'), 2000);
      return;
    }
    try {
      const res = await api.post('/auth/user/verify', { requestId, otpCode });
      console.log('Verification response:', res.data);

      if (res.data.success && res.data.verified) {

  console.log('VERIFY RESPONSE:', res.data);

  localStorage.setItem('loggedIn', 'true');

  // SAVE USER
  localStorage.setItem(
    'user',
    JSON.stringify(res.data.user || {})
  );

  // SAVE ROLE
  if (res.data.userType === 'end_user') {

    localStorage.setItem('userRole', 'end_user');

    navigate('/enduser/dashboard');

  } else {

    localStorage.setItem('userRole', 'user');
    navigate('/enduser/dashboard');
  }
}else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const channelIcons = { email: '✉️', sms: '📱', whatsapp: '💬' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-900 px-6 py-8 text-white text-center">
          <div className="text-5xl mb-4">{channelIcons[channel] || '🔐'}</div>
          <h1 className="text-2xl font-bold">Check your device</h1>
          <p className="text-blue-100 mt-2">Enter the 6‑digit code we sent via {channel}</p>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Verifying...' : 'Verify & continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;