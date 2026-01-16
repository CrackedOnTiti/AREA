import React from 'react';
import { INPUT_BASE } from '../../../utils/styles';


const NumberInput = ({ value, onChange, placeholder }) =>
{
  const handleChange = (e) =>
  {
    const numValue = parseInt(e.target.value);
    onChange(numValue);
  };

  return (
    <input
      type="number"
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      className={INPUT_BASE}
    />
  );
};


export default NumberInput;
