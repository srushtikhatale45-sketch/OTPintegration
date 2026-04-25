import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user/login');
      return;
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [profileRes, campaignsRes, messagesRes, reportRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/campaigns'),
        api.get('/user/messages'),
        api.get('/user/report')
      ]);
      
      if (profileRes.data.success) setUser(profileRes.data.user);
      if (campaignsRes.data.success) setCampaigns(campaignsRes.data.campaigns);
      if (messagesRes.data.success) setMessages(messagesRes.data.messages);
      if (reportRes.data.success) setReport(reportRes.data.report);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post('/user/campaigns', {
        name: formData.get('name'),
        message: formData.get('message'),
        channel: formData.get('channel'),
        recipients: formData.get('recipients').split(',')
      });
      loadAllData();
      alert('Campaign sent successfully!');
      e.target.reset();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  const getBalance = () => {
    if (!user || user.balance === undefined) return 0;
    return parseFloat(user.balance) || 0;
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
            <div className="text-right">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="font-bold text-green-600">${getBalance().toFixed(2)}</p>
            </div>
            <button
              onClick={() => { localStorage.clear(); navigate('/user/login'); }}
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
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-gray-500">Manage your OTP campaigns and view reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Messages</p>
            <p className="text-2xl font-bold">{report?.totalMessages || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Successful</p>
            <p className="text-2xl font-bold text-green-600">{report?.successful || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-600">{report?.failed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-blue-600">${report?.totalSpent?.toFixed(4) || '0.0000'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button onClick={() => setActiveTab('campaigns')} className={`px-6 py-3 font-medium transition ${activeTab === 'campaigns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                Message Campaigns
              </button>
              <button onClick={() => setActiveTab('documentation')} className={`px-6 py-3 font-medium transition ${activeTab === 'documentation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                Documentation & API
              </button>
              <button onClick={() => setActiveTab('report')} className={`px-6 py-3 font-medium transition ${activeTab === 'report' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                Reports & Billing
              </button>
            </div>
          </div>

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">⚠️ Note: Your balance will be deducted for each OTP sent. Current balance: <strong>${getBalance().toFixed(2)}</strong></p>
                {getBalance() <= 0 && <p className="text-sm text-red-600 mt-2">⚠️ Insufficient balance. Please contact admin to add credits.</p>}
              </div>

              <form onSubmit={handleSendCampaign} className="mb-8 space-y-4">
                <h3 className="text-lg font-semibold">Create New Campaign</h3>
                <input type="text" name="name" placeholder="Campaign Name" className="w-full px-4 py-2 border rounded-lg" required />
                <textarea name="message" placeholder="Message Content" rows="3" className="w-full px-4 py-2 border rounded-lg" required></textarea>
                <select name="channel" className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input type="text" name="recipients" placeholder="Recipients (comma-separated emails/phones)" className="w-full px-4 py-2 border rounded-lg" required />
                <button type="submit" disabled={getBalance() <= 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Send Campaign
                </button>
              </form>

              <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{campaign.name}</span>
                      <span className="text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{campaign.message}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-green-600">✓ {campaign.successCount} sent</span>
                      <span className="text-red-600">✗ {campaign.failedCount} failed</span>
                      <span className="text-blue-600">💰 ${parseFloat(campaign.cost).toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">API Integration</h3>
                <button onClick={() => setShowApiModal(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg mb-4">
                  Show API Credentials
                </button>
                <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`# Send OTP API
POST https://otpintegrationbackend.onrender.com/api/otp/send
Content-Type: application/json

{
  "identifier": "user@example.com",
  "channel": "email"
}

# Verify OTP API
POST https://otpintegrationbackend.onrender.com/api/otp/verify
Content-Type: application/json

{
  "requestId": "uuid-here",
  "otpCode": "123456"
}

# Get User Info
GET https://otpintegrationbackend.onrender.com/api/user/profile
Authorization: Bearer YOUR_TOKEN`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Integration Example (Node.js)</h3>
                <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`const axios = require('axios');

// Send OTP
async function sendOTP() {
  const response = await axios.post(
    'https://otpintegrationbackend.onrender.com/api/otp/send',
    {
      identifier: 'user@example.com',
      channel: 'email'
    }
  );
  console.log(response.data);
}

// Verify OTP
async function verifyOTP(requestId, otpCode) {
  const response = await axios.post(
    'https://otpintegrationbackend.onrender.com/api/otp/verify',
    { requestId, otpCode }
  );
  console.log(response.data);
}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Message Activity Report</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{new Date(msg.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">{msg.campaignName || '-'}</td>
                        <td className="px-6 py-4 capitalize">{msg.channel}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${msg.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-green-600">${parseFloat(msg.cost).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment History */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="space-y-3">
                  {report?.payments?.map((payment, i) => (
                    <div key={i} className="flex justify-between items-center border-b py-2">
                      <div>
                        <p className="font-medium">${parseFloat(payment.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{payment.description}</p>
                      </div>
                      <p className="text-sm text-gray-400">{new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Credentials Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Your API Credentials</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">API Key</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user?.apiKey || 'Not generated'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Secret Key</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">••••••••••••••••</p>
              </div>
              <button onClick={() => setShowApiModal(false)} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;