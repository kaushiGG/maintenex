
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';

// Import components
import EquipmentTab from './EquipmentTab';
import TestHistoryTab from './TestHistoryTab';
import ComplianceReport from './ComplianceReport';
import ActionCards from './ActionCards';
import SiteInfoCard from './SiteInfoCard';

// Import mock data
import { rcdEquipmentData, testHistory } from './mockData';

const RCDTestingService: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [compliance, setCompliance] = useState<number>(78);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters to get site information if coming from site page
  const queryParams = new URLSearchParams(location.search);
  const siteId = queryParams.get('siteId');
  const siteName = queryParams.get('siteName');
  
  const handleConnect = () => {
    setIsConnected(true);
    toast({
      title: "Connected",
      description: "Successfully connected to RCD testing device"
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "CSV file has been generated and downloaded"
    });
  };

  const handleQRScan = (data: string) => {
    console.log("QR Code scanned:", data);
    toast({
      title: "QR Code Scanned",
      description: `Identified device: ${data}`
    });
  };

  // Updated back button navigation logic to direct to RCD testing landing page
  const handleBackClick = () => {
    // Navigate to the specified URL for RCD testing landing
    window.location.href = 'https://preview--pretance.lovable.app/services/landing/rcd-testing';
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Service Landing
          </Button>
          <h1 className="text-2xl font-bold">RCD Testing Management</h1>
        </div>
        <Button onClick={handleExportData} className="bg-forgemate-purple hover:bg-forgemate-dark">
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Site Information Card */}
      <SiteInfoCard siteName={siteName} />

      {/* Action Cards */}
      <ActionCards isConnected={isConnected} onConnect={handleConnect} />

      {/* Tabs Section */}
      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="testHistory">Test History</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Report</TabsTrigger>
        </TabsList>

        {/* Equipment Tab Content */}
        <TabsContent value="equipment">
          <EquipmentTab 
            isConnected={isConnected} 
            equipmentData={rcdEquipmentData} 
            onQRScan={handleQRScan} 
          />
        </TabsContent>

        {/* Test History Tab Content */}
        <TabsContent value="testHistory">
          <TestHistoryTab testHistory={testHistory} />
        </TabsContent>

        {/* Compliance Report Tab Content */}
        <TabsContent value="compliance">
          <ComplianceReport compliance={compliance} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RCDTestingService;
