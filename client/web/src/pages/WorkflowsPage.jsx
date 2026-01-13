import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';
import WorkflowCard from '../components/features/WorkflowCard';
import { useWorkflows } from '../hooks/useWorkflows';
import { deleteArea, toggleArea } from '../services/areasService';
import { BUTTON_PRIMARY } from '../utils/styles';


const WorkflowsPage = () =>
{
  const navigate = useNavigate();
  const { workflows, loading, error: fetchError, refetch } = useWorkflows();
  const [error, setError] = useState(null);

  const handleToggle = async (workflowId) =>
  {
    try
    {
      await toggleArea(workflowId);
      await refetch();
    }
    catch (err)
    {
      setError(err.message);
    }
  };

  const handleDelete = async (workflowId) =>
  {
    if (!window.confirm('Are you sure you want to delete this workflow?'))
    {
      return;
    }

    try
    {
      await deleteArea(workflowId);
      await refetch();
    }
    catch (err)
    {
      setError(err.message);
    }
  };

  const displayError = error || fetchError;

  return (
    <Layout>

      <div className="max-w-7xl mx-auto px-4 py-12">

        <PageHeader
          title="My Workflows"
          subtitle="Manage your automated workflows"
          action={
            <button
              onClick={() => navigate('/workflows/create')}
              className={BUTTON_PRIMARY}
            >
              Create Workflow
            </button>
          }
        />

        {loading && (
          <div className="text-center text-white text-xl">
            Loading workflows...
          </div>
        )}

        {displayError && (
          <div className="bg-black border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        {!loading && !displayError && workflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl mb-6">
              No workflows yet
            </p>

            <button
              onClick={() => navigate('/workflows/create')}
              className={BUTTON_PRIMARY}
            >
              Create your first workflow
            </button>
          </div>
        )}

        {!loading && !displayError && workflows.length > 0 && (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>

    </Layout>
  );
};


export default WorkflowsPage;
