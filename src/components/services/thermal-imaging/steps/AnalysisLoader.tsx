import React from 'react';
import { Loader2 } from 'lucide-react';

const AnalysisLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-3" />
      <p className="text-lg font-medium mb-2">Analyzing Thermal Image</p>
      <p className="text-sm text-gray-500">Please wait while we process your image...</p>
    </div>
  );
};

export default AnalysisLoader;
