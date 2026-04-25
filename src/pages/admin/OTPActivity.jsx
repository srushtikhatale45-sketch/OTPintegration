import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminOTPActivity = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { channel: filter } : {};
      const res = await api.get('/admin/otp-requests', { params });
      if (res.data.success) setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error loading OTP requests:', error);
    } finally {
      setLoading(false);
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

  const getChannelIcon = (channel) => {
    const icons = { email: '✉️', sms: '📱', whatsapp: '💬' };
    return icons[channel] || '📱';
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">OTP Activity</h1>
          <p className="text-gray-500">Monitor all OTP requests and verifications</p>
        </div>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('email')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'email' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            ✉️ Email
          </button>
          <button
            onClick={() => setFilter('sms')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'sms' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            📱 SMS
          </button>
          <button
            onClick={() => setFilter('whatsapp')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            💬 WhatsApp
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No OTP requests found</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.User?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.identifier}</td>
                      <td className="px-6 py-4"><span className="text-xl">{getChannelIcon(req.channel)}</span> <span className="capitalize ml-1">{req.channel}</span></td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>{req.status}</span></td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">${parseFloat(req.cost).toFixed(4)}</td>
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

export default AdminOTPActivity;