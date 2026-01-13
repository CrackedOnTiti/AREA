import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


const DashboardPage = () =>
{
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    loading: true
  });

  useEffect(() =>
  {
    fetchStats();
  }, []);

  const fetchStats = async () =>
  {
    try
    {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok)
      {
        const data = await response.json();
        const active = data.areas.filter(area => area.is_active).length;

        setStats({
          totalWorkflows: data.total || 0,
          activeWorkflows: active,
          loading: false
        });
      }
    }
    catch (error)
    {
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Layout>

      <div className="max-w-7xl mx-auto px-4 py-12">

        <PageHeader
          title="Dashboard"
          subtitle="Manage your automated workflows"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          <div className="bg-black border border-white rounded-xl p-8">
            <div className="text-gray-400 text-sm font-medium mb-2">
              Total Workflows
            </div>

            <div className="text-4xl font-bold text-white">
              {stats.loading ? '...' : stats.totalWorkflows}
            </div>
          </div>

          <div className="bg-black border border-white rounded-xl p-8">
            <div className="text-gray-400 text-sm font-medium mb-2">
              Active Workflows
            </div>

            <div className="text-4xl font-bold text-white">
              {stats.loading ? '...' : stats.activeWorkflows}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <button
            onClick={() => navigate('/workflows/create')}
            className="bg-white text-black rounded-xl p-8 hover:bg-gray-200 transition-colors text-left group"
          >
            <div className="text-2xl font-bold mb-2">
              Create Workflow
            </div>

            <div className="text-gray-600">
              Connect actions and reactions
            </div>

            <div className="mt-4 text-2xl group-hover:translate-x-2 transition-transform inline-block">
              →
            </div>
          </button>

          <button
            onClick={() => navigate('/workflows')}
            className="bg-black border border-white text-white rounded-xl p-8 hover:border-gray-400 transition-colors text-left group"
          >
            <div className="text-2xl font-bold mb-2">
              My Workflows
            </div>

            <div className="text-gray-400">
              View and manage
            </div>

            <div className="mt-4 text-2xl group-hover:translate-x-2 transition-transform inline-block">
              →
            </div>
          </button>

          <button
            onClick={() => navigate('/services')}
            className="bg-black border border-white text-white rounded-xl p-8 hover:border-gray-400 transition-colors text-left group"
          >
            <div className="text-2xl font-bold mb-2">
              Services
            </div>

            <div className="text-gray-400">
              Connect services
            </div>

            <div className="mt-4 text-2xl group-hover:translate-x-2 transition-transform inline-block">
              →
            </div>
          </button>

        </div>

      </div>

    </Layout>
  );
};


export default DashboardPage;
