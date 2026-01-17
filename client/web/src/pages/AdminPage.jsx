import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { getAllUsers } from '../services/adminService';
import { deleteArea } from '../services/areasService';


const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return;
    }
    try {
      await deleteArea(workflowId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalUsers = users.length;
  const totalWorkflows = users.reduce((sum, user) => sum + user.workflow_count, 0);
  const activeWorkflows = users.reduce((sum, user) => {
    return sum + user.workflows.filter(w => w.is_active).length;
  }, 0);

  if (error) {
    return (
      <Layout>
        <ErrorDisplay message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">

        <HeaderSection />

        <StatsRow
          totalUsers={totalUsers}
          totalWorkflows={totalWorkflows}
          activeWorkflows={activeWorkflows}
          loading={loading}
        />

        <UsersSection
          users={users}
          loading={loading}
          expandedUserId={expandedUserId}
          onToggleExpand={toggleExpand}
          onDeleteWorkflow={handleDeleteWorkflow}
        />

      </div>
    </Layout>
  );
};


const HeaderSection = () => {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-white">
        Admin Dashboard
      </h1>
      <p className="text-gray-400 mt-2">
        Manage users and monitor system activity
      </p>
    </div>
  );
};


const StatsRow = ({ totalUsers, totalWorkflows, activeWorkflows, loading }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      <StatCard label="Total Users" value={loading ? '-' : totalUsers} />
      <StatCard label="Total Workflows" value={loading ? '-' : totalWorkflows} />
      <StatCard label="Active Workflows" value={loading ? '-' : activeWorkflows} />
    </div>
  );
};


const StatCard = ({ label, value }) => {
  return (
    <div className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
};


const UsersSection = ({ users, loading, expandedUserId, onToggleExpand, onDeleteWorkflow }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">
        Users
      </h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          {users.map((user, index) => (
            <UserRow
              key={user.id}
              user={user}
              isLast={index === users.length - 1}
              isExpanded={expandedUserId === user.id}
              onToggle={() => onToggleExpand(user.id)}
              onDeleteWorkflow={onDeleteWorkflow}
            />
          ))}
        </div>
      )}
    </section>
  );
};


const EmptyState = () => {
  return (
    <div className="border border-gray-700 rounded-lg px-6 py-8 text-center">
      <p className="text-gray-400 mb-2">No users found</p>
    </div>
  );
};


const UserRow = ({ user, isLast, isExpanded, onToggle, onDeleteWorkflow }) => {
  const isAdmin = user.id === 1;

  return (
    <div className={!isLast ? 'border-b border-gray-700' : ''}>

      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-yellow-500' : 'bg-blue-500'}`} />
          <div>
            <span className="text-white font-medium">{user.username}</span>
            {isAdmin && (
              <span className="ml-2 text-xs text-yellow-500 font-semibold">ADMIN</span>
            )}
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <WorkflowBadge count={user.workflow_count} />
          <ExpandIcon isExpanded={isExpanded} />
        </div>
      </div>

      {isExpanded && (
        <UserDetails user={user} onDeleteWorkflow={onDeleteWorkflow} />
      )}

    </div>
  );
};


const WorkflowBadge = ({ count }) => {
  return (
    <span className="text-sm text-gray-400">
      {count} workflow{count !== 1 ? 's' : ''}
    </span>
  );
};


const ExpandIcon = ({ isExpanded }) => {
  return (
    <span className="text-gray-400 text-sm">
      {isExpanded ? '▲' : '▼'}
    </span>
  );
};


const UserDetails = ({ user, onDeleteWorkflow }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">

      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Member since: {formatDate(user.created_at)}
        </p>
      </div>

      {user.workflows.length > 0 ? (
        <WorkflowList workflows={user.workflows} onDeleteWorkflow={onDeleteWorkflow} />
      ) : (
        <p className="text-gray-500 text-sm">No workflows created</p>
      )}

    </div>
  );
};


const WorkflowList = ({ workflows, onDeleteWorkflow }) => {
  return (
    <div>
      <p className="text-gray-400 text-sm mb-2">Workflows:</p>
      <div className="space-y-2">
        {workflows.map((workflow) => (
          <WorkflowItem key={workflow.id} workflow={workflow} onDelete={onDeleteWorkflow} />
        ))}
      </div>
    </div>
  );
};


const WorkflowItem = ({ workflow, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(workflow.id);
  };

  return (
    <div className="flex items-center justify-between bg-black px-4 py-2 rounded border border-gray-700">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-white text-sm">{workflow.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs">
          {formatDate(workflow.created_at)}
        </span>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-400 text-sm transition-colors"
          aria-label="Delete workflow"
        >
          Delete
        </button>
      </div>
    </div>
  );
};


const ErrorDisplay = ({ message }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg px-6 py-4">
        <p className="text-red-400">{message}</p>
      </div>
    </div>
  );
};


export default AdminPage;
