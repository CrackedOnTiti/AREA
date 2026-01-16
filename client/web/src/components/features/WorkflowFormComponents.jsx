import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigForm from './ConfigForm';


export const ServiceDropdown = ({ value, onChange, services, disabled }) =>
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


export const NoServicesMessage = ({ type = 'actions' }) =>
{
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <p className="text-gray-300 mb-4">
        No services available with {type}. Please connect a service first.
      </p>

      <button
        onClick={() => navigate('/services')}
        className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-lg"
      >
        Go to Services
      </button>
    </div>
  );
};


export const ItemDropdown = ({ label, value, onChange, items, selectedItem, placeholder }) =>
{
  return (
    <div className="mb-6">
      <label className="block text-white text-sm font-medium mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {selectedItem?.description && (
        <p className="mt-2 text-gray-400 text-sm">
          {selectedItem.description}
        </p>
      )}
    </div>
  );
};


export const ConfigurationSection = ({ title, schema, config, onChange }) =>
{
  return (
    <div className="mb-6">
      <h4 className="text-white text-lg font-semibold mb-4">
        {title}
      </h4>

      <ConfigForm
        schema={schema}
        config={config}
        onChange={onChange}
      />
    </div>
  );
};
