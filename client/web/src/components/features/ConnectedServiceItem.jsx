import React from 'react';
import { BUTTON_DANGER } from '../../utils/styles';


const ConnectedServiceItem = ({ service, isDisconnecting, onDisconnect }) =>
{
  return (
    <div className="flex items-center justify-between bg-black border border-white rounded-lg px-4 py-3">

      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-white font-medium">
          {service.display_name || service.name}
        </span>
      </div>

      <button
        onClick={() => onDisconnect(service.name)}
        disabled={isDisconnecting}
        className={`text-sm px-3 py-1 ${BUTTON_DANGER} ${isDisconnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isDisconnecting ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full" />
            Disconnecting...
          </span>
        ) : (
          'Disconnect'
        )}
      </button>

    </div>
  );
};


export default ConnectedServiceItem;
