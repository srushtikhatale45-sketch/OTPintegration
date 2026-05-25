import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EndUserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [otpHistory, setOtpHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!loggedIn) {
      navigate('/user/login');
      return;
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/user/enduser-dashboard');
      if (res.data.success) {
        setOtpHistory(res.data.otpHistory || []);
        setStats(res.data.stats);
        setUser(res.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userRole');
        navigate('/user/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');   // clears the httpOnly cookies
    } catch (err) { /* ignore */ }
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userRole');
    navigate('/user/login');
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">OTP Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.email || user?.phone || user?.name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My OTP Activity</h1>
          <p className="text-gray-500">View your OTP request history and verification status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total OTPs</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Verified</p>
            <p className="text-2xl font-bold text-green-600">{stats?.verified || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          </div>
        </div>

        {/* OTP History Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">OTP Request History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {otpHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No OTP requests found
                     </td>
                   </tr>
                ) : (
                  otpHistory.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.identifier}</td>
                      <td className="px-6 py-4 text-sm capitalize">{req.channel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          req.status === 'verified' ? 'bg-green-100 text-green-700' :
                          req.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.isVerified ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-gray-500">✗ No</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndUserDashboard;