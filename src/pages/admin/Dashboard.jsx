import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [adminBalance, setAdminBalance] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setAdminBalance(res.data.adminBalance || 0);
        setRecentActivities(res.data.recentActivities || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: '✅', color: 'bg-green-500' },
    { title: 'Total OTP Requests', value: stats?.totalOTPRequests || 0, icon: '📱', color: 'bg-purple-500' },
    { title: 'Successful Verifications', value: stats?.successfulVerifications || 0, icon: '✓', color: 'bg-teal-500' },
    { title: 'Total Revenue', value: `$${stats?.revenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'bg-yellow-500' },
    { title: 'Admin Balance', value: `$${adminBalance.toFixed(2)}`, icon: '💳', color: 'bg-indigo-500' }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of your OTP platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((card, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">{card.title}</p>
                  <p className="text-xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Channel Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Channel Usage Statistics</h3>
            <div className="space-y-4">
              {stats?.channelStats?.map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize text-gray-600">{stat.channel}</span>
                    <span className="text-gray-600">{stat.count} requests</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.channel === 'sms' ? 'bg-blue-500' :
                        stat.channel === 'whatsapp' ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${(stat.count / (stats?.totalOTPRequests || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b">
                  <span className="text-gray-400 text-xs">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                  <span className="text-gray-600">{activity.action}</span>
                  <span className="text-xs text-gray-500">{activity.details?.user || ''}</span>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;