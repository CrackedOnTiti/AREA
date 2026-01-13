import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigForm from './ConfigForm';


const Step2ReactionSelection = ({
  availableServices,
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
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Step 2: Select Reaction
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
        <ReactionDropdown
          value={selectedReaction?.id || ''}
          onChange={onReactionChange}
          reactions={reactions}
          selectedReaction={selectedReaction}
        />
      )}

      {selectedReaction && selectedReaction.config_schema && (
        <ReactionConfiguration
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


const NoServicesMessage = ({ onClick }) =>
{
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <p className="text-gray-300 mb-4">
        No services available with reactions. Please connect a service first.
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


const ReactionDropdown = ({ value, onChange, reactions, selectedReaction }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        Reaction
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="">Select a reaction</option>
        {reactions.map((reaction) => (
          <option key={reaction.id} value={reaction.id}>
            {reaction.name}
          </option>
        ))}
      </select>

      {selectedReaction?.description && (
        <p className="mt-2 text-gray-400 text-sm">
          {selectedReaction.description}
        </p>
      )}
    </div>
  );
};


const ReactionConfiguration = ({ schema, config, onChange }) =>
{
  return (
    <div className="mb-6">
      <h4 className="text-white text-lg font-semibold mb-4">
        Reaction Configuration
      </h4>

      <ConfigForm
        schema={schema}
        config={config}
        onChange={onChange}
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
