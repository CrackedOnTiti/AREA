import React from 'react';


const Step3NameAndSubmit = ({
  selectedAction,
  selectedReaction,
  workflowName,
  onNameChange,
  workflowDescription,
  onDescriptionChange,
  onSubmit,
  onBack,
  submitting
}) =>
{
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Step 3: Name & Submit
      </h3>

      <WorkflowSummary
        actionName={selectedAction?.name}
        reactionName={selectedReaction?.name}
      />

      <NameInput
        value={workflowName}
        onChange={onNameChange}
      />

      <DescriptionInput
        value={workflowDescription}
        onChange={onDescriptionChange}
      />

      <SubmitButtons
        onBack={onBack}
        onSubmit={onSubmit}
        submitting={submitting}
        canSubmit={workflowName.trim().length > 0}
      />
    </div>
  );
};


const WorkflowSummary = ({ actionName, reactionName }) =>
{
  return (
    <div className="mb-6 bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h4 className="text-white text-lg font-semibold mb-3">
        Workflow Summary
      </h4>

      <div className="text-gray-300">
        <span className="font-medium">When</span>{' '}
        <span className="text-white">{actionName}</span>{' '}
        <span className="font-medium">then</span>{' '}
        <span className="text-white">{reactionName}</span>
      </div>
    </div>
  );
};


const NameInput = ({ value, onChange }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        Workflow Name <span className="text-red-400">*</span>
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter workflow name"
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  );
};


const DescriptionInput = ({ value, onChange }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        Description (optional)
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter workflow description"
        rows="3"
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  );
};


const SubmitButtons = ({ onBack, onSubmit, submitting, canSubmit }) =>
{
  return (
    <div className="flex gap-4">
      <button
        onClick={onBack}
        disabled={submitting}
        className="flex-1 py-3 bg-black border border-white text-white hover:bg-gray-900 transition-colors rounded-lg font-medium disabled:opacity-50"
      >
        Back
      </button>

      <button
        onClick={onSubmit}
        disabled={submitting || !canSubmit}
        className="flex-1 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating...' : 'Create Workflow'}
      </button>
    </div>
  );
};


export default Step3NameAndSubmit;
