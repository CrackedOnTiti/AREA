import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

/**
 * Main App Component
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* Placeholder routes */}
          <Route 
            path="/register" 
            element={
              <div className="flex items-center justify-center h-screen text-2xl">
                Register Page (Coming Soon)
              </div>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <div className="flex items-center justify-center h-screen text-2xl">
                Dashboard (Protected, Coming Soon)
              </div>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Not Found */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center h-screen text-2xl text-red-500">
                404 - Page Not Found
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;