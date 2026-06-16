import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaMobileAlt, FaDollarSign, FaUserFriends, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/otp-activity', icon: FaMobileAlt, label: 'OTP Activity' },
    { path: '/admin/billing', icon: FaDollarSign, label: 'Billing' },
    { path: '/admin/customers', icon: FaUserFriends, label: 'Customers' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg z-10">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">OTP Platform</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-5 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-gray-800 border-r-4 border-blue-500' : ''
                }`
              }
            >
              <IconComponent className="mr-3 text-xl" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-5 py-3 hover:bg-gray-800 transition-colors text-left text-red-400 mt-4"
        >
          <FaSignOutAlt className="mr-3 text-xl" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;