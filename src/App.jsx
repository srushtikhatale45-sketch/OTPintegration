import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import EndUserDashboard from './pages/EndUserDashboard';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOTPActivity from './pages/admin/OTPActivity';
import AdminBilling from './pages/admin/Billing';
import AdminUserDashboardView from './pages/admin/AdminUserDashboardView';
import AdminCustomers from './pages/admin/Customer';
const isAuthenticated = () =>
  localStorage.getItem('loggedIn') === 'true';

const getUserRole = () =>
  localStorage.getItem('userRole');

const ProtectedRoute = ({
  children,
  allowedRole
}) => {

  if (!isAuthenticated()) {
    return <Navigate to="/user/login" replace />;
  }

  const role = getUserRole();

  if (allowedRole && role !== allowedRole) {

    // Redirect based on role
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    }

    if (role === 'end_user') {
      return <Navigate to="/enduser/dashboard" replace />;
    }

    return <Navigate to="/user/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/user/login" replace />}
      />

      {/* Public Routes */}
      <Route
        path="/user/login"
        element={<UserLogin />}
      />

      <Route
        path="/verify"
        element={<VerifyOTP />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* End User Dashboard */}
      <Route
        path="/enduser/dashboard"
        element={
          <ProtectedRoute allowedRole="end_user">
            <EndUserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Business User Dashboard */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/otp-activity"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminOTPActivity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminBilling />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/user-dashboard/:userId"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminUserDashboardView />
          </ProtectedRoute>
        }
      />

      {/* Admin Login Redirect */}
      <Route
        path="/admin/login"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;