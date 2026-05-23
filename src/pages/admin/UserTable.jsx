import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserTable = ({ 
  users = [], 
  loading, 
  pagination, 
  onPageChange, 
  onDelete, 
  onEdit, 
  onRefresh,
  otpStats = []  // new prop: array of stats per user
}) => {
  const navigate = useNavigate();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const userList = Array.isArray(users) ? users : [];

const handleViewDashboard = (user) => {
  navigate(`/admin/user-dashboard/${user.id}`);
};
  const handleViewOTPStats = (user) => {
    const stats = otpStats.find(s => s.userId === user.id) || {
      totalAttempts: 0,
      verifiedCount: 0,
      failedCount: 0,
      pendingCount: 0
    };
    setSelectedUserStats({ ...user, ...stats });
    setShowStatsModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (userList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>No users found</p>
          <p className="text-sm mt-2">Click "Add User" to create your first user</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userList.map((user) => {
                const stats = otpStats.find(s => s.userId === user.id) || {
                  totalAttempts: 0,
                  verifiedCount: 0,
                  failedCount: 0,
                  pendingCount: 0
                };
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{user.id?.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{user.company || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">₹{parseFloat(user.balance || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOTPStats(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        {stats.totalAttempts} attempts
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewDashboard(user)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Dashboard
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Modal */}
      {showStatsModal && selectedUserStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">OTP Statistics</h2>
              <button onClick={() => setShowStatsModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <p><strong>User:</strong> {selectedUserStats.name}</p>
              <p><strong>Email:</strong> {selectedUserStats.email}</p>
              <div className="border-t pt-3">
                <div className="flex justify-between py-1">
                  <span>Total OTP Attempts:</span>
                  <span className="font-bold">{selectedUserStats.totalAttempts}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>✅ Verified:</span>
                  <span className="text-green-600 font-bold">{selectedUserStats.verifiedCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>❌ Failed:</span>
                  <span className="text-red-600 font-bold">{selectedUserStats.failedCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>⏳ Pending/Expired:</span>
                  <span className="text-yellow-600 font-bold">{selectedUserStats.pendingCount}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
            
          </div>
        </div>
        
      )}
    </>
  );
};

export default UserTable;