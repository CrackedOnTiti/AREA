import React from 'react';
import WorkflowCard from './WorkflowCard';


function UserCard({
  user,
  isLast,
  isExpanded,
  onToggleExpand,
  onDeleteWorkflow,
  onToggleWorkflow,
  onViewWorkflow,
  onEditWorkflow
}) {

  const isAdmin = user.id === 1;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className={!isLast ? 'border-b border-gray-700' : ''}>

      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={onToggleExpand}
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
          <span className="text-sm text-gray-400">
            {user.workflow_count} workflow{user.workflow_count !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-400 text-sm">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">

          <p className="text-gray-400 text-sm mb-4">
            Member since: {formatDate(user.created_at)}
          </p>

          {user.workflows.length > 0 ? (
            <div>
              <p className="text-gray-400 text-sm mb-2">Workflows:</p>
              <div className="space-y-2">
                {user.workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onDelete={onDeleteWorkflow}
                    onToggle={onToggleWorkflow}
                    onView={onViewWorkflow}
                    onEdit={onEditWorkflow}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No workflows created</p>
          )}

        </div>
      )}

    </div>
  );
}


export default UserCard;
