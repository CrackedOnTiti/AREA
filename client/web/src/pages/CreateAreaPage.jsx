import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

const CreateAreaPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedActionService: null,
    selectedAction: null,
    actionConfig: {},
    selectedReactionService: null,
    selectedReaction: null,
    reactionConfig: {},
    isActive: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  const handleActionSelect = (service, action) => {
    setFormData(prev => ({
      ...prev,
      selectedActionService: service,
      selectedAction: action,
      actionConfig: {}
    }));
  };

  const handleReactionSelect = (service, reaction) => {
    setFormData(prev => ({
      ...prev,
      selectedReactionService: service,
      selectedReaction: reaction,
      reactionConfig: {}
    }));
  };

  const handleConfigChange = (type, key, value) => {
    setFormData(prev => ({
      ...prev,
      [type === 'action' ? 'actionConfig' : 'reactionConfig']: {
        ...prev[type === 'action' ? 'actionConfig' : 'reactionConfig'],
        [key]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        name: formData.name,
        description: formData.description,
        action_id: formData.selectedAction.id,
        reaction_id: formData.selectedReaction.id,
        action_config: formData.actionConfig,
        reaction_config: formData.reactionConfig,
        is_active: formData.isActive
      };

      const response = await fetch('http://localhost:8080/api/areas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'AREA created successfully!' });
        setTimeout(() => navigate('/areas'), 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create AREA');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedAction !== null;
      case 2:
        return Object.keys(formData.actionConfig).length > 0;
      case 3:
        return formData.selectedReaction !== null;
      case 4:
        return Object.keys(formData.reactionConfig).length > 0;
      case 5:
        return formData.name.trim().length > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/areas')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to My AREAs
          </button>
          <h1 className="text-3xl font-bold">Create New AREA</h1>
          <p className="text-gray-600 mt-2">
            Set up an automated workflow by connecting an Action to a REAction
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map(step => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <p className="text-xs mt-2 text-center">
                    {step === 1 && 'Select Action'}
                    {step === 2 && 'Configure Action'}
                    {step === 3 && 'Select REAction'}
                    {step === 4 && 'Configure REAction'}
                    {step === 5 && 'Name & Activate'}
                  </p>
                </div>
                {step < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert {...alert} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6 min-h-96">
          {/* Step 1: Select Action */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Select an Action</h2>
              <p className="text-gray-600 mb-6">
                Choose what will trigger your automation
              </p>
              
              <div className="space-y-4">
                {services.filter(s => s.actions?.length > 0).map(service => (
                  <div key={service.name} className="border rounded-lg p-4">
                    <h3 className="font-bold mb-3">{service.display_name}</h3>
                    <div className="space-y-2">
                      {service.actions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => handleActionSelect(service, action)}
                          className={`w-full text-left p-3 rounded border-2 transition-colors ${
                            formData.selectedAction?.id === action.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <p className="font-medium">{action.display_name}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Action */}
          {currentStep === 2 && formData.selectedAction && (
            <div>
              <h2 className="text-xl font-bold mb-4">Configure Action</h2>
              <p className="text-gray-600 mb-6">
                {formData.selectedAction.display_name} - {formData.selectedAction.description}
              </p>

              <ConfigForm
                schema={formData.selectedAction.config_schema}
                values={formData.actionConfig}
                onChange={(key, value) => handleConfigChange('action', key, value)}
              />
            </div>
          )}

          {/* Step 3: Select REAction */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Select a REAction</h2>
              <p className="text-gray-600 mb-6">
                Choose what happens when the action triggers
              </p>
              
              <div className="space-y-4">
                {services.filter(s => s.reactions?.length > 0).map(service => (
                  <div key={service.name} className="border rounded-lg p-4">
                    <h3 className="font-bold mb-3">{service.display_name}</h3>
                    <div className="space-y-2">
                      {service.reactions.map(reaction => (
                        <button
                          key={reaction.id}
                          onClick={() => handleReactionSelect(service, reaction)}
                          className={`w-full text-left p-3 rounded border-2 transition-colors ${
                            formData.selectedReaction?.id === reaction.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <p className="font-medium">{reaction.display_name}</p>
                          <p className="text-sm text-gray-600">{reaction.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Configure REAction */}
          {currentStep === 4 && formData.selectedReaction && (
            <div>
              <h2 className="text-xl font-bold mb-4">Configure REAction</h2>
              <p className="text-gray-600 mb-6">
                {formData.selectedReaction.display_name} - {formData.selectedReaction.description}
              </p>

              <ConfigForm
                schema={formData.selectedReaction.config_schema}
                values={formData.reactionConfig}
                onChange={(key, value) => handleConfigChange('reaction', key, value)}
              />
            </div>
          )}

          {/* Step 5: Name & Activate */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Name Your AREA</h2>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Summary</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">ACTION</p>
                    <p className="font-medium">{formData.selectedAction.display_name}</p>
                    <p className="text-xs text-gray-500">{formData.selectedActionService.display_name}</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">REACTION</p>
                    <p className="font-medium">{formData.selectedReaction.display_name}</p>
                    <p className="text-xs text-gray-500">{formData.selectedReactionService.display_name}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AREA Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Daily Reminder at 2 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe what this AREA does..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Activate immediately
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium ${
                canProceed()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create AREA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Config Form Component
const ConfigForm = ({ schema, values, onChange }) => {
  if (!schema || !schema.properties) {
    return <p className="text-gray-500">No configuration required</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema.properties).map(([key, prop]) => {
        const isRequired = schema.required?.includes(key);
        
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {prop.description || key} {isRequired && <span className="text-red-500">*</span>}
            </label>
            
            {prop.maxLength > 200 ? (
              <textarea
                value={values[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder={prop.description}
                required={isRequired}
              />
            ) : prop.type === 'integer' ? (
              <input
                type="number"
                value={values[key] || ''}
                onChange={(e) => onChange(key, parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={prop.description}
                min={prop.minimum}
                required={isRequired}
              />
            ) : (
              <input
                type="text"
                value={values[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={prop.description}
                pattern={prop.pattern}
                required={isRequired}
              />
            )}
            
            {prop.pattern && (
              <p className="text-xs text-gray-500 mt-1">
                Format: {prop.pattern}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CreateAreaPage;