import React from 'react';

const Alert = ({ message, type = 'info', onClose }) => {
  // Définir les styles selon le type
  const alertStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  const iconStyles = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const baseStyles = 'border px-4 py-3 rounded relative flex items-center justify-between';
  const combinedStyles = `${baseStyles} ${alertStyles[type]}`;

  return (
    <div className={combinedStyles} role="alert">
      <div className="flex items-center">
        <span className="mr-2 text-xl">{iconStyles[type]}</span>
        <span className="block sm:inline">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold hover:opacity-70"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;