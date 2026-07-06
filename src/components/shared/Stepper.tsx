'use client';

import React from 'react';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  style?: React.CSSProperties;
}

export default function Stepper({ steps, currentStep, onStepClick, style }: StepperProps) {
  return (
    <div className="creator-stepper-container" style={{ ...style }}>
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <React.Fragment key={step.number}>
            <div 
              className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => {
                if (onStepClick && (isCompleted || step.number < currentStep)) {
                  onStepClick(step.number);
                }
              }}
            >
              <div className="stepper-circle">
                {isCompleted ? (
                  <svg className="checkmark-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>
            
            {idx < steps.length - 1 && (
              <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
