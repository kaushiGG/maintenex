
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  FilePlus2, 
  Calendar, 
  ClipboardList, 
  CheckCircle, 
  Star, 
  FileDown
} from 'lucide-react';

// Import all tab components
import TemplatesTab from './tabs/TemplatesTab';
import ReportBuilderTab from './tabs/ReportBuilderTab';
import ScheduledReportsTab from './tabs/ScheduledReportsTab';
import ComplianceReportsTab from './tabs/ComplianceReportsTab';
import ServiceCompletionTab from './tabs/ServiceCompletionTab';
import ContractorPerformanceTab from './tabs/ContractorPerformanceTab';
import ExportOptionsTab from './tabs/ExportOptionsTab';

const ReportingModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Compliance Reports
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Service Completion
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Contractor Performance
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export Options
          </TabsTrigger>
        </TabsList>
        
        {/* Individual tab content components */}
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        
        <TabsContent value="builder">
          <ReportBuilderTab />
        </TabsContent>
        
        <TabsContent value="scheduled">
          <ScheduledReportsTab />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceReportsTab />
        </TabsContent>
        
        <TabsContent value="service">
          <ServiceCompletionTab />
        </TabsContent>
        
        <TabsContent value="performance">
          <ContractorPerformanceTab />
        </TabsContent>
        
        <TabsContent value="export">
          <ExportOptionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingModule;
