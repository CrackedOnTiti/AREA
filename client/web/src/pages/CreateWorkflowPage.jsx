import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/ui/PageHeader';
import StepIndicator from '../components/features/StepIndicator';
import Step1ActionSelection from '../components/features/Step1ActionSelection';
import Step2ReactionSelection from '../components/features/Step2ReactionSelection';
import Step3NameAndSubmit from '../components/features/Step3NameAndSubmit';
import { useServices } from '../hooks/useServices';
import { createArea } from '../services/areasService';
import { OAUTH_SERVICES } from '../utils/constants';


const CreateWorkflowPage = () =>
{
  const navigate = useNavigate();
  const { services, connections, loading, error: fetchError } = useServices();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);

  const [selectedActionService, setSelectedActionService] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionConfig, setActionConfig] = useState({});

  const [selectedReactionService, setSelectedReactionService] = useState('');
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionConfig, setReactionConfig] = useState({});

  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayError = error || fetchError;

  const requiresOAuth = (serviceName) =>
  {
    const name = serviceName.toLowerCase();
    // Gmail and Drive are Google services
    if (name === 'gmail' || name === 'drive')
    {
      return OAUTH_SERVICES.includes('google');
    }
    return OAUTH_SERVICES.includes(name);
  };

  const isServiceAvailable = (serviceName) =>
  {
    if (!requiresOAuth(serviceName))
    {
      return true;
    }

    return connections.some(conn =>
      conn.service_name.toLowerCase() === serviceName.toLowerCase() && conn.is_connected
    );
  };

  const getAvailableServices = (withActions = false, withReactions = false) =>
  {
    return services.filter(service =>
    {
      const hasRequiredItems = withActions
        ? service.actions?.length > 0
        : withReactions
        ? service.reactions?.length > 0
        : true;

      return hasRequiredItems && isServiceAvailable(service.name);
    });
  };

  const getUnavailableServices = (withActions = false, withReactions = false) =>
  {
    return services.filter(service =>
    {
      const hasRequiredItems = withActions
        ? service.actions?.length > 0
        : withReactions
        ? service.reactions?.length > 0
        : true;

      return hasRequiredItems && !isServiceAvailable(service.name);
    });
  };

  const getActionsForService = (serviceName) =>
  {
    const service = services.find(s => s.name === serviceName);
    return service?.actions || [];
  };

  const getReactionsForService = (serviceName) =>
  {
    const service = services.find(s => s.name === serviceName);
    return service?.reactions || [];
  };

  const handleActionServiceChange = (e) =>
  {
    setSelectedActionService(e.target.value);
    setSelectedAction(null);
    setActionConfig({});
  };

  const handleActionChange = (e) =>
  {
    const actionId = e.target.value;
    const actions = getActionsForService(selectedActionService);
    const action = actions.find(a => a.id === parseInt(actionId));
    setSelectedAction(action);
    setActionConfig({});
  };

  const handleReactionServiceChange = (e) =>
  {
    setSelectedReactionService(e.target.value);
    setSelectedReaction(null);
    setReactionConfig({});
  };

  const handleReactionChange = (e) =>
  {
    const reactionId = e.target.value;
    const reactions = getReactionsForService(selectedReactionService);
    const reaction = reactions.find(r => r.id === parseInt(reactionId));
    setSelectedReaction(reaction);
    setReactionConfig({});
  };

  const handleActionConfigChange = (key, value) =>
  {
    setActionConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReactionConfigChange = (key, value) =>
  {
    setReactionConfig(prev => ({ ...prev, [key]: value }));
  };

  const canProceedFromStep1 = () =>
  {
    return selectedAction !== null;
  };

  const canProceedFromStep2 = () =>
  {
    return selectedReaction !== null;
  };

  const handleNextStep = () =>
  {
    if (currentStep < 3)
    {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () =>
  {
    if (currentStep > 1)
    {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () =>
  {
    if (!workflowName.trim())
    {
      setError('Workflow name is required');
      return;
    }

    try
    {
      setSubmitting(true);
      setError(null);

      let finalActionConfig = { ...actionConfig };
      if (selectedAction?.name === 'time_matches')
      {
        finalActionConfig.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      const areaData = {
        name: workflowName,
        description: workflowDescription,
        action_id: selectedAction.id,
        reaction_id: selectedReaction.id,
        action_config: finalActionConfig,
        reaction_config: reactionConfig
      };

      await createArea(areaData);
      navigate('/workflows');
    }
    catch (err)
    {
      setError(err.message);
    }
    finally
    {
      setSubmitting(false);
    }
  };

  return (
    <Layout>

      <div className="max-w-4xl mx-auto px-4 py-12">

        <PageHeader
          title="Create Workflow"
          subtitle="Connect actions and reactions to automate tasks"
        />

        <StepIndicator currentStep={currentStep} />

        {loading && (
          <div className="text-center text-white text-xl">
            Loading services...
          </div>
        )}

        {displayError && (
          <div className="bg-black border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        {!loading && (
          <div className="bg-black border border-white rounded-xl p-8">

            {currentStep === 1 && (
              <Step1ActionSelection
                availableServices={getAvailableServices(true, false)}
                unavailableServices={getUnavailableServices(true, false)}
                selectedService={selectedActionService}
                onServiceChange={handleActionServiceChange}
                selectedAction={selectedAction}
                onActionChange={handleActionChange}
                actionConfig={actionConfig}
                onConfigChange={handleActionConfigChange}
                actions={getActionsForService(selectedActionService)}
                onNext={handleNextStep}
                canProceed={canProceedFromStep1()}
              />
            )}

            {currentStep === 2 && (
              <Step2ReactionSelection
                availableServices={getAvailableServices(false, true)}
                unavailableServices={getUnavailableServices(false, true)}
                selectedService={selectedReactionService}
                onServiceChange={handleReactionServiceChange}
                selectedReaction={selectedReaction}
                onReactionChange={handleReactionChange}
                reactionConfig={reactionConfig}
                onConfigChange={handleReactionConfigChange}
                reactions={getReactionsForService(selectedReactionService)}
                onNext={handleNextStep}
                onBack={handlePrevStep}
                canProceed={canProceedFromStep2()}
              />
            )}

            {currentStep === 3 && (
              <Step3NameAndSubmit
                selectedAction={selectedAction}
                selectedReaction={selectedReaction}
                workflowName={workflowName}
                onNameChange={setWorkflowName}
                workflowDescription={workflowDescription}
                onDescriptionChange={setWorkflowDescription}
                onSubmit={handleSubmit}
                onBack={handlePrevStep}
                submitting={submitting}
              />
            )}

          </div>
        )}

      </div>

    </Layout>
  );
};


export default CreateWorkflowPage;
