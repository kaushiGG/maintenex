
import React from 'react';

interface ImportStatusDisplayProps {
  status?: 'idle' | 'loading' | 'success' | 'error';
  importedCount?: number;
  errors?: string[];
  duplicatesSkipped?: number;
  validationResult?: any;
  importProgress?: number;
  isImporting?: boolean;
}

const ImportStatusDisplay: React.FC<ImportStatusDisplayProps> = ({
  status,
  importedCount = 0,
  errors = [],
  duplicatesSkipped = 0,
  validationResult,
  importProgress = 0,
  isImporting = false
}) => {
  // Handle both direct status and validation result
  const displayStatus = status || 'idle';
  const hasValidationResult = validationResult !== undefined;
  
  if (displayStatus === 'idle' && !hasValidationResult) {
    return null;
  }

  if (hasValidationResult) {
    return (
      <div className="p-3 rounded-md bg-gray-50 border">
        <h4 className="font-medium mb-1 flex items-center">Validation Results</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="px-3 py-2 bg-green-50 rounded-md">
            <p className="text-xs text-gray-500">Valid Records</p>
            <p className="font-medium text-green-700">{validationResult.success}</p>
          </div>
          <div className="px-3 py-2 bg-red-50 rounded-md">
            <p className="text-xs text-gray-500">Invalid Records</p>
            <p className="font-medium text-red-700">{validationResult.failed}</p>
          </div>
        </div>
        
        {validationResult.failed > 0 && validationResult.errors && validationResult.errors.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-red-700">Errors:</p>
            <div className="max-h-28 overflow-y-auto border rounded mt-1 bg-white">
              <ul className="text-xs px-2 py-1">
                {validationResult.errors.slice(0, 5).map((error: string, idx: number) => (
                  <li key={idx} className="text-red-600 py-0.5">{error}</li>
                ))}
                {validationResult.errors.length > 5 && (
                  <li className="text-gray-500 italic py-0.5">...and {validationResult.errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {isImporting && (
          <div className="mt-3">
            <p className="text-xs text-gray-700 mb-1">Import progress: {importProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
              <div className="bg-[#7851CA] h-2.5 rounded-full" style={{ width: `${importProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-md ${
      displayStatus === 'loading' ? 'bg-blue-50 text-blue-700' :
      displayStatus === 'success' ? 'bg-green-50 text-green-700' :
      'bg-red-50 text-red-700'
    }`}>
      {displayStatus === 'loading' && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          <p>Processing import...</p>
        </div>
      )}
      
      {displayStatus === 'success' && (
        <div>
          <p className="font-medium flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Import Successful
          </p>
          <p className="text-sm mt-1">{importedCount} records imported.</p>
          {duplicatesSkipped > 0 && (
            <p className="text-sm">{duplicatesSkipped} duplicates skipped.</p>
          )}
        </div>
      )}
      
      {displayStatus === 'error' && (
        <div>
          <p className="font-medium flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Import Failed
          </p>
          {importedCount > 0 && (
            <p className="text-sm mt-1">{importedCount} records imported successfully.</p>
          )}
          {errors.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium">Errors:</p>
              <ul className="list-disc list-inside text-xs mt-1 max-h-28 overflow-y-auto">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="truncate">{error}</li>
                ))}
                {errors.length > 5 && (
                  <li className="italic">...and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportStatusDisplay;
