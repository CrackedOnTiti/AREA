import React from 'react';


const PageHeader = ({ title, subtitle, action }) =>
{
  return (
    <div className="mb-12 flex justify-between items-center">

      <div>
        <h2 className="text-4xl font-bold text-white mb-2">
          {title}
        </h2>

        {subtitle && (
          <p className="text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
};


export default PageHeader;
