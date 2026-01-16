import React from 'react';
import { CARD_BASE, BUTTON_SECONDARY, BUTTON_DANGER, STATUS_BADGE } from '../../utils/styles';


const WorkflowCard = ({ workflow, onToggle, onDelete }) =>
{
  const isActive = workflow.is_active;
  const statusBadge = isActive ? STATUS_BADGE.green : STATUS_BADGE.gray;
  const statusText = isActive ? 'Active' : 'Inactive';
  const toggleText = isActive ? 'Deactivate' : 'Activate';

  return (
    <div className={CARD_BASE}>

      <div className="flex justify-between items-start mb-4">

        <WorkflowInfo workflow={workflow} />

        <StatusBadge badge={statusBadge} text={statusText} />

      </div>

      <WorkflowActions
        workflowId={workflow.id}
        toggleText={toggleText}
        onToggle={onToggle}
        onDelete={onDelete}
      />

    </div>
  );
};


const WorkflowInfo = ({ workflow }) =>
{
  return (
    <div className="flex-grow">
      <h3 className="text-2xl font-bold text-white mb-2">
        {workflow.name}
      </h3>

      {workflow.description && (
        <p className="text-gray-400 mb-4">
          {workflow.description}
        </p>
      )}

      <div className="text-gray-300">
        <span className="font-medium">When</span>{' '}
        <span className="text-white">{workflow.action?.name || 'Unknown'}</span>{' '}
        <span className="font-medium">then</span>{' '}
        <span className="text-white">{workflow.reaction?.name || 'Unknown'}</span>
      </div>
    </div>
  );
};


const StatusBadge = ({ badge, text }) =>
{
  return (
    <div className="flex items-center gap-3 ml-6">
      <div className="flex items-center gap-2">
        <div className={badge.dot} />
        <span className={badge.text}>
          {text}
        </span>
      </div>
    </div>
  );
};


const WorkflowActions = ({ workflowId, toggleText, onToggle, onDelete }) =>
{
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onToggle(workflowId)}
        className={BUTTON_SECONDARY}
      >
        {toggleText}
      </button>

      <button
        onClick={() => onDelete(workflowId)}
        className={BUTTON_DANGER}
      >
        Delete
      </button>
    </div>
  );
};


export default WorkflowCard;
