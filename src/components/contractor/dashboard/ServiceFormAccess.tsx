import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FileText, Download, Clock } from 'lucide-react';
import ContractorDashboardContent from './ContractorDashboardContent';
import { useAuth } from '@/context/AuthContext';

const ServiceFormAccess = () => {
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  
  const handleLogout = () => {
    // Implement logout functionality
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    // In a real implementation, you might fetch forms from an API based on the selected criteria
  };

  const forms = [
    { 
      id: 1, 
      title: "Test & Tag Service Record", 
      description: "Standard form for recording Test & Tag service details",
      lastUpdated: "2023-10-15"
    },
    { 
      id: 2, 
      title: "Emergency Lighting Inspection Form", 
      description: "Document for emergency lighting inspection and testing",
      lastUpdated: "2023-11-02"
    },
    { 
      id: 3, 
      title: "Job Completion Certificate", 
      description: "Certificate to confirm service completion",
      lastUpdated: "2023-10-28"
    },
    { 
      id: 4, 
      title: "Equipment Maintenance Log", 
      description: "Log for tracking equipment maintenance activities",
      lastUpdated: "2023-09-20"
    }
  ];

  return (
    <ContractorDashboardContent 
      userRole="contractor" 
      handleLogout={handleLogout}
      userData={user}
      showBackButton={true}
      backTo="/contractor-dashboard"
      backText="Dashboard"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Documentation</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4">Find Documentation</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <Select onValueChange={setServiceType} value={serviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test-tag">Test & Tag</SelectItem>
                      <SelectItem value="rcd-testing">RCD Testing</SelectItem>
                      <SelectItem value="emergency-lighting">Emergency Lighting</SelectItem>
                      <SelectItem value="thermal-imaging">Thermal Imaging</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="air-conditioning">Air Conditioning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job ID (Optional)</label>
                  <Input
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="Enter Job ID"
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-forgemate-purple hover:bg-forgemate-purple/90 text-white"
                >
                  Search Documentation
                </Button>
              </form>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {showResults ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Available Documentation</h2>
                <div className="space-y-4">
                  {forms.map((form) => (
                    <Card key={form.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <FileText className="h-8 w-8 text-forgemate-purple" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{form.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Last updated: {form.lastUpdated}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-4 text-forgemate-purple border-forgemate-purple"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 shadow-md text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Documents Selected</h2>
                <p className="text-gray-500">
                  Select a service type and/or enter a job ID to find relevant documentation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContractorDashboardContent>
  );
};

export default ServiceFormAccess; 