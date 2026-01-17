import React from 'react';
import ConfigForm from '../features/ConfigForm';


function ConfigSection({ title, serviceName, color, schema, config, onChange, isLoading }) {

  return (
    <div className="bg-black rounded-lg p-4 border border-white">

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <h4 className="text-white font-medium">{title}</h4>
      </div>

      <p className="text-gray-400 text-sm mb-4">{serviceName}</p>

      <ConfigContent
        schema={schema}
        config={config}
        onChange={onChange}
        isLoading={isLoading}
      />

    </div>
  );
}


function ConfigContent({ schema, config, onChange, isLoading }) {

  if (isLoading) {
    return <p className="text-gray-400 text-sm">Loading configuration...</p>;
  }

  if (schema) {
    return (
      <ConfigForm
        schema={schema}
        config={config}
        onChange={onChange}
      />
    );
  }

  return (
    <JsonEditor
      value={config}
      onChange={onChange}
    />
  );
}


function JsonEditor({ value, onChange }) {

  function handleChange(e) {
    try {
      onChange(JSON.parse(e.target.value));
    } catch {}
  }

  return (
    <div>
      <p className="text-gray-400 text-xs mb-2">Configuration (JSON):</p>
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={handleChange}
        className="w-full bg-black border border-white rounded-lg px-3 py-2 text-white text-sm font-mono h-24 focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  );
}


export default ConfigSection;
