import React from 'react';
import { INPUT_BASE } from '../../../utils/styles';


const SelectInput = ({ value, onChange, options, placeholder }) =>
{
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_BASE}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};


export default SelectInput;
