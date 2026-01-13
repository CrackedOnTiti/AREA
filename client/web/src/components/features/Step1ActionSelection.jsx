import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigForm from './ConfigForm';


const Step1ActionSelection = ({
  availableServices,
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
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Step 1: Select Action
      </h3>

      {availableServices.length === 0 && (
        <NoServicesMessage onClick={() => navigate('/services')} />
      )}

      <ServiceDropdown
        value={selectedService}
        onChange={onServiceChange}
        services={availableServices}
        disabled={availableServices.length === 0}
      />

      {selectedService && (
        <ActionDropdown
          value={selectedAction?.id || ''}
          onChange={onActionChange}
          actions={actions}
          selectedAction={selectedAction}
        />
      )}

      {selectedAction && selectedAction.config_schema && (
        <ActionConfiguration
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


const NoServicesMessage = ({ onClick }) =>
{
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <p className="text-gray-300 mb-4">
        No services available with actions. Please connect a service first.
      </p>

      <button
        onClick={onClick}
        className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg"
      >
        Go to Services
      </button>
    </div>
  );
};


const ServiceDropdown = ({ value, onChange, services, disabled }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        Service
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="">Select a service</option>
        {services.map((service) => (
          <option key={service.id} value={service.name}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
  );
};


const ActionDropdown = ({ value, onChange, actions, selectedAction }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        Action
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="">Select an action</option>
        {actions.map((action) => (
          <option key={action.id} value={action.id}>
            {action.name}
          </option>
        ))}
      </select>

      {selectedAction?.description && (
        <p className="mt-2 text-gray-400 text-sm">
          {selectedAction.description}
        </p>
      )}
    </div>
  );
};


const ActionConfiguration = ({ schema, config, onChange }) =>
{
  return (
    <div className="mb-6">
      <h4 className="text-white text-lg font-semibold mb-4">
        Action Configuration
      </h4>

      <ConfigForm
        schema={schema}
        config={config}
        onChange={onChange}
      />
    </div>
  );
};


export default Step1ActionSelection;
