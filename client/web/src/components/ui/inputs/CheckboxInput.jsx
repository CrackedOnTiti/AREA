import React from 'react';


const CheckboxInput = ({ checked, onChange }) =>
{
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 bg-black border border-white rounded"
      />
    </div>
  );
};


export default CheckboxInput;
