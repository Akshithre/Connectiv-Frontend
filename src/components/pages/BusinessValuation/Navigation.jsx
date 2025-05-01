import React from 'react';

const ProgressSteps = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1, name: 'Register' },
    { id: 2, name: 'Business\nValuation' },
    { id: 3, name: 'Create\nProposal/Pitch' },
    { id: 4, name: 'Find Investors'},
    { id: 5, name: 'Improve\nValuation' }
  ];

  return (
    <div className="flex justify-center items-center my-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center relative">
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium cursor-default
                ${step.id === currentStep 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : step.id < currentStep
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'}`}
            >
              {step.id < currentStep ? '✓' : step.id}
            </button>
            <span 
              className="absolute top-12 w-24 text-xs text-center text-gray-600"
              style={{ whiteSpace: 'pre-line' }}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-24 h-0.5 
                ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;