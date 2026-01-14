import React, { useState } from 'react';
import { BUTTON_PRIMARY } from '../../utils/styles';


const ServiceCategory = ({ title, services, isConnecting, onConnect }) =>
{
  const [isOpen, setIsOpen] = useState(false);

  if (services.length === 0) return null;

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-black hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-lg">{title}</span>
          <span className="text-gray-500 text-sm">({services.length})</span>
        </div>

        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div className="border-t border-gray-700 bg-gray-900 bg-opacity-30">
          {services.map((service) => (
            <ServiceRow
              key={service.id || service.name}
              service={service}
              isConnecting={isConnecting === service.name}
              onConnect={onConnect}
            />
          ))}
        </div>
      )}

    </div>
  );
};


const ServiceRow = ({ service, isConnecting, onConnect }) =>
{
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-b-0">

      <div className="flex-1">
        <h4 className="text-white font-medium">
          {service.display_name || service.name}
        </h4>
        <p className="text-gray-400 text-sm mt-1">
          {service.description}
        </p>
      </div>

      <button
        onClick={() => onConnect(service.name)}
        disabled={isConnecting}
        className={`ml-4 text-sm px-4 py-2 ${BUTTON_PRIMARY} ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin h-3 w-3 border-2 border-black border-t-transparent rounded-full" />
            Connecting...
          </span>
        ) : (
          'Connect'
        )}
      </button>

    </div>
  );
};


const ChevronIcon = ({ isOpen }) =>
{
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};


export default ServiceCategory;
