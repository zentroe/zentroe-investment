import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

interface OnboardingProgressProps {
  showStepName?: boolean;
  className?: string;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  showStepName = true,
  className = ""
}) => {
  const { getProgressPercentage, getCurrentStepName } = useOnboarding();

  const percentage = getProgressPercentage();
  const stepName = getCurrentStepName();

  return (
    <div className={`w-full ${className}`}>
      {showStepName && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{stepName}</span>
          <span className="text-sm text-gray-500">{percentage}% complete</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!showStepName && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">{percentage}% complete</span>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
