import React, { useRef } from 'react';
import { 
  FolderInput, 
  SaveIcon, 
  ArrowRight,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StepsIndicator } from './StepsIndicator';

interface UploadStepProps {
  imagingType: string;
  setImagingType: (value: string) => void;
  siteName?: string;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  normalImage: string | null;
  setNormalImage: (image: string | null) => void;
  isAnalyzing: boolean;
  handleAnalyzeImage: () => void;
  handleBrowseClick: () => void;
  handleNormalImageBrowseClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  normalImageInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNormalImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  imagingType,
  setImagingType,
  siteName,
  uploadedImage,
  setUploadedImage,
  normalImage,
  setNormalImage,
  isAnalyzing,
  handleAnalyzeImage,
  handleBrowseClick,
  handleNormalImageBrowseClick,
  fileInputRef,
  normalImageInputRef,
  handleImageUpload,
  handleNormalImageUpload
}) => {
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle>Upload Thermal Images</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <StepsIndicator currentStep={1} />

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="imagingType">Thermal Imaging Type</Label>
            <Select value={imagingType} onValueChange={setImagingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select imaging type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="switchboard">Switchboard Analysis</SelectItem>
                <SelectItem value="hvac">HVAC System</SelectItem>
                <SelectItem value="building">Building Envelope</SelectItem>
                <SelectItem value="mechanical">Mechanical Equipment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {imagingType === 'switchboard' && (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Insurance Compliance Required</AlertTitle>
                <AlertDescription>
                  Switchboard thermal imaging must comply with insurance requirements. Please ensure all required fields are completed.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="switchboardId">Switchboard ID/Reference</Label>
                  <Input id="switchboardId" placeholder="e.g. SB-2023-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installationDate">Installation Date</Label>
                  <Input id="installationDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastInspection">Last Inspection Date</Label>
                  <Input id="lastInspection" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loadPercentage">Load Percentage at Time of Imaging</Label>
                  <Input id="loadPercentage" type="number" placeholder="e.g. 75%" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Documentation</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="circuits" />
                    <label htmlFor="circuits" className="text-sm">Circuit diagrams available</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="previous" />
                    <label htmlFor="previous" className="text-sm">Previous inspection reports attached</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="maintenance" />
                    <label htmlFor="maintenance" className="text-sm">Maintenance records up to date</label>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="siteLocation">Site Location</Label>
            <Input 
              id="siteLocation" 
              placeholder="e.g. Building A, Floor 3" 
              defaultValue={siteName || ''} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imagingDate">Date of Imaging</Label>
              <Input id="imagingDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Input id="technician" placeholder="John Carpenter" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes/Comments</Label>
            <Textarea id="notes" placeholder="Add any additional information about this imaging session" rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thermal Image Upload */}
            <div className="space-y-2">
              <Label className="font-medium">Thermal Image</Label>
              <div className="border-2 border-dashed rounded-lg border-gray-300 p-4 text-center">
                {!uploadedImage ? (
                  <div className="flex flex-col items-center justify-center">
                    <FolderInput className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">Upload thermal image</p>
                    <p className="text-sm text-gray-500 mb-4">Supports .JPG, .PNG, .TIFF or thermal formats</p>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                    <Button variant="outline" type="button" onClick={handleBrowseClick}>
                      <FolderInput className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img 
                      src={uploadedImage} 
                      alt="Thermal" 
                      className="mx-auto max-h-64 rounded-md"
                    />
                    <div className="flex justify-center gap-3">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                      />
                      <Button variant="outline" size="sm" type="button" onClick={handleBrowseClick}>
                        <FolderInput className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        type="button" 
                        onClick={() => setUploadedImage(null)}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Normal Reference Image Upload */}
            <div className="space-y-2">
              <Label className="font-medium">Normal Reference Image</Label>
              <div className="border-2 border-dashed rounded-lg border-gray-300 p-4 text-center">
                {!normalImage ? (
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">Upload reference image</p>
                    <p className="text-sm text-gray-500 mb-4">Regular photo for visual reference</p>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleNormalImageUpload}
                      ref={normalImageInputRef}
                    />
                    <Button variant="outline" type="button" onClick={handleNormalImageBrowseClick}>
                      <FolderInput className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img 
                      src={normalImage} 
                      alt="Normal Reference" 
                      className="mx-auto max-h-64 rounded-md"
                    />
                    <div className="flex justify-center gap-3">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleNormalImageUpload}
                        ref={normalImageInputRef}
                      />
                      <Button variant="outline" size="sm" type="button" onClick={handleNormalImageBrowseClick}>
                        <FolderInput className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        type="button" 
                        onClick={() => setNormalImage(null)}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-between">
        <Button variant="outline">
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button 
          onClick={handleAnalyzeImage} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!uploadedImage || isAnalyzing}
        >
          {isAnalyzing ? (
            <>Analyzing Image...</>
          ) : (
            <>
              <ArrowRight className="h-4 w-4 ml-2 order-last" />
              Analyze Image
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
