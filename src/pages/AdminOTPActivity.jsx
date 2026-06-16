import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaMobileAlt, FaWhatsapp, FaSyncAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminOTPActivity = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // all, true, false
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    loadRequests();
  }, [filter, verifiedFilter, pagination.page, refresh]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 20,
        ...(filter !== 'all' && { channel: filter }),
        ...(verifiedFilter !== 'all' && { verified: verifiedFilter })
      };
      const res = await api.get('/admin/otp-requests', { params });
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setPagination(res.data.pagination);
      }
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
    switch (channel) {
      case 'email': return <FaEnvelope className="text-gray-600" />;
      case 'sms': return <FaMobileAlt className="text-gray-600" />;
      case 'whatsapp': return <FaWhatsapp className="text-green-600" />;
      default: return <FaMobileAlt className="text-gray-600" />;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">OTP Activity Report</h1>
          <p className="text-gray-500">Monitor all OTP requests and verification status</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Channels</option>
            <option value="email">
              <FaEnvelope className="inline mr-1" /> Email
            </option>
            <option value="sms">
              <FaMobileAlt className="inline mr-1" /> SMS
            </option>
            <option value="whatsapp">
              <FaWhatsapp className="inline mr-1 text-green-600" /> WhatsApp
            </option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="true">
              <FaCheckCircle className="inline mr-1 text-green-600" /> Verified Only
            </option>
            <option value="false">
              <FaTimesCircle className="inline mr-1 text-red-600" /> Not Verified
            </option>
          </select>

          <button
            onClick={() => setRefresh(prev => prev + 1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No OTP requests found</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.User?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.identifier}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        {getChannelIcon(req.channel)}
                        <span className="capitalize">{req.channel}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{req.otpCode || '—'}</td>
                      <td className="px-6 py-4">
                        {req.isVerified ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1">
                            <FaCheckCircle /> Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                            <FaTimesCircle /> No
                          </span>
                        )}
                       </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">₹{parseFloat(req.cost).toFixed(4)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">{pagination.page}</span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOTPActivity;