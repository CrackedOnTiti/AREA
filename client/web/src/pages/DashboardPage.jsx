import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';
import { useWorkflows } from '../hooks/useWorkflows';


const DashboardPage = () =>
{
  const navigate = useNavigate();
  const { workflows, loading } = useWorkflows();

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.is_active).length;

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
              {loading ? '...' : totalWorkflows}
            </div>
          </div>

          <div className="bg-black border border-white rounded-xl p-8">
            <div className="text-gray-400 text-sm font-medium mb-2">
              Active Workflows
            </div>

            <div className="text-4xl font-bold text-white">
              {loading ? '...' : activeWorkflows}
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
