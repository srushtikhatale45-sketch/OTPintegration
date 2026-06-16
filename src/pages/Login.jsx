// src/pages/BusinessLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import api from '../services/api';

const BusinessLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userRole', res.data.role);
        // SAVE JWT TOKEN
        localStorage.setItem('token', res.data.token);
        if (res.data.role === 'admin') {
          localStorage.setItem('admin', JSON.stringify(res.data.admin));
          navigate('/admin/dashboard');
        } else {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/user/dashboard');
        }
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold">Business Login</h1>
          <p className="text-slate-300 mt-2">Access your OTP platform dashboard</p>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" placeholder="Email or phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500" required />
            <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition">{loading ? 'Authenticating...' : 'Sign in'}</button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            <a href="/user/login" className="text-slate-600 hover:underline inline-flex items-center gap-1">
              Customer? Use OTP login <FaArrowRight className="text-xs" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLogin;