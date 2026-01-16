import React from 'react';


const StepIndicator = ({ currentStep }) =>
{
  return (
    <div className="mb-8 flex justify-center items-center gap-4">

      <StepCircle number={1} isActive={currentStep >= 1} />
      <StepLine isActive={currentStep >= 2} />
      <StepCircle number={2} isActive={currentStep >= 2} />
      <StepLine isActive={currentStep >= 3} />
      <StepCircle number={3} isActive={currentStep >= 3} />

    </div>
  );
};


const StepCircle = ({ number, isActive }) =>
{
  const styles = isActive
    ? 'bg-white text-black border-white'
    : 'bg-black text-white border-white';

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${styles}`}>
      {number}
    </div>
  );
};


const StepLine = ({ isActive }) =>
{
  const color = isActive ? 'bg-white' : 'bg-gray-600';
  return <div className={`h-0.5 w-16 ${color}`}></div>;
};


export default StepIndicator;
