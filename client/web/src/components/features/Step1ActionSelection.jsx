import React from 'react';
import {
  ServiceDropdown,
  NoServicesMessage,
  ItemDropdown,
  ConfigurationSection
} from './WorkflowFormComponents';


const Step1ActionSelection = ({
  availableServices,
  unavailableServices = [],
  selectedService,
  onServiceChange,
  selectedAction,
  onActionChange,
  actionConfig,
  onConfigChange,
  actions,
  onNext,
  canProceed
}) =>
{
  const isUnavailableService = unavailableServices.some(s => s.name === selectedService);

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Step 1: Select Action
      </h3>

      {availableServices.length === 0 && unavailableServices.length === 0 && (
        <NoServicesMessage type="actions" />
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
          label="Action"
          value={selectedAction?.id || ''}
          onChange={onActionChange}
          items={actions}
          selectedItem={selectedAction}
          placeholder="Select an action"
        />
      )}

      {selectedAction && selectedAction.config_schema && !isUnavailableService && (
        <ConfigurationSection
          title="Action Configuration"
          schema={selectedAction.config_schema}
          config={actionConfig}
          onChange={onConfigChange}
        />
      )}

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};


export default Step1ActionSelection;
