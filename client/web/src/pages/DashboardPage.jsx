import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAreas: 0,
    activeAreas: 0,
    inactiveAreas: 0,
    connectedServices: 0
  });
  const [recentAreas, setRecentAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch areas
      const areasRes = await fetch('http://localhost:8080/api/areas?per_page=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const areasData = await areasRes.json();
      
      // Fetch connections
      const connectionsRes = await fetch('http://localhost:8080/api/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const connectionsData = await connectionsRes.json();
      
      const areas = areasData.areas || [];
      const activeCount = areas.filter(a => a.is_active).length;
      
      setStats({
        totalAreas: areasData.total || 0,
        activeAreas: activeCount,
        inactiveAreas: (areasData.total || 0) - activeCount,
        connectedServices: connectionsData.connections?.filter(c => c.is_connected).length || 0
      });
      
      setRecentAreas(areas);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AREA Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total AREAs"
            value={stats.totalAreas}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.activeAreas}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Inactive"
            value={stats.inactiveAreas}
            icon="⏸️"
            color="gray"
          />
          <StatCard
            title="Connected Services"
            value={stats.connectedServices}
            icon="🔗"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickAction
            title="Create New AREA"
            description="Set up a new automation workflow"
            icon="➕"
            onClick={() => navigate('/areas/new')}
            color="blue"
          />
          <QuickAction
            title="Manage Services"
            description="Connect or disconnect services"
            icon="⚙️"
            onClick={() => navigate('/services')}
            color="green"
          />
          <QuickAction
            title="View All AREAs"
            description="See and manage your workflows"
            icon="📋"
            onClick={() => navigate('/areas')}
            color="purple"
          />
        </div>

        {/* Recent AREAs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent AREAs</h2>
            <button
              onClick={() => navigate('/areas')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View All →
            </button>
          </div>
          
          {recentAreas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No AREAs created yet</p>
              <button
                onClick={() => navigate('/areas/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First AREA
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAreas.map(area => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`text-4xl ${colors[color]} rounded-full p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ title, description, icon, onClick, color }) => {
  const colors = {
    blue: 'border-blue-200 hover:bg-blue-50',
    green: 'border-green-200 hover:bg-green-50',
    purple: 'border-purple-200 hover:bg-purple-50'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-6 text-left border-2 ${colors[color]} transition-colors`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </button>
  );
};

const AreaCard = ({ area }) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{area.name}</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              area.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {area.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-blue-50 px-2 py-1 rounded">
              {area.action.service}
            </span>
            <span>→</span>
            <span className="bg-purple-50 px-2 py-1 rounded">
              {area.reaction.service}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;