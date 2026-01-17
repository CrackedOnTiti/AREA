import React, { useState } from 'react';
import ConfigSection from './ConfigSection';


function WorkflowEditModal({ workflow, onClose, onSave, actionSchema, reactionSchema, isLoading }) {

  const [name, setName] = useState(workflow.name);
  const [isActive, setIsActive] = useState(workflow.is_active);
  const [actionConfig, setActionConfig] = useState(workflow.action_config || {});
  const [reactionConfig, setReactionConfig] = useState(workflow.reaction_config || {});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;

    setIsSaving(true);
    await onSave(workflow.id, {
      name: name.trim(),
      is_active: isActive,
      action_config: actionConfig,
      reaction_config: reactionConfig
    });
    setIsSaving(false);
  }

  function updateActionConfig(key, value) {
    setActionConfig(prev => ({ ...prev, [key]: value }));
  }

  function updateReactionConfig(key, value) {
    setReactionConfig(prev => ({ ...prev, [key]: value }));
  }

  return (
    <ModalOverlay onClose={onClose}>

      <ModalHeader title="Edit Workflow" onClose={onClose} />

      <div className="px-6 py-6 space-y-6">

        <NameInput value={name} onChange={setName} />

        <StatusToggle isActive={isActive} onChange={setIsActive} />

        <ConfigSection
          title={`Action: ${workflow.action?.display_name}`}
          serviceName={workflow.action?.service}
          color="bg-white"
          schema={actionSchema}
          config={actionConfig}
          onChange={updateActionConfig}
          isLoading={isLoading}
        />

        <ConfigSection
          title={`Reaction: ${workflow.reaction?.display_name}`}
          serviceName={workflow.reaction?.service}
          color="bg-white"
          schema={reactionSchema}
          config={reactionConfig}
          onChange={updateReactionConfig}
          isLoading={isLoading}
        />

      </div>

      <ModalFooter
        onCancel={onClose}
        onSave={handleSave}
        isSaving={isSaving}
        canSave={name.trim().length > 0}
      />

    </ModalOverlay>
  );
}


function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border border-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}


function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-300 text-2xl leading-none transition-colors"
      >
        &times;
      </button>
    </div>
  );
}


function ModalFooter({ onCancel, onSave, isSaving, canSave }) {
  return (
    <div className="px-6 py-4 border-t border-white flex gap-4">
      <button
        onClick={onCancel}
        className="flex-1 py-3 bg-black border border-white text-white font-semibold hover:bg-gray-900 transition-colors rounded-lg"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isSaving || !canSave}
        className="flex-1 py-3 bg-white text-black font-semibold hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors rounded-lg"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}


function NameInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-2">Workflow Name</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  );
}


function StatusToggle({ isActive, onChange }) {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-2">Status</label>
      <div className="flex gap-4">

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            checked={isActive}
            onChange={() => onChange(true)}
            className="accent-white"
          />
          <span className="text-white">Active</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            checked={!isActive}
            onChange={() => onChange(false)}
            className="accent-white"
          />
          <span className="text-white">Inactive</span>
        </label>

      </div>
    </div>
  );
}


export default WorkflowEditModal;
