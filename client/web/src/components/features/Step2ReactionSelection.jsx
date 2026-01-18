import React from 'react';
import {
  ServiceDropdown,
  NoServicesMessage,
  ItemDropdown,
  ConfigurationSection
} from './WorkflowFormComponents';


const Step2ReactionSelection = ({
  availableServices,
  unavailableServices = [],
  selectedService,
  onServiceChange,
  selectedReaction,
  onReactionChange,
  reactionConfig,
  onConfigChange,
  reactions,
  onNext,
  onBack,
  canProceed
}) =>
{
  const isUnavailableService = unavailableServices.some(s => s.name === selectedService);

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Step 2: Select Reaction
      </h3>

      {availableServices.length === 0 && unavailableServices.length === 0 && (
        <NoServicesMessage type="reactions" />
      )}

      <ServiceDropdown
        value={selectedService}
        onChange={onServiceChange}
        services={availableServices}
        unavailableServices={unavailableServices}
        disabled={availableServices.length === 0 && unavailableServices.length === 0}
      />

      {selectedService && !isUnavailableService && (
        <ItemDropdown
          label="Reaction"
          value={selectedReaction?.id || ''}
          onChange={onReactionChange}
          items={reactions}
          selectedItem={selectedReaction}
          placeholder="Select a reaction"
        />
      )}

      {selectedReaction && selectedReaction.config_schema && !isUnavailableService && (
        <ConfigurationSection
          title="Reaction Configuration"
          schema={selectedReaction.config_schema}
          config={reactionConfig}
          onChange={onConfigChange}
        />
      )}

      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        canProceed={canProceed}
      />
    </div>
  );
};


const NavigationButtons = ({ onBack, onNext, canProceed }) =>
{
  return (
    <div className="flex gap-4">
      <button
        onClick={onBack}
        className="flex-1 py-3 bg-black border border-white text-white hover:bg-gray-900 transition-colors rounded-lg font-medium"
      >
        Back
      </button>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="flex-1 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};


export default Step2ReactionSelection;
