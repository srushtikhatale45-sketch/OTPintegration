import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminUserDashboardView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    loadUserDashboard();
  }, [userId]);

  const loadUserDashboard = async () => {
    try {
      const res = await api.get(`/admin/user-dashboard/${userId}`);
      if (res.data.success) {
        setUser(res.data.user);
        setCampaigns(res.data.campaigns || []);
        setMessages(res.data.messages || []);
        setReport(res.data.report);
      }
    } catch (error) {
      console.error('Error loading user dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Dashboard: {user?.name}</h1>
            <p className="text-gray-500">Viewing user's activity and billing (read‑only)</p>
          </div>
          <button 
            onClick={() => navigate('/admin/users')} 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <FaArrowLeft />
            <span>Back to Users</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-500 text-sm">User</p><p className="font-bold">{user?.name}</p><p className="text-xs text-gray-400">{user?.email}</p></div>
          <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-500 text-sm">Balance</p><p className="text-2xl font-bold text-green-600">₹{parseFloat(user?.balance || 0).toFixed(2)}</p></div>
          <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-500 text-sm">Total Messages</p><p className="text-2xl font-bold">{report?.totalMessages || 0}</p></div>
          <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-500 text-sm">Total Spent</p><p className="text-2xl font-bold text-blue-600">₹{report?.totalSpent?.toFixed(4) || '0.0000'}</p></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button onClick={() => setActiveTab('campaigns')} className={`px-6 py-3 font-medium ${activeTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Campaigns</button>
              <button onClick={() => setActiveTab('messages')} className={`px-6 py-3 font-medium ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Messages</button>
              <button onClick={() => setActiveTab('payments')} className={`px-6 py-3 font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Payment History</button>
            </div>
          </div>
          <div className="p-6">
            {activeTab === 'campaigns' && (campaigns.length === 0 ? <p className="text-gray-500 text-center py-8">No campaigns</p> : campaigns.map(c => (
              <div key={c.id} className="border rounded-lg p-4 mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{c.message}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <FaCheckCircle /> {c.successCount || 0} sent
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <FaTimesCircle /> {c.failedCount || 0} failed
                  </span>
                  <span className="text-blue-600">💰 ₹{parseFloat(c.totalCost || 0).toFixed(4)}</span>
                </div>
              </div>
            )))}
            {activeTab === 'messages' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Recipient</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Channel</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 text-sm">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">{m.recipient}</td>
                        <td className="px-4 py-2 text-sm capitalize">{m.channel}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${m.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">₹{parseFloat(m.cost).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'payments' && (report?.payments?.length === 0 ? <p className="text-gray-500 text-center py-8">No payments</p> : report?.payments?.map((p,i) => (
              <div key={i} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">₹{parseFloat(p.amount).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </div>
                <p className="text-sm text-gray-400">{new Date(p.createdAt).toLocaleString()}</p>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDashboardView;