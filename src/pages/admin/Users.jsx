import React, { useState, useEffect } from 'react';
import{useNavigate} from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false); // Fixed: was showModal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    services: { sms: true, whatsapp: false, email: true },
    initialBalance: 0
  });
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    isActive: true,
    services: { sms: true, whatsapp: false, email: true }
  });

 const [otpStats, setOtpStats] = useState([]);

const loadOTPStats = async () => {
  try {
    const res = await api.get('/admin/user-otp-stats');
    if (res.data.success) setOtpStats(res.data.stats);
  } catch (error) {
    console.error('Error loading OTP stats:', error);
  }
};

useEffect(() => {
  loadUsers();
  loadServices();
  loadOTPStats(); // new
}, [pagination.page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page: pagination.page, limit: 20, search } });
      if (res.data.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get('/admin/services');
      if (res.data.success) setServices(res.data.services);
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (!createForm.password) {
      alert('Password is required');
      return;
    }
    
    try {
      const res = await api.post('/admin/users', {
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone,
        company: createForm.company,
        password: createForm.password,
        services: createForm.services,
        initialBalance: createForm.initialBalance
      });
      
      if (res.data.success) {
        alert('User created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          password: '',
          services: { sms: true, whatsapp: false, email: true },
          initialBalance: 0
        });
        loadUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await api.put(`/admin/users/${editingUser.id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        company: editForm.company,
        isActive: editForm.isActive,
        services: editForm.services
      });
      
      if (res.data.success) {
        alert('User updated successfully!');
        setShowEditModal(false);
        setEditingUser(null);
        loadUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        alert('User deleted successfully!');
        loadUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleAddPayment = async () => {
    if (!selectedUser) return;
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      await api.post(`/admin/users/${selectedUser.id}/payment`, {
        amount: parseFloat(paymentAmount),
        description: paymentDescription || 'Admin credited payment'
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentDescription('');
      loadUsers();
      alert('Payment added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add payment');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      isActive: user.isActive !== false,
      services: user.services || { sms: true, whatsapp: false, email: true }
    });
    setShowEditModal(true);
  };
const handleViewDashboard = (user) => {
  navigate(`/admin/user-dashboard/${user.id}`);
};
  const handleServiceToggle = (service, isCreate = true) => {
    if (isCreate) {
      setCreateForm({
        ...createForm,
        services: { ...createForm.services, [service]: !createForm.services[service] }
      });
    } else {
      setEditForm({
        ...editForm,
        services: { ...editForm.services, [service]: !editForm.services[service] }
      });
    }
  };

  const handleCreateServiceToggle = (service) => {
    setCreateForm({
      ...createForm,
      services: { ...createForm.services, [service]: !createForm.services[service] }
    });
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
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500">Manage users, services, and payments</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add User
          </button>
        </div>

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }} 
            className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.services?.sms && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">SMS</span>}
                        {user.services?.whatsapp && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">WhatsApp</span>}
                        {user.services?.email && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Email</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">₹{parseFloat(user.balance || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedUser(user); setShowPaymentModal(true); }} 
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Add Payment
                        </button>
                        <button 
                          onClick={() => openEditModal(user)} 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)} 
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                        <button onClick={() => handleViewDashboard(user)} className="text-indigo-600 hover:text-indigo-800">
  Dashboard
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                  {pagination.page}
                </span>
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

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New User</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password *"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={createForm.company}
                  onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Services Allowed</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={createForm.services.sms} onChange={() => handleCreateServiceToggle('sms')} />
                      <span>📱 SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={createForm.services.whatsapp} onChange={() => handleCreateServiceToggle('whatsapp')} />
                      <span>💬 WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={createForm.services.email} onChange={() => handleCreateServiceToggle('email')} />
                      <span>✉️ Email</span>
                    </label>
                  </div>
                </div>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Initial Balance (₹)"
                  value={createForm.initialBalance}
                  onChange={(e) => setCreateForm({ ...createForm, initialBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Create User
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit User</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <form onSubmit={handleEditUser} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Services Allowed</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={editForm.services.sms} onChange={() => handleServiceToggle('sms', false)} />
                      <span>📱 SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={editForm.services.whatsapp} onChange={() => handleServiceToggle('whatsapp', false)} />
                      <span>💬 WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={editForm.services.email} onChange={() => handleServiceToggle('email', false)} />
                      <span>✉️ Email</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  <span>Account Active</span>
                </label>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Current Balance: <strong>₹{parseFloat(editingUser.balance || 0).toFixed(2)}</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Update User
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Payment for {selectedUser.name}</h2>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Balance</label>
                  <p className="text-green-600 font-bold">₹{parseFloat(selectedUser.balance || 0).toFixed(2)}</p>
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Amount (₹)" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                />
                <input 
                  type="text" 
                  placeholder="Description (optional)" 
                  value={paymentDescription} 
                  onChange={(e) => setPaymentDescription(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    New balance will be: <strong>₹{(parseFloat(selectedUser.balance || 0) + (parseFloat(paymentAmount) || 0)).toFixed(2)}</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddPayment} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    Add Payment
                  </button>
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;