import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [otpRequests, setOtpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/user/login');
      return;
    }
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Ensure balance is a number
        if (parsedUser && parsedUser.balance) {
          parsedUser.balance = parseFloat(parsedUser.balance);
        }
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      // Get user profile
      const profileRes = await api.get('/user/profile');
      if (profileRes.data.success) {
        const userData = profileRes.data.user;
        // Ensure balance is a number
        if (userData && userData.balance) {
          userData.balance = parseFloat(userData.balance);
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Get user activity logs
      const activityRes = await api.get('/user/activities');
      if (activityRes.data.success) {
        setActivities(activityRes.data.activities || []);
      }
      
      // Get user OTP requests
      const otpRes = await api.get('/user/otp-requests');
      if (otpRes.data.success) {
        setOtpRequests(otpRes.data.requests || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/user/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/user/login');
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'email': return '✉️';
      case 'sms': return '📱';
      case 'whatsapp': return '💬';
      default: return '📱';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-700',
      sent: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Safely get balance as number
  const getBalance = () => {
    if (!user || user.balance === undefined || user.balance === null) return 0;
    return parseFloat(user.balance) || 0;
  };

  // Calculate total spent
  const getTotalSpent = () => {
    return otpRequests
      .filter(r => r.status === 'verified')
      .reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">OTP Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Balance: <span className="font-bold text-green-600">${getBalance().toFixed(2)}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-gray-500 mt-1">Manage your account and view your OTP activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">Total OTP Requests</p>
            <p className="text-2xl font-bold text-gray-800">{otpRequests.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">Successful Verifications</p>
            <p className="text-2xl font-bold text-green-600">
              {otpRequests.filter(r => r.status === 'verified').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">
              ${getTotalSpent().toFixed(4)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-sm">Remaining Balance</p>
            <p className="text-2xl font-bold text-blue-600">${getBalance().toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('otp-history')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'otp-history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                OTP History
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'activity'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="space-y-3">
                    <div><label className="text-gray-500">Name:</label> <span className="font-medium">{user?.name || 'N/A'}</span></div>
                    <div><label className="text-gray-500">Email:</label> <span className="font-medium">{user?.email || 'N/A'}</span></div>
                    <div><label className="text-gray-500">Phone:</label> <span className="font-medium">{user?.phone || 'Not provided'}</span></div>
                    <div><label className="text-gray-500">Company:</label> <span className="font-medium">{user?.company || 'Not provided'}</span></div>
                    <div><label className="text-gray-500">Member Since:</label> <span className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                        </span>
                        <span className="text-gray-600">{activity.action}</span>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-gray-500">No recent activity</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTP History Tab */}
          {activeTab === 'otp-history' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {otpRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl">{getChannelIcon(req.channel)}</span>
                        <span className="ml-2 capitalize text-sm">{req.channel}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.identifier}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ${(parseFloat(req.cost) || 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  {otpRequests.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No OTP requests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activities.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{activity.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {activity.details ? JSON.stringify(activity.details) : '-'}
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No activity found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;