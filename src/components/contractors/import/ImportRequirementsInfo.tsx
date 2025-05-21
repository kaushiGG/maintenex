
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const ImportRequirementsInfo: React.FC = () => {
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-500" />
      <AlertTitle className="text-blue-700 font-medium">Required Fields</AlertTitle>
      <AlertDescription className="text-blue-700">
        <p className="text-sm">Your file must contain these required fields:</p>
        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
          <li><strong>name</strong> - Contractor name (required)</li>
          <li><strong>service_type</strong> - Type of service provided (required)</li>
        </ul>
        <p className="text-sm mt-2">Optional fields:</p>
        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
          <li><strong>status</strong> - Active, Warning, or Suspended (defaults to "Active")</li>
          <li><strong>contact_email</strong> - Contact email address</li>
          <li><strong>contact_phone</strong> - Contact phone number</li>
          <li><strong>location</strong> - Contractor's location</li>
          <li><strong>notes</strong> - Additional notes</li>
          <li><strong>credentials</strong> - Professional credentials</li>
          <li><strong>rating</strong> - Rating from 1-5</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default ImportRequirementsInfo;
