import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepsIndicatorProps {
  currentStep: number;
}

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex mb-8">
      <div className="flex flex-col items-center flex-1 relative">
        <div className={`w-10 h-10 rounded-full ${currentStep > 1 ? 'bg-green-600 text-white' : currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold z-10`}>
          {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : 1}
        </div>
        <div className={`mt-2 text-sm font-medium ${currentStep > 1 ? 'text-green-600' : currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Upload & Configure</div>
        <div className={`absolute h-1 ${currentStep > 1 ? 'bg-green-600' : 'bg-gray-200'} top-5 left-1/2 w-full`}></div>
      </div>
      <div className="flex flex-col items-center flex-1 relative">
        <div className={`w-10 h-10 rounded-full ${currentStep > 2 ? 'bg-green-600 text-white' : currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold z-10`}>
          {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : 2}
        </div>
        <div className={`mt-2 text-sm ${currentStep > 2 ? 'font-medium text-green-600' : currentStep === 2 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Analysis</div>
        <div className={`absolute h-1 ${currentStep > 2 ? 'bg-green-600' : 'bg-gray-200'} top-5 left-1/2 w-full`}></div>
      </div>
      <div className="flex flex-col items-center flex-1">
        <div className={`w-10 h-10 rounded-full ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-semibold z-10`}>
          {currentStep > 3 ? <CheckCircle className="h-5 w-5" /> : 3}
        </div>
        <div className={`mt-2 text-sm ${currentStep === 3 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>Report & Compliance</div>
      </div>
    </div>
  );
};
