import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { getAllUsers } from '../services/adminService';
import { deleteArea, toggleArea, updateArea } from '../services/areasService';
import { useServices } from '../hooks/useServices';

import AdminHeader from '../components/admin/AdminHeader';
import AdminStats from '../components/admin/AdminStats';
import UserSearchBar from '../components/admin/UserSearchBar';
import UserList from '../components/admin/UserList';
import WorkflowViewModal from '../components/admin/WorkflowViewModal';
import WorkflowEditModal from '../components/admin/WorkflowEditModal';


function AdminPage() {

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

  const { services, loading: servicesLoading } = useServices();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleUserExpand(userId) {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  }

  async function handleDeleteWorkflow(workflowId) {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return;
    }
    try {
      await deleteArea(workflowId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleWorkflow(workflowId) {
    try {
      await toggleArea(workflowId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateWorkflow(workflowId, data) {
    try {
      await updateArea(workflowId, data);
      await fetchUsers();
      setEditingWorkflow(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function findActionSchema(actionId) {
    for (const service of services) {
      const action = service.actions?.find(a => a.id === actionId);
      if (action) return action.config_schema;
    }
    return null;
  }

  function findReactionSchema(reactionId) {
    for (const service of services) {
      const reaction = service.reactions?.find(r => r.id === reactionId);
      if (reaction) return reaction.config_schema;
    }
    return null;
  }

  const filteredUsers = users.filter(user => {
    const query = searchText.toLowerCase();
    const matchesUsername = user.username.toLowerCase().includes(query);
    const matchesEmail = user.email.toLowerCase().includes(query);
    return matchesUsername || matchesEmail;
  });

  const totalUsers = users.length;
  const totalWorkflows = users.reduce((sum, user) => sum + user.workflow_count, 0);
  const activeWorkflows = users.reduce((sum, user) => {
    return sum + user.workflows.filter(w => w.is_active).length;
  }, 0);

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg px-6 py-4 flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">

        <AdminHeader />

        <AdminStats
          totalUsers={totalUsers}
          totalWorkflows={totalWorkflows}
          activeWorkflows={activeWorkflows}
          isLoading={isLoading}
        />

        <UserSearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
        />

        <UserList
          users={filteredUsers}
          isLoading={isLoading}
          expandedUserId={expandedUserId}
          onToggleExpand={toggleUserExpand}
          onDeleteWorkflow={handleDeleteWorkflow}
          onToggleWorkflow={handleToggleWorkflow}
          onViewWorkflow={setSelectedWorkflow}
          onEditWorkflow={setEditingWorkflow}
        />

        {selectedWorkflow && (
          <WorkflowViewModal
            workflow={selectedWorkflow}
            onClose={() => setSelectedWorkflow(null)}
          />
        )}

        {editingWorkflow && (
          <WorkflowEditModal
            workflow={editingWorkflow}
            onClose={() => setEditingWorkflow(null)}
            onSave={handleUpdateWorkflow}
            actionSchema={findActionSchema(editingWorkflow.action?.id)}
            reactionSchema={findReactionSchema(editingWorkflow.reaction?.id)}
            isLoading={servicesLoading}
          />
        )}

      </div>
    </Layout>
  );
}


export default AdminPage;
