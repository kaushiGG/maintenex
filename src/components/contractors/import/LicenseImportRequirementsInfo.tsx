
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const LicenseImportRequirementsInfo: React.FC = () => {
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertTitle className="text-blue-700 font-medium">Required Fields</AlertTitle>
      <AlertDescription className="text-blue-700">
        <p className="text-sm">Your file must contain these required fields:</p>
        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
          <li><strong>contractor_name</strong> - Name of contractor (required, must exist in the system)</li>
          <li><strong>license_type</strong> - Type of license (required)</li>
          <li><strong>license_number</strong> - License number (required)</li>
          <li><strong>issue_date</strong> - Date of issue (required, format: YYYY-MM-DD)</li>
          <li><strong>expiry_date</strong> - Expiration date (required, format: YYYY-MM-DD)</li>
          <li><strong>provider</strong> - Issuing authority/provider (required)</li>
        </ul>
        <p className="text-sm mt-2">Optional fields:</p>
        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
          <li><strong>notes</strong> - Additional notes</li>
          <li><strong>status</strong> - Status (defaults to "Valid")</li>
        </ul>
        <p className="text-xs mt-2 italic text-red-700 font-medium">Important: Contractor names must match existing contractors in the system. Add contractors first before importing licenses.</p>
      </AlertDescription>
    </Alert>
  );
};

export default LicenseImportRequirementsInfo;
