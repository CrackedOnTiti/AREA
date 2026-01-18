import React from 'react';
import { INPUT_BASE } from '../../../utils/styles';


const TimeInput = ({ value, onChange }) =>
{
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [hour, minute] = (value || '00:00').split(':');

  const handleHourChange = (e) =>
  {
    const newHour = e.target.value.padStart(2, '0');
    onChange(`${newHour}:${minute || '00'}`);
  };

  const handleMinuteChange = (e) =>
  {
    const newMinute = e.target.value.padStart(2, '0');
    onChange(`${hour || '00'}:${newMinute}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={hour || '00'}
          onChange={handleHourChange}
          className={`${INPUT_BASE} w-20 cursor-pointer`}
        >
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-white text-xl">:</span>
        <select
          value={minute || '00'}
          onChange={handleMinuteChange}
          className={`${INPUT_BASE} w-20 cursor-pointer`}
        >
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <p className="text-gray-500 text-xs">
        24-hour format | Your timezone: {userTimezone}
      </p>
    </div>
  );
};


export default TimeInput;
