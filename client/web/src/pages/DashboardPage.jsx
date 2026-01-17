import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useWorkflows } from '../hooks/useWorkflows';
import { useServices } from '../hooks/useServices';
import { toggleArea } from '../services/areasService';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../utils/styles';


const DashboardPage = () =>
{
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workflows, loading: workflowsLoading, refetch } = useWorkflows();
  const { connections, loading: servicesLoading } = useServices();

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.is_active).length;

  const gmailConnected = connections.find(c => c.service_name?.toLowerCase() === 'gmail')?.is_connected;
  const driveConnected = connections.find(c => c.service_name?.toLowerCase() === 'drive')?.is_connected;
  const googleConnected = gmailConnected && driveConnected;

  const otherConnectedServices = connections.filter(c => {
    const name = c.service_name?.toLowerCase();
    if (name === 'gmail' || name === 'drive') return false;
    return c.is_connected;
  }).length;

  const connectedServices = otherConnectedServices + (googleConnected ? 1 : 0);

  const recentWorkflows = workflows.slice(0, 3);

  const loading = workflowsLoading || servicesLoading;

  return (
    <Layout>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <WelcomeSection userName={user?.username || user?.email} />

        <StatsRow
          total={totalWorkflows}
          active={activeWorkflows}
          connected={connectedServices}
          loading={loading}
        />

        <RecentWorkflowsSection
          workflows={recentWorkflows}
          loading={workflowsLoading}
          onViewAll={() => navigate('/workflows')}
          refetch={refetch}
        />

        <QuickActionsSection navigate={navigate} />

      </div>

    </Layout>
  );
};


const WelcomeSection = ({ userName }) =>
{
  const displayName = userName ? userName.split('@')[0] : 'there';

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-white">
        Welcome back, {displayName}
      </h1>
      <p className="text-gray-400 mt-2">
        Here's what's happening with your automations
      </p>
    </div>
  );
};


const StatsRow = ({ total, active, connected, loading }) =>
{
  return (
    <div className="grid grid-cols-3 gap-4 mb-10">

      <StatCard label="Total Workflows" value={loading ? '-' : total} />
      <StatCard label="Active" value={loading ? '-' : active} />
      <StatCard label="Connected Services" value={loading ? '-' : connected} />

    </div>
  );
};


const StatCard = ({ label, value }) =>
{
  return (
    <div className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
};


const RecentWorkflowsSection = ({ workflows, loading, onViewAll, refetch }) =>
{
  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (workflowId) =>
  {
    setTogglingId(workflowId);
    try
    {
      await toggleArea(workflowId);
      await refetch();
    }
    catch (err)
    {
      console.error('Failed to toggle workflow:', err);
    }
    finally
    {
      setTogglingId(null);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-4">
        Recent Workflows
      </h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : workflows.length === 0 ? (
        <div className="border border-gray-700 rounded-lg px-6 py-8 text-center">
          <p className="text-gray-400 mb-2">No workflows yet</p>
          <p className="text-gray-500 text-sm">Create your first workflow to get started</p>
        </div>
      ) : (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          {workflows.map((workflow, index) => (
            <WorkflowRow
              key={workflow.id}
              workflow={workflow}
              isLast={index === workflows.length - 1}
              isToggling={togglingId === workflow.id}
              onToggle={handleToggle}
            />
          ))}

          <button
            onClick={onViewAll}
            className="w-full px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors text-sm"
          >
            View all workflows
          </button>
        </div>
      )}
    </section>
  );
};


const WorkflowRow = ({ workflow, isLast, isToggling, onToggle }) =>
{
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${!isLast ? 'border-b border-gray-700' : ''}`}>

      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-white font-medium">{workflow.name}</span>
      </div>

      <button
        onClick={() => onToggle(workflow.id)}
        disabled={isToggling}
        className={`text-sm px-3 py-1 rounded border transition-colors ${
          workflow.is_active
            ? 'border-green-600 text-green-400 hover:bg-green-900 hover:bg-opacity-20'
            : 'border-gray-600 text-gray-400 hover:bg-gray-800'
        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isToggling ? '...' : workflow.is_active ? 'Active' : 'Inactive'}
      </button>

    </div>
  );
};


const QuickActionsSection = ({ navigate }) =>
{
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">
        Quick Actions
      </h2>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/workflows/create')}
          className={`${BUTTON_PRIMARY} flex-1`}
        >
          + Create Workflow
        </button>

        <button
          onClick={() => navigate('/services')}
          className={`${BUTTON_SECONDARY} flex-1`}
        >
          Manage Services
        </button>
      </div>
    </section>
  );
};


export default DashboardPage;
