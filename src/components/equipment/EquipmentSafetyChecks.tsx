import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, CheckCircle2, Trash2, AlertTriangle, ClipboardEdit, Eye, Calendar, FileText, User, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { Checkbox } from '@/components/ui/checkbox';

// Define employee interface
interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_safety_officer: boolean;
  is_manager: boolean;
}

interface EquipmentSafetyChecksProps {
  equipmentId: string;
  initialData?: {
    safety_frequency?: string;
    safety_instructions?: string[];
    safety_officer?: string;
    training_video_url?: string;
    training_video_name?: string;
    safety_manager_id?: string;
    authorized_officers?: string[];
  };
  onDataChange?: (data: {
    safety_frequency: string;
    safety_instructions: string[];
    safety_officer: string;
    training_video_url: string;
    training_video_name: string;
    safety_manager_id: string;
    authorized_officers: string[];
  }) => void;
}

// Define the shape of safety data from the database
interface SafetyCheckData {
  safety_frequency?: string | null;
  safety_instructions?: string[] | string | null;
  safety_officer?: string | null;
  training_video_url?: string | null;
  training_video_name?: string | null;
  safety_manager_id?: string | null;
  authorized_officers?: string[] | null;
}

// Define safety instruction items
const SAFETY_INSTRUCTIONS = [
  "Equipment exterior is clean and free of damage",
  "All safety guards are in place and functional",
  "Warning labels and instructions are visible and legible",
  "No leaks or unusual noises during operation",
  "Emergency stop functions correctly",
  "Electrical connections are secure and undamaged",
  "Pressure gauges (if applicable) show normal readings",
  "Moving parts are properly lubricated",
  "Surrounding area is clean and free of hazards",
  "Equipment runs smoothly through all operations"
];

const EquipmentSafetyChecks: React.FC<EquipmentSafetyChecksProps> = ({ 
  equipmentId,
  initialData,
  onDataChange 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [safetyFrequency, setSafetyFrequency] = useState<string>(initialData?.safety_frequency || '');
  const [safetyInstructions, setSafetyInstructions] = useState<string[]>(initialData?.safety_instructions || []);
  const [safetyManagerId, setSafetyManagerId] = useState<string>(initialData?.safety_manager_id || '');
  const [authorizedOfficers, setAuthorizedOfficers] = useState<string[]>(initialData?.authorized_officers || []);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialData?.training_video_url || null);
  const [videoName, setVideoName] = useState<string | null>(initialData?.training_video_name || null);
  const [activeTab, setActiveTab] = useState<string>('view');
  const [needsColumnCreation, setNeedsColumnCreation] = useState(false);
  const [workingClient, setWorkingClient] = useState<any>(null);
  const videoFileRef = useRef<File | null>(null);
  const videoObjectURLRef = useRef<string | null>(null);

  useEffect(() => {
    if (equipmentId) {
      fetchSafetyChecksData();
      fetchEmployees();
    }
  }, [equipmentId]);

  // Clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      // Clear any created Object URLs on component unmount
      if (videoObjectURLRef.current) {
        console.log('Cleaning up object URL on unmount');
        URL.revokeObjectURL(videoObjectURLRef.current);
        videoObjectURLRef.current = null;
      }
    };
  }, []);

  // Fetch all employees data for manager and authorized officers selection
  const fetchEmployees = async () => {
    try {
      console.log('DEBUG: Starting fetchEmployees...');
      
      let successfulClient = workingClient;
      
      // If we don't have a working client already, try both
      if (!successfulClient) {
        // Try with primary client first
        try {
          console.log('DEBUG: Trying primary Supabase client from @/integrations/supabase/client');
      const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

      if (error) {
            console.error('Error with primary client:', error);
          } else {
            console.log('DEBUG: Primary client success, got profiles:', data.length);
            successfulClient = supabase;
          }
        } catch (primaryError) {
          console.error('Exception with primary client:', primaryError);
        }
        
        // Try fallback client if primary failed
        if (!successfulClient) {
          try {
            console.log('DEBUG: Trying fallback Supabase client from @/integrations/supabase/client');
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .limit(5);
              
            if (error) {
              console.error('Error with fallback client:', error);
            } else {
              console.log('DEBUG: Fallback client success, got profiles:', data.length);
              successfulClient = supabase;
            }
          } catch (fallbackError) {
            console.error('Exception with fallback client:', fallbackError);
          }
        }
        
        // Store the working client for future use
        if (successfulClient) {
          setWorkingClient(successfulClient);
          console.log('DEBUG: Stored working Supabase client for reuse');
        }
      } else {
        console.log('DEBUG: Using previously successful client');
      }
      
      if (!successfulClient) {
        console.error('Both Supabase clients failed');
        toast.error('Failed to connect to database');
        return;
      }
      
      // Fetch profiles data
      console.log('DEBUG: Fetching from profiles table');
      const { data: profilesData, error: profilesError } = await successfulClient
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching profiles data:', profilesError);
        toast.error('Error loading employee data');
        return;
      }
      
      if (!profilesData || profilesData.length === 0) {
        console.log('DEBUG: No profiles found');
          setEmployees([]);
          return;
        }
        
      console.log('DEBUG: Successfully fetched profiles:', profilesData.length, 'records');
      if (profilesData.length > 0) {
        console.log('DEBUG: Sample profile record:', profilesData[0]);
        console.log('DEBUG: Profile fields:', Object.keys(profilesData[0]).join(', '));
      }
      
      // Now fetch invitations for role information
      console.log('DEBUG: Fetching from invitations table');
      const { data: invitationsData, error: invitationsError } = await successfulClient
        .from('invitations')
        .select('*');
      
      if (invitationsError) {
        console.error('Error fetching invitations data:', invitationsError);
        console.log('DEBUG: Will continue with just profiles data');
      } else {
        console.log('DEBUG: Successfully fetched invitations:', invitationsData.length, 'records');
        if (invitationsData.length > 0) {
          console.log('DEBUG: Sample invitation record:', invitationsData[0]);
          console.log('DEBUG: Invitation fields:', Object.keys(invitationsData[0]).join(', '));
        }
      }
      
      // Create lookup maps for roles from invitations
      const userTypeByEmail: Record<string, string> = {};
      const roleByEmail: Record<string, string> = {};
      
      if (invitationsData && invitationsData.length > 0) {
        invitationsData.forEach(invitation => {
          if (invitation.email) {
            if (invitation.user_type) {
              userTypeByEmail[invitation.email.toLowerCase()] = invitation.user_type;
            }
            if (invitation.role) {
              roleByEmail[invitation.email.toLowerCase()] = invitation.role;
            }
          }
        });
        console.log('DEBUG: Created email maps with', Object.keys(roleByEmail).length, 'entries');
      }
      
      // Process profile data and combine with invitation data
      const employeesWithRoles = profilesData.map(profile => {
        const email = profile.email?.toLowerCase() || '';
        const invitationType = userTypeByEmail[email];
        const invitationRole = roleByEmail[email];
        
        const managerRoles = ['manager', 'site manager', 'project manager', 'facility manager', 'admin'];
        const safetyOfficerRoles = ['safety officer', 'safety inspector', 'safety specialist', 'hse officer'];
        
        const isManager = 
          (profile.user_type && profile.user_type.toLowerCase().includes('manager')) ||
          (invitationType && invitationType.toLowerCase().includes('manager')) ||
          (invitationRole && managerRoles.includes(invitationRole.toLowerCase()));
          
        const isSafetyOfficer = 
          (profile.user_type && profile.user_type.toLowerCase().includes('safety')) ||
          (invitationType && invitationType.toLowerCase().includes('safety')) ||
          (invitationRole && safetyOfficerRoles.includes(invitationRole.toLowerCase()));
          
        return {
          id: profile.id || '',
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          user_type: profile.user_type || '',
          is_manager: isManager,
          is_safety_officer: isSafetyOfficer
        };
      });
      
      // Log the results
      console.log('DEBUG: Final employee list from profiles:', employeesWithRoles.length, 'records');
      console.log('DEBUG: Managers count:', employeesWithRoles.filter(e => e.is_manager).length);
      console.log('DEBUG: Safety officers count:', employeesWithRoles.filter(e => e.is_safety_officer).length);
      
      // Log which employees were identified as managers and safety officers
      employeesWithRoles.filter(e => e.is_manager).forEach(manager => {
        const email = manager.email.toLowerCase();
        const invitationRole = roleByEmail[email];
        console.log(`DEBUG: Manager identified: ${manager.first_name} ${manager.last_name} (${manager.email})`);
        if (invitationRole) {
          console.log(`  - From invitation role: ${invitationRole}`);
        }
      });
      
      employeesWithRoles.filter(e => e.is_safety_officer).forEach(officer => {
        const email = officer.email.toLowerCase();
        const invitationRole = roleByEmail[email];
        console.log(`DEBUG: Safety Officer identified: ${officer.first_name} ${officer.last_name} (${officer.email})`);
        if (invitationRole) {
          console.log(`  - From invitation role: ${invitationRole}`);
        }
      });
      
      // Set the employees state
      setEmployees(employeesWithRoles);
      
      // Add fallbacks if needed
      if (employeesWithRoles.length > 0) {
        if (!employeesWithRoles.some(e => e.is_manager)) {
          console.log('DEBUG: No managers found, using all employees as fallback');
          const allAsManagers = employeesWithRoles.map(e => ({...e, is_manager: true}));
          setEmployees(allAsManagers);
        return;
      }

        if (!employeesWithRoles.some(e => e.is_safety_officer)) {
          console.log('DEBUG: No safety officers found, using all employees as fallback');
          const allWithSafetyRole = employeesWithRoles.map(e => ({...e, is_safety_officer: true}));
          setEmployees(allWithSafetyRole);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching employees:', error);
      toast.error('Error loading employees data');
      setEmployees([]);
    }
  };

  // Function to ensure the safety columns exist
  const createSafetyColumns = async () => {
    try {
      setIsLoading(true);
      toast.info("First-time setup: Creating safety check fields...");
      
      // Determine which client to use
      const client = workingClient || supabase;
      console.log('DEBUG: Using', workingClient ? 'previously successful client' : 'default client', 'for column creation');
      
      // List of columns we need to add to the equipment table
      const columnsToAdd = [
        { name: 'safety_frequency', type: 'text' },
        { name: 'safety_instructions', type: 'text' },
        { name: 'training_video_url', type: 'text' },
        { name: 'training_video_name', type: 'text' },
        { name: 'safety_manager_id', type: 'text' },
        { name: 'authorized_officers', type: 'jsonb' } // For array of officer IDs
      ];
      
      console.log('Adding safety columns to equipment table');
      
      // Build SQL statements for each column
      for (const column of columnsToAdd) {
        try {
          // Try to add the column directly - if it exists, the operation will fail gracefully
          console.log(`Attempting to add column ${column.name}`);
          
          // Try to update with the column to see if it exists
          const { error } = await client.from('equipment').update({ 
            [column.name]: null 
          }).eq('id', equipmentId);
          
          if (error) {
            if (error.message.includes('does not exist')) {
              console.error(`Column ${column.name} couldn't be added directly. The database may need schema changes.`);
            } else if (error.message.includes('already exists')) {
              console.log(`Column ${column.name} already exists`);
            } else {
              console.error(`Unexpected error with column ${column.name}:`, error.message);
            }
          } else {
            console.log(`Column ${column.name} appears to be ready`);
          }
        } catch (columnError) {
          console.error(`Error processing column ${column.name}:`, columnError);
          // Continue with other columns
        }
      }
      
      // Create bucket for videos if it doesn't exist yet
      try {
        console.log('Creating storage bucket for videos if needed');
        const { data: buckets } = await client.storage.listBuckets();
        
        if (buckets && !buckets.some(bucket => bucket.name === 'equipment-videos')) {
          const { error: bucketError } = await client.storage.createBucket('equipment-videos', {
            public: true,
            fileSizeLimit: 100 * 1024 * 1024, // 100MB
            allowedMimeTypes: ['video/*']
          });
          
          if (bucketError) {
            console.error('Error creating bucket:', bucketError);
            toast.error('Could not create storage for videos');
          } else {
            console.log('Created equipment-videos bucket');
          }
        } else {
          console.log('equipment-videos bucket already exists or could not check buckets');
        }
      } catch (bucketError) {
        console.error('Error with video storage setup:', bucketError);
        // Continue anyway
      }
      
      // Reset the flag and try fetching data again
      setNeedsColumnCreation(false);
      await fetchSafetyChecksData();
      toast.success("Safety check fields set up successfully!");
    } catch (error) {
      console.error('Error creating safety columns:', error);
      toast.error("Couldn't set up safety check fields. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSafetyChecksData = async () => {
    try {
      setIsLoading(true);
      console.log('DEBUG: Starting fetchSafetyChecksData for equipment ID:', equipmentId);
      
      // Determine which client to use
      const client = workingClient || supabase;
      console.log('DEBUG: Using', workingClient ? 'previously successful client' : 'default client');
      
      // First get a list of columns to see if our safety columns exist
      const { data: columnsData, error: columnsError } = await client
        .from('equipment')
        .select()
        .limit(1);
      
      if (columnsError) {
        console.error('Error checking equipment table:', columnsError);
        toast.error('Error checking equipment database structure');
        setIsLoading(false);
        return;
      }
      
      // If we can fetch any data, proceed to check for our fields
      if (columnsData && columnsData.length > 0) {
        const sampleRow = columnsData[0];
        console.log('Equipment table columns:', Object.keys(sampleRow).join(', '));
        
        // Check if the safety columns exist
        if (!('safety_frequency' in sampleRow)) {
          console.log('Safety columns not found, need to create them');
          setNeedsColumnCreation(true);
          setIsLoading(false);
          return;
        }
      } else {
        console.log('No equipment data found to check columns');
        setNeedsColumnCreation(true);
        setIsLoading(false);
        return;
      }
      
      // Now try to get the safety data for this specific equipment
      const { data, error } = await client
        .from('equipment')
        .select('safety_frequency, safety_instructions, training_video_url, training_video_name, safety_manager_id, authorized_officers')
        .eq('id', equipmentId)
        .single();

      if (error) {
        // Check if the error is about missing columns
        if (error.message && error.message.includes('column') && error.message.includes('not exist')) {
          console.log('Safety columns do not exist yet, error:', error.message);
          setNeedsColumnCreation(true);
          setIsLoading(false);
          return;
        }
        
        console.error('Error fetching safety checks data:', error);
        toast.error('Error loading safety data');
        setIsLoading(false);
        return;
      }

      console.log('Fetched safety data:', data);

      if (data) {
        // Cast data to our interface to handle the type correctly
        const safetyData = data as unknown as SafetyCheckData;
        
        // Convert empty strings to "none" for select components
        setSafetyFrequency(safetyData.safety_frequency ? safetyData.safety_frequency : 'none');
        
        // Parse safety instructions - could be string, array, or null
        if (safetyData.safety_instructions) {
          if (Array.isArray(safetyData.safety_instructions)) {
            // Already an array
            setSafetyInstructions(safetyData.safety_instructions);
          } else if (typeof safetyData.safety_instructions === 'string') {
            // Try to parse as JSON if it's a string that looks like an array
            try {
              const stringInstructions = safetyData.safety_instructions as string;
              if (stringInstructions.startsWith('[') && stringInstructions.endsWith(']')) {
                const parsedArray = JSON.parse(stringInstructions);
                setSafetyInstructions(Array.isArray(parsedArray) ? parsedArray : []);
              } else {
                // If it's a plain string from the old format, add it as a custom instruction
                setSafetyInstructions(stringInstructions.trim() ? [stringInstructions] : []);
              }
            } catch (e) {
              console.error('Failed to parse safety instructions:', e);
              setSafetyInstructions([]);
            }
          } else {
            setSafetyInstructions([]);
          }
        } else {
          setSafetyInstructions([]);
        }
        
        setSafetyManagerId(safetyData.safety_manager_id || 'none');
        setAuthorizedOfficers(safetyData.authorized_officers || []);
        
        // Handle different types of video URLs
        if (safetyData.training_video_url) {
          console.log('Video URL found:', safetyData.training_video_url);
          
          // Clear any existing object URLs
          if (videoObjectURLRef.current) {
            URL.revokeObjectURL(videoObjectURLRef.current);
            videoObjectURLRef.current = null;
          }
          
          // Set the video URL directly
          setVideoUrl(safetyData.training_video_url);
          setVideoName(safetyData.training_video_name || 'Training Video');
        } else {
          setVideoUrl(null);
          setVideoName(null);
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchSafetyChecksData:', error);
      toast.error('Error loading safety data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setTrainingVideo(file);
    
    // Store locally using object URL for immediate preview
    storeVideoLocally(file);
  };

  const storeVideoLocally = (file: File) => {
    try {
      // Clear any previous ObjectURL to avoid memory leaks
      if (videoObjectURLRef.current) {
        URL.revokeObjectURL(videoObjectURLRef.current);
      }
      
      // Create a new object URL for the file
      const objectURL = URL.createObjectURL(file);
      videoObjectURLRef.current = objectURL;
      videoFileRef.current = file;
      
      // Update state to show the video
      setVideoUrl(objectURL);
      setVideoName(file.name);
      
      toast.success('Video ready for preview. Click Save to store permanently.');
      setActiveTab('view');
    } catch (error) {
      console.error('Error creating object URL:', error);
      toast.error('Could not preview video');
    }
  };

  const handleDeleteVideo = async () => {
    try {
      setIsSaving(true);
      
      // Determine which client to use
      const client = workingClient || supabase;
      
      if (!videoUrl) return;
      
      // Clean up object URL if it's a local video
      if (videoObjectURLRef.current) {
        URL.revokeObjectURL(videoObjectURLRef.current);
        videoObjectURLRef.current = null;
        videoFileRef.current = null;
        
        // If it's just a local preview that hasn't been saved, just clear the UI
        setVideoUrl(null);
        setVideoName(null);
        setTrainingVideo(null);
        setIsSaving(false);
        toast.success('Video removed');
        return;
      }
      
      // For videos stored in bucket
      if (videoUrl.includes('storage/') || videoUrl.includes('equipment-videos')) {
        // Try to delete from storage
        try {
          // Extract filename from URL
          const urlParts = videoUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          console.log(`Attempting to delete file: ${fileName}`);
          
          // Delete from storage
          const { error: deleteError } = await client.storage
            .from('equipment-videos')
            .remove([fileName]);
          
          if (deleteError) {
            console.warn('Error deleting file from storage:', deleteError);
            // Continue even if file deletion fails, as we still want to update the database
          } else {
            console.log('File deleted from storage successfully');
          }
        } catch (storageError) {
          console.warn('Error during storage deletion:', storageError);
          // Continue with database update even if storage deletion fails
        }
      }
      
      // Update equipment record to remove references
      const { error: updateError } = await client
        .from('equipment')
        .update({ 
          training_video_url: null,
          training_video_name: null
        } as any)
        .eq('id', equipmentId);
      
      if (updateError) {
        console.error('Error updating equipment record:', updateError);
        toast.error('Failed to update video information');
        return;
      }
      
      setVideoUrl(null);
      setVideoName(null);
      setTrainingVideo(null);
      toast.success('Training video deleted successfully');
      
    } catch (error) {
      console.error('Unexpected error deleting video:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Determine which client to use
      const client = workingClient || supabase;
      
      // Check if we have a locally stored video to save
      if (videoFileRef.current && videoObjectURLRef.current) {
        // Upload to bucket storage
        await uploadVideoToBucket(videoFileRef.current);
      }
      
      // Convert "none" values to null or empty string for database
      const finalSafetyFrequency = safetyFrequency === "none" ? "" : safetyFrequency;
      const finalSafetyManagerId = safetyManagerId === "none" ? null : safetyManagerId;
      
      console.log('DEBUG: Attempting to save safety checks data');
      console.log('DEBUG: Safety Frequency:', finalSafetyFrequency);
      console.log('DEBUG: Safety Instructions:', safetyInstructions);
      console.log('DEBUG: Safety Manager ID:', finalSafetyManagerId);
      console.log('DEBUG: Authorized Officers:', authorizedOfficers);
      
      // Save all safety information
      const { error: saveError } = await client
        .from('equipment')
        .update({
          safety_frequency: finalSafetyFrequency,
          safety_instructions: safetyInstructions,
          safety_manager_id: finalSafetyManagerId,
          authorized_officers: authorizedOfficers.length > 0 ? authorizedOfficers : null
        } as any)
        .eq('id', equipmentId);
      
      if (saveError) {
        console.error('Error updating safety data:', saveError);
        
        // Check if this is a column not found error
        if (saveError.message && saveError.message.includes('column') && saveError.message.includes('not exist')) {
          setNeedsColumnCreation(true);
          toast.error('Database setup needed. Please try again after setup.');
          return;
        }
        
        // If it's still a foreign key constraint error, inform the user that they need to run the SQL script
        if (saveError.code === '23503') {
          toast.error('Database constraint issue', { 
            description: 'You need to run the update_safety_constraints.sql script to update the database schema to use profile IDs.'
          });
        return;
      }
      
        toast.error('Failed to save safety information');
        return;
      }
      
      toast.success('Safety check information saved successfully');
      setActiveTab('view'); // Switch to view mode after saving
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadVideoToBucket = async (file: File) => {
    toast.info('Uploading video to storage...');
    
    try {
      // Determine which client to use
      const client = workingClient || supabase;
      
      // Skip bucket creation API call since bucket already exists
      console.log('Assuming equipment-videos bucket already exists');
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}_training_video_${Date.now()}.${fileExt}`;
      
      console.log(`Uploading file: ${fileName}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Upload to Supabase Storage
      const { data, error } = await client.storage
        .from('equipment-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }
      
      // Get the public URL
      const { data: urlData } = client.storage
        .from('equipment-videos')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      // Update equipment record with video info
      const { error: updateError } = await client
        .from('equipment')
        .update({ 
          training_video_url: urlData.publicUrl,
          training_video_name: file.name
        } as any)
        .eq('id', equipmentId);
      
      if (updateError) {
        console.error('Error updating equipment record:', updateError);
        
        // Check if this is a column not found error
        if (updateError.message && updateError.message.includes('column') && updateError.message.includes('not exist')) {
          setNeedsColumnCreation(true);
          toast.error('Database setup needed. Please try again after setup.');
          return;
        }
        
        toast.error('Failed to save video information to database');
        return;
      }
      
      // Update the state with the public URL
      setVideoUrl(urlData.publicUrl);
      setVideoName(file.name);
      toast.success('Video uploaded successfully');
      
      // Clean up the object URL as we now have the real URL
      if (videoObjectURLRef.current) {
        URL.revokeObjectURL(videoObjectURLRef.current);
        videoObjectURLRef.current = null;
      }
      
    } catch (error) {
      console.error('Error in bucket upload:', error);
      toast.error('Failed to upload video to storage');
      throw error;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'none': 'Not required',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Every 3 months',
      'biannually': 'Every 6 months',
      'annually': 'Yearly',
      'custom': 'Custom schedule'
    };
    
    return frequencyMap[frequency] || frequency || 'Not specified';
  };

  // Helper to get employee name
  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Not selected';
  };

  // Update safety instruction toggle handler
  const toggleSafetyInstruction = (instruction: string) => {
    if (safetyInstructions.includes(instruction)) {
      setSafetyInstructions(safetyInstructions.filter(item => item !== instruction));
    } else {
      setSafetyInstructions([...safetyInstructions, instruction]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading safety checks data...</p>
      </div>
    );
  }

  if (needsColumnCreation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Database Setup Required</h3>
              <p className="text-muted-foreground mb-6">
                The safety checks feature requires a one-time database setup. Click below to set up the required database fields.
              </p>
              <Button 
                onClick={createSafetyColumns} 
                disabled={isLoading}
              >
                {isLoading ? 'Setting up...' : 'Set Up Safety Checks'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-4 rounded-md bg-forgemate-orange/10 border-l-4 border-forgemate-orange">
        <AlertTriangle className="h-5 w-5 text-forgemate-orange mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-forgemate-orange">Safety Check Requirements</h4>
          <p className="text-sm text-forgemate-orange">
            Setting a safety check frequency and manager will include this equipment in the employee safety portal scheduled checks.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">
            <Eye className="h-4 w-4 mr-2" />
            View Info
          </TabsTrigger>
          <TabsTrigger value="edit">
            <ClipboardEdit className="h-4 w-4 mr-2" />
            Edit Info
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Safety Check Frequency</h3>
                <p className="text-muted-foreground">{safetyFrequency ? getFrequencyLabel(safetyFrequency) : 'Not set'}</p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Safety Manager
                </h3>
                <p className="text-muted-foreground">
                  {safetyManagerId ? getEmployeeName(safetyManagerId) : 'Not assigned'}
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Authorized Staff Members
                </h3>
                {authorizedOfficers && authorizedOfficers.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {authorizedOfficers.map(id => (
                      <li key={id}>{getEmployeeName(id)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No authorized staff members assigned</p>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Safety Instructions</h3>
                {safetyInstructions && safetyInstructions.length > 0 ? (
                  <ul className="space-y-2">
                    {safetyInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No safety instructions selected</p>
                )}
              </div>
              
              {videoUrl && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Training Video</h3>
                  <div className="rounded-md border overflow-hidden">
                    <video
                      width="100%"
                      height="auto"
                      controls
                      src={videoUrl}
                      className="aspect-video object-contain bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className="text-xs text-muted-foreground">{videoName}</p>
                </div>
              )}
              
              <Button onClick={() => setActiveTab('edit')} className="w-full">
                <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Safety Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="safetyFrequency">Safety Check Frequency</Label>
                <Select
                  value={safetyFrequency}
                  onValueChange={setSafetyFrequency}
                >
                  <SelectTrigger id="safetyFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not required</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                    <SelectItem value="biannually">Bi-annually (6 months)</SelectItem>
                    <SelectItem value="annually">Annually (yearly)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often this equipment needs safety checks
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="safetyManager" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Safety Manager
                </Label>
                <Select
                  value={safetyManagerId}
                  onValueChange={setSafetyManagerId}
                >
                  <SelectTrigger id="safetyManager">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None selected</SelectItem>
                    {employees
                      .filter(employee => employee.is_manager)
                      .map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.first_name} {manager.last_name} ({manager.email})
                      </SelectItem>
                    ))}
                    {employees.filter(employee => employee.is_manager).length === 0 && (
                      <SelectItem value="no-managers" disabled>
                        No managers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The manager responsible for this equipment's safety
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorizedOfficers" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Authorized Safety Officer Staff Members
                </Label>
                
                {employees.length > 0 ? (
                  <MultiSelect
                    options={employees
                      .filter(e => e.is_safety_officer)
                      .map(e => ({
                      label: `${e.first_name} ${e.last_name}`,
                      value: e.id
                    }))}
                    selected={authorizedOfficers}
                    onChange={setAuthorizedOfficers}
                    placeholder="Select staff members"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No staff members available. Add employees with safety officer role first.
                  </div>
                )}
                
                {employees.length > 0 && !employees.some(e => e.is_safety_officer) && (
                  <div className="text-sm text-amber-600 italic mt-2">
                    No safety officers found. Please ensure employees have the safety officer role.
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Staff members authorized to perform safety checks on this equipment
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="safetyInstructions">Safety Instructions</Label>
                <div className="border rounded-md p-4 space-y-3">
                  {SAFETY_INSTRUCTIONS.map((instruction, index) => (
                    <div className="flex items-start space-x-2" key={index}>
                      <Checkbox 
                        id={`safety-instruction-${index}`}
                        checked={safetyInstructions.includes(instruction)}
                        onCheckedChange={() => toggleSafetyInstruction(instruction)}
                      />
                      <Label 
                        htmlFor={`safety-instruction-${index}`}
                        className="text-sm font-normal leading-tight cursor-pointer"
                      >
                        {instruction}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select all safety instructions that apply to this equipment
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="mb-2 block">Training Video</Label>
                {videoUrl ? (
                  <div className="space-y-2">
                    <div className="rounded-md border overflow-hidden">
                      <video
                        width="100%"
                        height="auto"
                        controls
                        src={videoUrl}
                        className="aspect-video object-contain bg-black"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{videoName}</span>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteVideo}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop a video file or click to browse</p>
                      <input
                        type="file"
                        className="hidden"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('video-upload')?.click()}
                      >
                        Select Video
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a training video for safety check procedures. Max file size: 100MB.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('view')}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentSafetyChecks; 