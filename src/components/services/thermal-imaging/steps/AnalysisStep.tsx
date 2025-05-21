import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StepsIndicator } from './StepsIndicator';
import { AnalysisMainPanel } from '../panels/AnalysisMainPanel';

interface AnalysisStepProps {
  uploadedImage: string;
  normalImage: string | null;
  analysisResults: any;
  onSaveResults: (results: any) => void;
  setCurrentStep: (step: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleDownloadReport: () => void;
  isSaving?: boolean;
  isDownloading?: boolean;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({
  uploadedImage,
  normalImage,
  analysisResults,
  onSaveResults,
  setCurrentStep,
  activeTab,
  setActiveTab,
  handleDownloadReport,
  isSaving,
  isDownloading
}) => {
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 flex flex-row justify-between items-center">
        <CardTitle>Thermal Analysis Results</CardTitle>
        <Button variant="outline" onClick={handleDownloadReport} disabled={isSaving || isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Analysis
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <StepsIndicator currentStep={2} />

        <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="main">Main Panel</TabsTrigger>
            <TabsTrigger value="circuit">Circuit Breakers</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main" className="mt-0">
            <div className="mt-6">
              <AnalysisMainPanel 
                uploadedImage={uploadedImage}
                normalImage={normalImage}
                analysisResults={analysisResults}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="circuit" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Circuit breaker analysis will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Connection points analysis will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Analysis summary will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(0)}
          disabled={isSaving || isDownloading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Upload
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadReport}
            disabled={isSaving || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </>
            )}
          </Button>
          <Button 
            onClick={() => setCurrentStep(3)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving || isDownloading}
          >
            <ArrowRight className="h-4 w-4 ml-2 order-last" />
            Continue to Report
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
