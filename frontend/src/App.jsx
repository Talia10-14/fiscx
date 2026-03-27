import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

console.log('✓ App.jsx loaded, useAuthStore:', useAuthStore);

// Pages
import HomePage from './pages/HomePage';
import LoginPagev2 from './pages/LoginPagev2';
import LoginPage from './pages/LoginPage';
import MerchantDashboard from './pages/MerchantDashboard';
import BankerDashboard from './pages/BankerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DGIDashboard from './pages/DGIDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const { token, user, initialize } = useAuthStore();
  
  // Initialize auth state from localStorage on app start
  useEffect(() => {
    console.log('✓ App mounting - initializing auth store');
    initialize();
  }, [initialize]);
  
  console.log('✓ App rendering, token:', !!token, 'user:', user?.role || 'none');

  // Redirect authenticated users
  const getAuthRedirect = (isAuthenticated) => {
    if (!isAuthenticated) return null;
    
    const roleRedirectMap = {
      MERCHANT: '/dashboard',
      BANKER: '/banker/dashboard',
      ADMIN: '/admin/dashboard',
      DGI: '/dgi/dashboard',
    };
    
    return roleRedirectMap[user?.role] || '/dashboard';
  };

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={token ? <Navigate to={getAuthRedirect(true)} /> : <HomePage />} />
        <Route path="/login" element={!token ? <LoginPagev2 /> : <Navigate to={getAuthRedirect(true)} />} />
        <Route path="/signup" element={!token ? <LoginPage /> : <Navigate to={getAuthRedirect(true)} />} />

        {/* Protected - Merchant */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MERCHANT']}>
              <MerchantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected - Banker */}
        <Route
          path="/banker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['BANKER']}>
              <BankerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected - DGI */}
        <Route
          path="/dgi/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DGI']}>
              <DGIDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
