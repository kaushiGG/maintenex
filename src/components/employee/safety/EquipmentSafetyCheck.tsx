import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmployeeDashboardContent from '../dashboard/EmployeeDashboardContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, ShieldCheck, Info, AlertTriangle, CheckCircle, ArrowLeft, Film, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import VideoPlayer from '@/components/ui/VideoPlayer';
import SafetyCheckHistory from './SafetyCheckHistory';

interface SafetyCheckItem {
  id: string;
  label: string;
  checked: boolean;
}

const EquipmentSafetyCheck = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [equipment, setEquipment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [issuesIdentified, setIssuesIdentified] = useState('');
  const [safetyCheckItems, setSafetyCheckItems] = useState<SafetyCheckItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Fetch equipment details
  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      if (!equipmentId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', equipmentId)
          .single();

        if (error) {
          throw error;
        }

        setEquipment(data);
        
        // Process safety instructions from equipment data
        if (data.safety_instructions && Array.isArray(data.safety_instructions)) {
          // Create safety check items from the saved instructions
          const savedInstructions = data.safety_instructions.map((instruction: string, index: number) => ({
            id: `item${index + 1}`,
            label: instruction,
            checked: false
          }));
          
          setSafetyCheckItems(savedInstructions);
          console.log('Loaded saved safety instructions:', savedInstructions.length);
        } else if (data.safety_instructions && typeof data.safety_instructions === 'string') {
          // Handle case where safety_instructions might be a JSON string
          try {
            const parsedInstructions = JSON.parse(data.safety_instructions);
            if (Array.isArray(parsedInstructions)) {
              const savedInstructions = parsedInstructions.map((instruction: string, index: number) => ({
                id: `item${index + 1}`,
                label: instruction,
                checked: false
              }));
              
              setSafetyCheckItems(savedInstructions);
              console.log('Loaded parsed safety instructions:', savedInstructions.length);
            }
          } catch (parseError) {
            console.error('Error parsing safety instructions:', parseError);
            // If parsing fails, use the string as a single instruction
            setSafetyCheckItems([{
              id: 'item1',
              label: data.safety_instructions as string,
              checked: false
            }]);
          }
        } else {
          console.warn('No safety instructions found for this equipment');
          // If no instructions are saved, show a message in the UI later
          setSafetyCheckItems([]);
        }
      } catch (error: any) {
        console.error('Error fetching equipment details:', error.message);
        toast.error('Failed to load equipment details');
        navigate('/employee-dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipmentDetails();
  }, [equipmentId, navigate]);

  const handleToggleCheckItem = (id: string) => {
    console.log(`Toggling item ${id}`);
    setSafetyCheckItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      console.log('Updated items:', updated);
      return updated;
    });
  };

  // Calculate derived state
  const allItemsChecked = safetyCheckItems.length > 0 && safetyCheckItems.every(item => item.checked);
  const anyIssues = !!issuesIdentified.trim();
  const hasNotes = !!notes.trim();

  // Debug logging when safety items change
  useEffect(() => {
    console.log('Safety check items:', safetyCheckItems);
    console.log('All items checked?', allItemsChecked);
  }, [safetyCheckItems]);

  const handleSubmitSafetyCheck = async () => {
    console.log('Submit function called, all items checked:', allItemsChecked);
    
    if (!allItemsChecked) {
      console.log('Cannot submit - not all items checked');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving safety check for equipment:', equipment?.id);
      // Get user's name from auth context if available
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();
        
      const userName = profileData 
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
        : 'Anonymous User';
      
      // Check if any issues were identified
      const status = 'performed'; // Always use 'performed' status regardless of issues
      
      // First, get the structure of the safety_checks table to see available columns
      const { data: tableInfo, error: tableError } = await supabase
        .from('safety_checks')
        .select('*')
        .limit(1);
      
      console.log('Table structure check:', { tableInfo, tableError });
      
      // Create a safe payload based on what we know should exist
      const checkPayload = {
        equipment_id: equipment.id,
        performed_by: user?.id,
        created_at: new Date().toISOString(),
        performed_date: new Date().toISOString(),
        notes: notes,
        status: status,
        issues: issuesIdentified || null,
        check_data: JSON.stringify(safetyCheckItems)
      };
      
      console.log('Saving with payload:', checkPayload);
        
      // Insert record into safety_checks table with required fields only
      const { data, error } = await supabase
        .from('safety_checks')
        .insert(checkPayload);
        
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save safety check: ${error.message}`);
      }
      
      // Update the equipment's last safety check date and ensure safety_frequency is set
      // This marks the equipment for future safety checks
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ 
          last_safety_check: new Date().toISOString(),
          safety_status: status,
          safety_notes: issuesIdentified || notes || 'No issues found.',
          safety_frequency: equipment.safety_frequency || 'monthly' // Ensure safety_frequency is set
        })
        .eq('id', equipment.id);
        
      if (updateError) throw updateError;
      
      toast.success('Safety check completed successfully!');
      
      // Navigate back to dashboard
      navigate('/employee-dashboard');
    } catch (error: any) {
      console.error('Error saving safety check:', error.message);
      toast.error('Failed to save safety check');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileSize = file.size / (1024 * 1024); // Size in MB
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }
    
    // Check file size (limit to 100MB)
    if (fileSize > 100) {
      toast.error('Video file size must be less than 100MB');
      return;
    }
    
    setVideoFile(file);
  };
  
  // Function to upload video to Supabase
  const uploadVideo = async () => {
    if (!videoFile || !equipment) return;
    
    setUploading(true);
    try {
      // Generate a unique filename
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${equipment.id}_training_video_${Date.now()}.${fileExt}`;
      
      // Log file info for debugging
      console.log(`Uploading video: ${fileName}, type: ${videoFile.type}, size: ${(videoFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('equipment-videos')
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: videoFile.type
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('equipment-videos')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      // Log the URL for debugging
      console.log('Video uploaded successfully, URL:', urlData.publicUrl);
      
      // Update equipment record with video info
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ 
          training_video_url: urlData.publicUrl,
          training_video_name: videoFile.name
        })
        .eq('id', equipment.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setEquipment({
        ...equipment,
        training_video_url: urlData.publicUrl,
        training_video_name: videoFile.name
      });
      
      setVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      toast.success('Training video uploaded successfully. Refreshing page...');
      
      // Reload the page to ensure fresh video loading
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <EmployeeDashboardContent
      handleLogout={handleLogout}
      showBackButton={true}
      backTo="/employee-dashboard"
      backText="Back to Dashboard"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : !equipment ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Equipment Not Found</h2>
            <p className="text-gray-600 mb-4">The equipment you're looking for could not be found.</p>
            <Button onClick={() => navigate('/employee-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                Equipment Safety Check
              </CardTitle>
              <CardDescription>
                Performing safety check for {equipment.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Equipment Name</Label>
                    <div className="text-lg font-medium">{equipment.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Model</Label>
                    <div className="text-lg font-medium">{equipment.model || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
                    <div>{equipment.serial_number || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <div>{equipment.location || 'N/A'}</div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center">Loading safety check information...</div>
                ) : (
                  <>
                    {/* Safety Instructions - Renamed from Safety Check Items */}
                    <div className="border rounded-md p-4 mb-6">
                      <h3 className="font-medium text-lg mb-4 flex items-center">
                        <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
                        Safety Instructions
                      </h3>
                      <div className="text-sm text-gray-600 mb-4">
                        Please verify each safety item by checking the box
                      </div>
                      {safetyCheckItems.length > 0 ? (
                        <div className="space-y-4">
                          {safetyCheckItems.map((item) => (
                            <div key={item.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                              <Checkbox
                                id={item.id}
                                checked={item.checked}
                                onCheckedChange={() => handleToggleCheckItem(item.id)}
                              />
                              <Label
                                htmlFor={item.id}
                                className="text-sm cursor-pointer font-normal leading-tight"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-amber-700 bg-amber-50 rounded-md">
                          <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                          <p>No safety instructions have been defined for this equipment.</p>
                          <p className="text-sm mt-1">Please contact your safety manager to set up safety check requirements.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Training Video Section - Now below safety checks */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <Film className="h-5 w-5 text-blue-500 mr-2" />
                    Training Video
                  </h3>
                  
                  {equipment.training_video_url ? (
                    <VideoPlayer 
                      videoUrl={equipment.training_video_url}
                      videoName={equipment.training_video_name || 'Training video'}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No training video is available for this equipment.</p>
                      <div className="space-y-3">
                        <div>
                          <Input 
                            type="file" 
                            accept="video/*"
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                            className="max-w-md mx-auto"
                          />
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Maximum file size: 100MB. Supported formats: MP4, MOV, AVI
                          </p>
                        </div>
                        {videoFile && (
                          <Button
                            onClick={uploadVideo}
                            disabled={uploading}
                            className="mx-auto flex items-center gap-2"
                          >
                            {uploading ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-4 w-4" />
                                Upload Video
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="issues">Issues Identified</Label>
                  <Textarea
                    id="issues"
                    placeholder="Describe any issues or safety concerns (if none, leave blank)"
                    className="min-h-[100px] mt-1"
                    value={issuesIdentified}
                    onChange={(e) => setIssuesIdentified(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional observations or notes"
                    className="min-h-[100px] mt-1"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                variant="outline"
                onClick={() => navigate('/employee-dashboard')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSafetyCheck}
                disabled={!allItemsChecked || isSaving}
                className={`min-w-[150px] ${!allItemsChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Safety Check
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {!allItemsChecked && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Incomplete Safety Check</h3>
                <p className="text-amber-700 text-sm">
                  All safety check items must be checked before submitting.
                </p>
              </div>
            </div>
          )}

          {/* Display safety check history */}
          {equipment?.id && (
            <div className="mb-6">
              <SafetyCheckHistory equipmentId={equipment.id} />
            </div>
          )}
        </>
      )}
    </EmployeeDashboardContent>
  );
};

export default EquipmentSafetyCheck; 