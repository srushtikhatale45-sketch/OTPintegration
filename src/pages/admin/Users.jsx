import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    services: { sms: true, whatsapp: false, email: true },
    initialBalance: 0
  });

  useEffect(() => { loadUsers(); loadServices(); }, [pagination.page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page: pagination.page, search } });
      if (res.data.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const loadServices = async () => {
    try {
      const res = await api.get('/admin/services');
      if (res.data.success) setServices(res.data.services);
    } catch (error) { console.error(error); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', company: '', services: { sms: true, whatsapp: false, email: true }, initialBalance: 0 });
      loadUsers();
    } catch (error) { alert(error.response?.data?.message || 'Failed to create user'); }
  };

  const handleAddPayment = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/admin/users/${selectedUser.id}/payment`, {
        amount: parseFloat(paymentAmount),
        description: paymentDescription
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

  const handleServiceToggle = (service) => {
    setFormData({
      ...formData,
      services: { ...formData.services, [service]: !formData.services[service] }
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500">Manage users, services, and payments</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add User
          </button>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 px-4 py-2 border rounded-lg" />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {user.services?.sms && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">SMS</span>}
                      {user.services?.whatsapp && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">WhatsApp</span>}
                      {user.services?.email && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Email</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green-600">${parseFloat(user.balance).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setSelectedUser(user); setShowPaymentModal(true); }} className="text-green-600 hover:text-green-800">
                      Add Payment
                    </button>
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create User Modal with Service Selection */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New User</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Services Allowed</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.services.sms} onChange={() => handleServiceToggle('sms')} />
                      <span>SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.services.whatsapp} onChange={() => handleServiceToggle('whatsapp')} />
                      <span>WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.services.email} onChange={() => handleServiceToggle('email')} />
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                <input type="number" step="0.01" placeholder="Initial Balance" value={formData.initialBalance} onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Create User</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Payment for {selectedUser.name}</h2>
              <div className="space-y-4">
                <input type="number" step="0.01" placeholder="Amount ($)" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Description" value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={handleAddPayment} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Add Payment</button>
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
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