import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import AnalyticsCards from '../../components/admin/AnalyticsCards';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [channelStats, setChannelStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setChannelStats(res.data.channelStats || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome to your OTP Platform Admin Dashboard</p>
        </div>
        <AnalyticsCards stats={stats} channelStats={channelStats} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;