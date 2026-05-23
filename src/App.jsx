import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOTPActivity from './pages/admin/OTPActivity';
import AdminBilling from './pages/admin/Billing';
import AdminUserDashboardView from './pages/admin/AdminUserDashboardView';
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/otp-activity" element={<AdminOTPActivity />} />
      <Route path="/admin/billing" element={<AdminBilling />} />
      <Route path="/admin/user-dashboard/:userId" element={<AdminUserDashboardView />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;