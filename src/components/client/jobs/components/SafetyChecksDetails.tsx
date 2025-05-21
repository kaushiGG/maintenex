import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle2, Loader2, ExternalLink, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SafetyChecksDetailsProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  formData: {
    safetyFrequency?: string;
    safetyInstructions?: string;
    safetyOfficer?: string;
  };
  onVideoUpload?: (file: File | null) => void;
  equipmentId?: string;
}

interface EquipmentSafetyData {
  safety_frequency: string | null;
  safety_instructions: string | null;
  safety_officer: string | null;
  training_video_url: string | null;
  training_video_name: string | null;
}

const SafetyChecksDetails: React.FC<SafetyChecksDetailsProps> = ({
  onInputChange,
  onSelectChange,
  formData,
  onVideoUpload,
  equipmentId
}) => {
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [equipmentName, setEquipmentName] = useState<string | null>(null);
  
  // Local state for safety data to display when formData is empty
  const [localSafetyData, setLocalSafetyData] = useState<{
    safetyFrequency: string | null;
    safetyInstructions: string | null;
    safetyOfficer: string | null;
  }>({
    safetyFrequency: null,
    safetyInstructions: null,
    safetyOfficer: null
  });

  // Fetch safety data when equipment changes
  useEffect(() => {
    if (equipmentId) {
      fetchSafetyDataForEquipment(equipmentId);
    } else {
      // Reset when no equipment selected
      setDataLoaded(false);
      setVideoUrl(null);
      setVideoName(null);
      setLocalSafetyData({
        safetyFrequency: null,
        safetyInstructions: null,
        safetyOfficer: null
      });
    }
  }, [equipmentId]);

  const fetchSafetyDataForEquipment = async (equipId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching safety data for equipment:', equipId);
      
      const { data, error } = await supabase
        .from('equipment')
        .select('name, safety_frequency, safety_instructions, safety_officer, training_video_url, training_video_name')
        .eq('id', equipId)
        .single();
      
      if (error) {
        console.error('Error fetching equipment safety data:', error);
        return;
      }
      
      console.log('Equipment safety data:', data);
      
      if (data) {
        // Only update if we have some safety data to avoid overwriting user inputs
        const safetyData = data as unknown as (EquipmentSafetyData & { name: string });
        
        setEquipmentName(safetyData.name);
        
        // Store locally for display
        setLocalSafetyData({
          safetyFrequency: safetyData.safety_frequency,
          safetyInstructions: safetyData.safety_instructions,
          safetyOfficer: safetyData.safety_officer
        });
        
        // Fill the form with equipment safety data
        if (safetyData.safety_frequency) {
          onSelectChange('safetyFrequency', safetyData.safety_frequency);
        }
        
        // Create synthetic input events for text fields
        if (safetyData.safety_instructions) {
          const event = {
            target: {
              name: 'safetyInstructions',
              value: safetyData.safety_instructions
            }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onInputChange(event);
        }
        
        if (safetyData.safety_officer) {
          const event = {
            target: {
              name: 'safetyOfficer',
              value: safetyData.safety_officer
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(event);
        }
        
        // Set video URL and name for display
        if (safetyData.training_video_url) {
          setVideoUrl(safetyData.training_video_url);
          setVideoName(safetyData.training_video_name);
          setUploadComplete(true);
          
          // Notify about the existing video
          toast.info('Training video found for this equipment');
        }
        
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Unexpected error fetching safety data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setTrainingVideo(file);
      
      // Pass the file to the parent component
      if (onVideoUpload) {
        onVideoUpload(file);
      }
      
      // Clear existing video URL
      setVideoUrl(null);
      
      // Simulate upload completion
      setTimeout(() => {
        setUploadComplete(true);
      }, 1000);
    }
  };

  const getFrequencyLabel = (value: string) => {
    const options = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'biannually': 'Bi-annually',
      'annually': 'Annually',
      'custom': 'Custom'
    };
    return options[value as keyof typeof options] || value;
  };

  // Get the display value - use formData if available, otherwise use local state
  const getDisplayValue = (formField: string | undefined, localField: string | null) => {
    return formField || localField || '';
  };

  return (
    <Card className="mt-4 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-blue-800">Safety Checks Details</h4>
          {isLoading && (
            <div className="flex items-center text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading equipment safety data...
            </div>
          )}
        </div>
        
        {dataLoaded && equipmentId && (
          <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Using safety data from:</strong> {equipmentName || 'Equipment'}
              </p>
              <p className="text-xs text-blue-700">
                The safety check details from the equipment record will be referenced during job execution. No need to modify these fields.
              </p>
            </div>
          </div>
        )}
        
        {/* Frequency selection */}
        <div className="mb-4">
          <Label htmlFor="safetyFrequency" className="flex justify-between items-center mb-2">
            <span>How often is this safety check performed?</span>
            {dataLoaded && <span className="text-xs text-gray-500">From equipment record</span>}
          </Label>
          
          {dataLoaded ? (
            <div className="border p-2 rounded bg-gray-50">
              <p className="text-md">{getFrequencyLabel(getDisplayValue(formData.safetyFrequency, localSafetyData.safetyFrequency))}</p>
            </div>
          ) : (
            <Select 
              value={formData.safetyFrequency || ''} 
              onValueChange={(value) => onSelectChange('safetyFrequency', value)}
            >
              <SelectTrigger id="safetyFrequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="biannually">Bi-annually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Instructions field */}
        <div className="mb-4">
          <Label htmlFor="safetyInstructions" className="flex justify-between items-center mb-2">
            <span>Safety Check Instructions</span>
            {dataLoaded && <span className="text-xs text-gray-500">From equipment record</span>}
          </Label>
          
          {dataLoaded ? (
            <div className="border p-3 rounded bg-gray-50 whitespace-pre-wrap min-h-[100px]">
              {getDisplayValue(formData.safetyInstructions, localSafetyData.safetyInstructions) || 'No instructions provided.'}
            </div>
          ) : (
            <Textarea
              id="safetyInstructions"
              name="safetyInstructions"
              placeholder="Enter detailed instructions for performing this safety check..."
              rows={4}
              value={formData.safetyInstructions || ''}
              onChange={onInputChange}
              className="resize-none"
            />
          )}
        </div>
        
        {/* Authorized officer */}
        <div className="mb-4">
          <Label htmlFor="safetyOfficer" className="flex justify-between items-center mb-2">
            <span>Authorized Safety Officer</span>
            {dataLoaded && <span className="text-xs text-gray-500">From equipment record</span>}
          </Label>
          
          {dataLoaded ? (
            <div className="border p-2 rounded bg-gray-50">
              <p className="text-md">{getDisplayValue(formData.safetyOfficer, localSafetyData.safetyOfficer) || 'No officer specified'}</p>
            </div>
          ) : (
            <Input
              id="safetyOfficer"
              name="safetyOfficer"
              placeholder="Enter name of authorized safety officer"
              value={formData.safetyOfficer || ''}
              onChange={onInputChange}
            />
          )}
        </div>
        
        {/* Training video display */}
        <div className="mb-4">
          <Label htmlFor="trainingVideo" className="flex justify-between items-center mb-2">
            <span>Training Video</span>
            {dataLoaded && videoUrl && <span className="text-xs text-gray-500">From equipment record</span>}
          </Label>
          
          {/* Existing video from equipment */}
          {videoUrl && dataLoaded && (
            <div className="mb-4 border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{videoName || 'Training Video'}</p>
                  <p className="text-sm text-gray-500 mb-2">From equipment record</p>
                </div>
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </div>
              {videoUrl.match(/\.(mp4|webm|ogg)$/) && (
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full mt-2 rounded-md" 
                  style={{ maxHeight: '200px' }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
          
          {/* Upload new video section, only if no data loaded */}
          {!dataLoaded && (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              {!uploadComplete ? (
                <label htmlFor="trainingVideo" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload training video</p>
                  <p className="text-xs text-gray-500">MP4, MOV, or AVI (max. 100MB)</p>
                  <input
                    type="file"
                    id="trainingVideo"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  {trainingVideo && <p className="text-sm font-medium mt-2">{trainingVideo.name}</p>}
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-green-600">Upload complete</p>
                  {trainingVideo && <p className="text-xs text-gray-500 mt-1">{trainingVideo.name}</p>}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setUploadComplete(false)}
                  >
                    Replace
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyChecksDetails; 