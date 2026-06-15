import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EndUserDashboard = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [identifier, setIdentifier] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const user = localStorage.getItem('user');

    console.log('Dashboard Check:', { loggedIn, userRole, user });

    if (!loggedIn || userRole !== 'end_user' || !user) {
      navigate('/user/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    const name = parsedUser.name || sessionStorage.getItem('customerName') || 'Customer';
    const id = parsedUser.email || parsedUser.phone || sessionStorage.getItem('identifier') || '—';

    setCustomerName(name);
    setIdentifier(id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/user/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-900">OTPless Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm">
            Sign out
          </button>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Hello, {customerName} 👋</h1>
          <p className="text-gray-500 mt-2">Welcome to OTPless – your secure verification platform.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">
            <span>📞</span> {identifier}
          </div>
          <div className="mt-4 text-sm text-gray-400">You are verified via one‑time password.</div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Your account is active. You can now use OTPless to verify your identity whenever needed.</p>
          <p className="mt-2">Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default EndUserDashboard;