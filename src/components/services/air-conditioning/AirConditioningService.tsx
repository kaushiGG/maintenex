
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileDown, Search, Filter, Plus, Wind, Thermometer, Building } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Import components
import UnitsTab from './UnitsTab';
import FiltersTab from './FiltersTab';
import ReportsTab from './ReportsTab';
import SiteInfoCard from '../rcd-testing/SiteInfoCard';
import ComplianceRateCard from './ComplianceRateCard';

// Import mock data
import { acUnits, serviceReports, complianceData, getFilterComplianceStatus } from './mockData';

const AirConditioningService: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters to get site information if coming from site page
  const queryParams = new URLSearchParams(location.search);
  const siteId = queryParams.get('siteId') || '';
  const siteName = queryParams.get('siteName') || 'Selected Site';
  const siteAddress = queryParams.get('siteAddress') || '';
  
  // Redirect to landing page if no site is selected
  useEffect(() => {
    if (!siteId) {
      navigate('/services/landing/air-conditioning');
    }
  }, [siteId, navigate]);
  
  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "CSV file has been generated and downloaded"
    });
  };

  const filterUnitsByStatus = (status: string | null) => {
    setFilterStatus(status);
  };

  // Filter units based on search query and filter status
  const filteredUnits = acUnits.filter(unit => {
    const matchesSearch = 
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      unit.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || unit.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get filter compliance stats
  const filterComplianceStats = getFilterComplianceStatus(acUnits);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/services/landing/air-conditioning')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sites
          </Button>
          <h1 className="text-2xl font-bold">Air Conditioning Maintenance</h1>
        </div>
        <Button onClick={handleExportData} className="bg-cyan-600 hover:bg-cyan-700">
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Site Information */}
      <div className="mb-6">
        <div className="flex items-center mt-1">
          <Building className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-gray-500">{siteName} • {siteAddress}</span>
        </div>
      </div>

      {/* Compliance Rate Card */}
      <ComplianceRateCard complianceData={complianceData} />

      {/* Filter Compliance Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Total Units</div>
          <div className="text-2xl font-bold">{filterComplianceStats.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
          <div className="text-sm text-green-600">Compliant</div>
          <div className="text-2xl font-bold text-green-700">{filterComplianceStats.compliant}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100">
          <div className="text-sm text-amber-600">Due Soon</div>
          <div className="text-2xl font-bold text-amber-700">{filterComplianceStats.dueSoon}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100">
          <div className="text-sm text-red-600">Overdue</div>
          <div className="text-2xl font-bold text-red-700">{filterComplianceStats.overdue}</div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search units by name, location, or ID..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterStatus === null ? "default" : "outline"} 
            size="sm"
            onClick={() => filterUnitsByStatus(null)}
            className="whitespace-nowrap"
          >
            All Units
          </Button>
          <Button 
            variant={filterStatus === "Filter Due" ? "default" : "outline"} 
            size="sm"
            onClick={() => filterUnitsByStatus("Filter Due")}
            className="whitespace-nowrap bg-amber-600 hover:bg-amber-700"
          >
            Filter Due
          </Button>
          <Button 
            variant={filterStatus === "Needs Service" ? "default" : "outline"} 
            size="sm"
            onClick={() => filterUnitsByStatus("Needs Service")}
            className="whitespace-nowrap bg-red-600 hover:bg-red-700"
          >
            Needs Service
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="whitespace-nowrap gap-1"
          >
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Add New Unit Button */}
      <div className="flex justify-end mb-6">
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Unit
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="units" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="units">AC Units</TabsTrigger>
          <TabsTrigger value="filters">Filter Tracking</TabsTrigger>
          <TabsTrigger value="reports">Service Reports</TabsTrigger>
        </TabsList>

        {/* Units Tab Content */}
        <TabsContent value="units">
          <UnitsTab units={filteredUnits} />
        </TabsContent>

        {/* Filters Tab Content */}
        <TabsContent value="filters">
          <FiltersTab units={filteredUnits} />
        </TabsContent>

        {/* Reports Tab Content */}
        <TabsContent value="reports">
          <ReportsTab reports={serviceReports} units={acUnits} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AirConditioningService;
