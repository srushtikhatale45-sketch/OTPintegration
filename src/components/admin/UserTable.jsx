import React from 'react';

const UserTable = ({ users = [], loading, pagination, onPageChange, onDelete, onRefresh }) => {
  const userList = Array.isArray(users) ? users : [];
  
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userList.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{user.id?.slice(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{user.company || '-'}</td>
                <td className="px-6 py-4">
                  <span className="font-medium text-green-600">${parseFloat(user.balance || 0).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
  );
};

export default UserTable;