import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Page Component
 * Main landing page after successful login
 */
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAreas: 0,
    activeAreas: 0,
    inactiveAreas: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, showing placeholder data
    setStats({
      totalAreas: 0,
      activeAreas: 0,
      inactiveAreas: 0,
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">AREA</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, <strong>{user?.username}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.username}! 👋
          </h2>
          <p className="text-primary-100">
            Ready to automate your digital life? Create workflows that connect your favorite services.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total AREAs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total AREAs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalAreas}
                </p>
              </div>
              <div className="bg-primary-100 rounded-full p-3">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 
  );
};

export default DashboardPage;
