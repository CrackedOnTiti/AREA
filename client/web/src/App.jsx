import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
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

          {/* Placeholder protected routes */}
          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  Services Page (Coming Soon)
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  My AREAs Page (Coming Soon)
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/areas/new" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  Create AREA Page (Coming Soon)
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center h-screen text-2xl">
                  Profile Page (Coming Soon)
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
              <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
                <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
                <a 
                  href="/dashboard" 
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Go to Dashboard
                </a>
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;