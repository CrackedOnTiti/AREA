import React from 'react';
import TextInput from '../ui/inputs/TextInput';
import NumberInput from '../ui/inputs/NumberInput';
import SelectInput from '../ui/inputs/SelectInput';
import CheckboxInput from '../ui/inputs/CheckboxInput';
import TimeInput from '../ui/inputs/TimeInput';
import IntervalInput from '../ui/inputs/IntervalInput';


const ConfigForm = ({ schema, config, onChange }) =>
{
  if (!schema || !schema.properties)
  {
    return null;
  }

  const properties = schema.properties;
  const required = schema.required || [];

  return (
    <div>
      {Object.keys(properties).map((key) =>
      {
        const prop = properties[key];
        const isRequired = required.includes(key);

        return (
          <ConfigField
            key={key}
            fieldKey={key}
            prop={prop}
            isRequired={isRequired}
            value={config[key]}
            onChange={(value) => onChange(key, value)}
          />
        );
      })}
    </div>
  );
};


const ConfigField = ({ fieldKey, prop, isRequired, value, onChange }) =>
{
  return (
    <div className="mb-4">

      <label className="block text-white text-sm font-medium mb-2">
        {prop.title || fieldKey}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>

      {prop.description && (
        <p className="text-gray-400 text-xs mb-2">
          {prop.description}
        </p>
      )}

      <InputField prop={prop} value={value} onChange={onChange} fieldKey={fieldKey} />

    </div>
  );
};


const isTimeField = (key, prop) =>
{
  if (key === 'time') return true;
  if (prop.pattern && prop.pattern.includes('[0-2]') && prop.pattern.includes('[0-5]')) return true;
  return false;
};


const isIntervalField = (key) =>
{
  return key.toLowerCase().includes('interval');
};


const InputField = ({ prop, value, onChange, fieldKey }) =>
{
  if (prop.type === 'string' && prop.enum)
  {
    return (
      <SelectInput
        value={value}
        onChange={onChange}
        options={prop.enum}
        placeholder={`Select ${prop.title || fieldKey}`}
      />
    );
  }

  if (prop.type === 'string' && isTimeField(fieldKey, prop))
  {
    return (
      <TimeInput
        value={value}
        onChange={onChange}
      />
    );
  }

  if (prop.type === 'string')
  {
    const inputType = prop.format === 'email' ? 'email' : 'text';
    return (
      <TextInput
        value={value}
        onChange={onChange}
        placeholder={prop.default || ''}
        type={inputType}
      />
    );
  }

  if ((prop.type === 'integer' || prop.type === 'number') && isIntervalField(fieldKey))
  {
    return (
      <IntervalInput
        value={value}
        onChange={onChange}
      />
    );
  }

  if (prop.type === 'integer' || prop.type === 'number')
  {
    return (
      <NumberInput
        value={value}
        onChange={onChange}
        placeholder={prop.default || ''}
      />
    );
  }

  if (prop.type === 'boolean')
  {
    return (
      <CheckboxInput
        checked={value}
        onChange={onChange}
      />
    );
  }

  return (
    <TextInput
      value={value}
      onChange={onChange}
      placeholder=""
    />
  );
};


export default ConfigForm;
