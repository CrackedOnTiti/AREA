import React from 'react';
import { CARD_BASE, BUTTON_PRIMARY, STATUS_BADGE } from '../../utils/styles';


const ServiceCard = ({ service, isConnected, requiresOAuth, onConnect }) =>
{
  return (
    <div className={`${CARD_BASE} flex flex-col`}>

      <ServiceInfo name={service.display_name || service.name} description={service.description} />

      <div className="mt-auto">
        {isConnected ? (
          <ConnectionBadge badge={STATUS_BADGE.green} text="Connected" />
        ) : requiresOAuth ? (
          <ConnectButton onClick={() => onConnect(service.name)} />
        ) : (
          <ConnectionBadge badge={STATUS_BADGE.blue} text="Available" />
        )}
      </div>

    </div>
  );
};


const ServiceInfo = ({ name, description }) =>
{
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold text-white mb-2">
        {name}
      </h3>

      <p className="text-gray-400 text-sm">
        {description}
      </p>
    </div>
  );
};


const ConnectionBadge = ({ badge, text }) =>
{
  return (
    <div className="flex items-center gap-2">
      <div className={badge.dot} />
      <span className={badge.text}>
        {text}
      </span>
    </div>
  );
};


const ConnectButton = ({ onClick }) =>
{
  return (
    <button
      onClick={onClick}
      className={`w-full ${BUTTON_PRIMARY}`}
    >
      Connect
    </button>
  );
};


export default ServiceCard;
