import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOTPActivity from './pages/admin/OTPActivity';
import AdminBilling from './pages/admin/Billing';

const isAuthenticated = () => !!localStorage.getItem('token');

const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.type === 'admin';
  } catch {
    return false;
  }
};

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
      {/* Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/verify" element={<VerifyOTP />} />
      
      {/* User Dashboard */}
      <Route path="/user/dashboard" element={<UserDashboard />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/otp-activity" element={<ProtectedRoute adminOnly><AdminOTPActivity /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute adminOnly><AdminBilling /></ProtectedRoute>} />
      
      {/* Default */}
      <Route path="/" element={<Navigate to="/user/login" replace />} />
      <Route path="*" element={<Navigate to="/user/login" replace />} />
    </Routes>
  );
}

export default App;