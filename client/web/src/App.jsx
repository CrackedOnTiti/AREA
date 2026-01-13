// client/web/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import MyAreasPage from './pages/MyAreasPage';
import CreateAreaPage from './pages/CreateAreaPage';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

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
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas" 
            element={
              <ProtectedRoute>
                <MyAreasPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas/new" 
            element={
              <ProtectedRoute>
                <CreateAreaPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas/:id" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  AREA Details (Coming Soon)
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  Profile (Coming Soon)
                </div>
              </ProtectedRoute>
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