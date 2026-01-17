import React from 'react';


function WorkflowViewModal({ workflow, onClose }) {

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border border-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-white">
          <h3 className="text-xl font-bold text-white">{workflow.name}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${workflow.is_active ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}>
              {workflow.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {workflow.description && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Description</p>
              <p className="text-white">{workflow.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-black rounded-lg p-4 border border-white">
              <p className="text-gray-400 text-sm mb-2">Action (Trigger)</p>
              <p className="text-white font-medium">{workflow.action?.display_name}</p>
              <p className="text-gray-400 text-sm">{workflow.action?.service}</p>
              {workflow.action_config && Object.keys(workflow.action_config).length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-400 text-xs mb-1">Configuration:</p>
                  <pre className="text-xs text-white bg-black border border-white p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify(workflow.action_config, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-black rounded-lg p-4 border border-white">
              <p className="text-gray-400 text-sm mb-2">Reaction (Action)</p>
              <p className="text-white font-medium">{workflow.reaction?.display_name}</p>
              <p className="text-gray-400 text-sm">{workflow.reaction?.service}</p>
              {workflow.reaction_config && Object.keys(workflow.reaction_config).length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-400 text-xs mb-1">Configuration:</p>
                  <pre className="text-xs text-white bg-black border border-white p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify(workflow.reaction_config, null, 2)}
                  </pre>
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Created</p>
              <p className="text-white">{formatDate(workflow.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-400">Last Updated</p>
              <p className="text-white">{formatDate(workflow.updated_at)}</p>
            </div>
            <div>
              <p className="text-gray-400">Last Triggered</p>
              <p className="text-white">{formatDate(workflow.last_triggered)}</p>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}


export default WorkflowViewModal;
