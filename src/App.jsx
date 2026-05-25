import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import EndUserDashboard from './pages/EndUserDashboard';
import AdminOTPActivity from './pages/admin/OTPActivity';
import AdminBilling from './pages/admin/Billing';
import AdminUserDashboardView from './pages/admin/AdminUserDashboardView';

// Authentication helpers using UI flags (not actual tokens)
const isAuthenticated = () => localStorage.getItem('loggedIn') === 'true';
const isAdmin = () => localStorage.getItem('userRole') === 'admin';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/user/login" replace />;
  }
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/user/login" replace />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/login" element={<Login />} />

      {/* End User Dashboard – checks its own authentication */}
      <Route path="/enduser/dashboard" element={<EndUserDashboard />} />

      {/* Client Admin Dashboard (protected) */}
      <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

      {/* Super Admin Routes (protected, admin only) */}
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/otp-activity" element={<ProtectedRoute adminOnly><AdminOTPActivity /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute adminOnly><AdminBilling /></ProtectedRoute>} />
      <Route path="/admin/user-dashboard/:userId" element={<ProtectedRoute adminOnly><AdminUserDashboardView /></ProtectedRoute>} />

      {/* Redirect old admin login */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;