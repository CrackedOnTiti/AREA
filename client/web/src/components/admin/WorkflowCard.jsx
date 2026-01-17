import React from 'react';


function WorkflowCard({ workflow, onDelete, onToggle, onView, onEdit }) {

  function handleDelete(event) {
    event.stopPropagation();
    onDelete(workflow.id);
  }

  function handleToggle(event) {
    event.stopPropagation();
    onToggle(workflow.id);
  }

  function handleView(event) {
    event.stopPropagation();
    onView(workflow);
  }

  function handleEdit(event) {
    event.stopPropagation();
    onEdit(workflow);
  }

  return (
    <div className="flex items-center justify-between bg-black px-4 py-3 rounded border border-gray-700">

      <div
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={handleView}
      >
        <div className={`w-2 h-2 rounded-full ${workflow.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />

        <div>
          <span className="text-white text-sm">{workflow.name}</span>
          <p className="text-gray-500 text-xs">
            {workflow.action?.service} → {workflow.reaction?.service}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">

        <ActionButton
          onClick={handleToggle}
          color={workflow.is_active ? 'yellow' : 'green'}
        >
          {workflow.is_active ? 'Disable' : 'Enable'}
        </ActionButton>

        <ActionButton onClick={handleEdit} color="blue">
          Edit
        </ActionButton>

        <ActionButton onClick={handleDelete} color="red">
          Delete
        </ActionButton>

      </div>
    </div>
  );
}


function ActionButton({ onClick, color, children }) {

  const colorStyles = {
    red: 'text-red-500 hover:text-red-400 hover:bg-red-500/10',
    green: 'text-green-500 hover:text-green-400 hover:bg-green-500/10',
    blue: 'text-blue-500 hover:text-blue-400 hover:bg-blue-500/10',
    yellow: 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10',
  };

  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded transition-colors ${colorStyles[color]}`}
    >
      {children}
    </button>
  );
}


export default WorkflowCard;
