import React from 'react';
import { INPUT_BASE } from '../../../utils/styles';


const TextInput = ({ value, onChange, placeholder, type = 'text' }) =>
{
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_BASE}
    />
  );
};


export default TextInput;
