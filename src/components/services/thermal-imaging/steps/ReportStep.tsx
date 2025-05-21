import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  AlertTriangle,
  Loader2,
  Thermometer,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StepsIndicator } from './StepsIndicator';

interface ReportStepProps {
  analysisResults: any;
  normalImage: string | null;
  uploadedImage: string | null;
  setCurrentStep: (step: number) => void;
  handleDownloadReport: () => void;
  handleCompleteAnalysis: () => void;
  isSaving?: boolean;
  isDownloading?: boolean;
}

export const ReportStep: React.FC<ReportStepProps> = ({
  analysisResults,
  normalImage,
  uploadedImage,
  setCurrentStep,
  handleDownloadReport,
  handleCompleteAnalysis,
  isSaving = false,
  isDownloading = false
}) => {
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle>Generate Report & Compliance Document</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <StepsIndicator currentStep={3} />
        
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Issues Detected</AlertTitle>
            <AlertDescription>
              This thermal imaging analysis has detected critical temperature issues that require immediate attention.
            </AlertDescription>
          </Alert>
          
          {/* Image Preview Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-blue-600" />
                    <Label>Thermal Image</Label>
                  </div>
                  {uploadedImage && (
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={uploadedImage} 
                        alt="Thermal" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileImage className="h-4 w-4 text-blue-600" />
                    <Label>Normal Reference Image</Label>
                  </div>
                  {normalImage ? (
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={normalImage} 
                        alt="Normal Reference" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md h-48 flex items-center justify-center text-gray-400">
                      No reference image available
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <Input 
                      id="reportTitle" 
                      defaultValue={`Thermal Imaging Analysis - ${analysisResults.equipment}`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDate">Report Date</Label>
                    <Input 
                      id="reportDate" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportSummary">Executive Summary</Label>
                  <Textarea 
                    id="reportSummary" 
                    rows={3}
                    defaultValue={`Thermal imaging analysis of ${analysisResults.equipment} revealed ${analysisResults.hotspots.length} areas of concern, including one critical hotspot requiring immediate attention.`} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea 
                    id="recommendations" 
                    rows={4}
                    defaultValue={`1. Immediate maintenance required for the overheating connection point in Terminal Block C.
2. Schedule inspection for Circuit Breaker 3 within the next maintenance cycle.
3. Consider load balancing across all phases to reduce potential hotspots.`} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Compliance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="technician">Certifying Technician</Label>
                  <Input id="technician" defaultValue="John Carpenter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificationNumber">Certification Number</Label>
                  <Input id="certificationNumber" placeholder="e.g. TI-2023-1234" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentModel">Thermal Camera Model</Label>
                    <Input id="equipmentModel" defaultValue="FLIR E8-XT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calibrationDate">Last Calibration Date</Label>
                    <Input id="calibrationDate" type="date" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Certification Checklist</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="standardsCompliance" defaultChecked />
                      <label htmlFor="standardsCompliance" className="text-sm">
                        Analysis conducted in accordance with ISO standards
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="properDocumentation" defaultChecked />
                      <label htmlFor="properDocumentation" className="text-sm">
                        All required documentation has been completed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="followUpScheduled" />
                      <label htmlFor="followUpScheduled" className="text-sm">
                        Follow-up inspection scheduled for critical issues
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isSaving || isDownloading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis
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
            onClick={handleCompleteAnalysis}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving || isDownloading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Analysis
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
