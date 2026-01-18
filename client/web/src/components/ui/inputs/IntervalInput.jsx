import React from 'react';
import { INPUT_BASE } from '../../../utils/styles';


const IntervalInput = ({ value, onChange }) =>
{
  const intervals = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440];

  const getLabel = (minutes) =>
  {
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = minutes / 60;
    if (hours === 24) return '24 hours (1 day)';
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <select
      value={value || 1}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={`${INPUT_BASE} cursor-pointer`}
    >
      {intervals.map(interval => (
        <option key={interval} value={interval}>
          {getLabel(interval)}
        </option>
      ))}
    </select>
  );
};


export default IntervalInput;
