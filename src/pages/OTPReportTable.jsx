import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OTPReportTable = ({ 
  limit = 10, 
  showViewAll = true, 
  refreshInterval = 0,
  onRowClick 
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadOTPs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/otp-requests', { params: { page, limit } });
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setPagination({
          page: res.data.pagination?.page || 1,
          totalPages: res.data.pagination?.totalPages || 1,
          total: res.data.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error('Error loading OTPs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOTPs(1);
    if (refreshInterval > 0) {
      const interval = setInterval(() => loadOTPs(pagination.page), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, refreshInterval]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadOTPs(newPage);
    }
  };

  const getChannelIcon = (channel) => {
    const icons = { email: '✉️', sms: '📱', whatsapp: '💬' };
    return icons[channel] || '📱';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading OTP requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No OTP requests found</p>
          <p className="text-sm mt-2">OTP requests will appear here once users send OTPs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr 
                key={req.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick && onRowClick(req)}
              >
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {req.User?.name || req.user?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {req.identifier}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl">{getChannelIcon(req.channel)}</span>
                  <span className="capitalize ml-1 text-sm">{req.channel}</span>
                </td>
                <td className="px-6 py-4">
                  {req.isVerified ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">true</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">false</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                  ₹{parseFloat(req.cost).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total entries)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
              {pagination.page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPReportTable;