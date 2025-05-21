import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadFile, ensureBucketPermissions, forceUploadFile } from '@/utils/fileUpload';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Import } from 'lucide-react';
import { createDocumentsAttachBucket, addEquipmentToJobs, addEquipmentIdToJobs, addBuildingToJobs, createDocumentsAttachBucketWithRLS, setupAttachments, forceConfigureStorage } from '@/utils/migrations';
import { Equipment } from '@/types/equipment';
import { v4 as uuidv4 } from 'uuid';
import { Select } from '@/components/ui/select';

import JobFormHeader from './components/JobFormHeader';
import JobInfoSection from './components/JobInfoSection';
import ServiceTypeSection from './components/ServiceTypeSection';
import LocationSection from './components/LocationSection';
import ScheduleSection from './components/ScheduleSection';
import AssignmentSection from './components/AssignmentSection';
import AttachmentsSection from './components/AttachmentsSection';
import JobImportModal from './components/JobImportModal';
import { Info } from 'lucide-react';

interface AssignJobPageProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
}

// Define a simple object type to avoid deep recursion
type ServiceTypeInfo = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

interface JobData {
  title: string;
  jobType: string;
  priority: string;
  description: string;
  serviceDetails: string;
  site: string;
  building: string;
  locationDetails: string;
  startDate: string;
  dueDate: string;
  scheduleNotes: string;
  equipment: string;
  status: string;
  contractorId: string;
  attachments: File[];
  contractor: string;
  assignmentMethod: string;
  assignmentNotes: string;
  serviceType: string;
  estimatedHours: string;
  assigneeType: string;
}

const initialJobData: JobData = {
  title: "",
  jobType: "",
  priority: "Low",
  description: "",
  serviceDetails: "",
  site: "",
  building: "",
  locationDetails: "",
  startDate: "",
  dueDate: "",
  scheduleNotes: "",
  equipment: "",
  status: "New",
  contractorId: "",
  attachments: [],
  contractor: "",
  assignmentMethod: "manual",
  assignmentNotes: "",
  serviceType: "",
  estimatedHours: "",
  assigneeType: "contractor"
};

const AssignJobPage = ({ switchRole, userRole, handleLogout }: AssignJobPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>('test-tag');
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [selectedContractorName, setSelectedContractorName] = useState<string | null>(null);
  const [selectedContractorEmail, setSelectedContractorEmail] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [equipmentNames, setEquipmentNames] = useState<Record<string, string>>({});
  const [jobData, setJobData] = useState<JobData>({
    ...initialJobData,
    assigneeType: 'contractor' // Initialize with contractor as default assignee type
  });

  // Get user name from metadata
  const firstName = user?.user_metadata?.firstName || '';
  const lastName = user?.user_metadata?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Business User';
  const email = user?.email || 'business@example.com';

  const serviceTypes: ServiceTypeInfo[] = [
    // Electrical services group
    { id: 'test-tag', name: 'Test & Tag', icon: '🔌', description: 'Electrical equipment testing and certification' },
    { id: 'rcd-testing', name: 'RCD Testing', icon: '⚡', description: 'Residual Current Device testing' },
    { id: 'emergency-lighting', name: 'Emergency Lighting', icon: '🚨', description: 'Emergency lighting inspection' },
    
    // Inspection services group
    { id: 'thermal-imaging', name: 'Thermal Imaging', icon: '🔍', description: 'Thermal analysis and reporting' },
    
    // Mechanical services group
    { id: 'air-conditioning', name: 'Air Conditioning', icon: '❄️', description: 'HVAC maintenance and repair' },
    { id: 'plumbing', name: 'Plumbing', icon: '🚿', description: 'Plumbing services and repairs' },
    
    // Other category
    { id: 'other', name: 'Other', icon: '🔧', description: 'Other maintenance or service tasks not listed above' },
  ];

  useEffect(() => {
    // Run database migrations
    const runMigrations = async () => {
      // Setup attachments table and bucket
      const attachmentsResult = await setupAttachments();
      console.log('Attachments setup result:', attachmentsResult);

      // Add equipment column
      const equipmentResult = await addEquipmentToJobs();
      console.log('Equipment column migration result:', equipmentResult);
      
      // Add equipment_id column
      const equipmentIdResult = await addEquipmentIdToJobs();
      console.log('Equipment ID column migration result:', equipmentIdResult);
      
      // Add building column
      const buildingResult = await addBuildingToJobs();
      console.log('Building column migration result:', buildingResult);
    };

    runMigrations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, name, value } = e.target;
    const fieldName = name || id;
    setJobData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Add new files to existing attachments
    const newFiles = Array.from(files);
    setJobData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles]
    }));
  };

  // Handle file upload for jobs
  const handleTrainingVideoUpload = (file: File | null) => {
    if (file) {
      // Add as regular attachment
      setJobData(prev => ({
        ...prev,
        attachments: [...prev.attachments, file]
      }));
      toast.success(`File "${file.name}" added as an attachment`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setJobData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleContractorSelection = (contractorId: string | null, contractorName?: string, contractorEmail?: string) => {
    console.log('Contractor selected:', contractorId, contractorName, contractorEmail);
    setSelectedContractor(contractorId);
    setSelectedContractorName(contractorName || null);
    setSelectedContractorEmail(contractorEmail || null);
    
    // Update the contractor field in jobData with the selected contractor ID
    setJobData(prev => ({ 
      ...prev, 
      assignmentMethod: "manual", // Always set to manual
      contractor: contractorId || '',
      contractorId: contractorId || '', // Also update contractorId field for database insert
      assigneeType: contractorId ? 'contractor' : prev.assigneeType // Keep assigneeType as contractor if a contractor is selected
    }));
  };

  const handleSaveAsDraft = async () => {
    toast.info("Save as draft functionality will be implemented soon.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a job");
      return;
    }
    
    if (!jobData.title || !jobData.description || !jobData.site) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates to ensure they are current or future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
    
    if (jobData.startDate) {
      const startDate = new Date(jobData.startDate);
      if (startDate < today) {
        toast.error("Start date must be today or a future date");
        return;
      }
    }
    
    if (jobData.dueDate) {
      const dueDate = new Date(jobData.dueDate);
      if (dueDate < today) {
        toast.error("Due date must be today or a future date");
      return;
      }
    }

    // Validate that a contractor is selected if assigneeType is contractor
    if (jobData.assigneeType === 'contractor' && !jobData.contractorId) {
      toast.error("Please select a contractor for this job");
      return;
    }

    setIsSubmitting(true);

    try {
      // First upload all attachments
      let uploadedAttachments: any[] = [];
      
      if (jobData.attachments.length > 0) {
        const uploadPromises = jobData.attachments.map(async (file) => {
          const fileId = uuidv4();
          const fileExt = file.name.split('.').pop();
          const fileName = `${fileId}.${fileExt}`;
          const filePath = `${fileName}`;
          
          // Upload file to Supabase storage
          const { data, error } = await supabase.storage
            .from('documents-attach')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (error) {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
            return null;
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('documents-attach')
            .getPublicUrl(filePath);
          
          // Return file info for attachment table
          return {
            file_name: file.name,
            file_path: filePath,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            uuid: fileId
          };
        });
        
        uploadedAttachments = (await Promise.all(uploadPromises)).filter(Boolean) as any[];
      }
      
      // Add console logging to debug the job object
      console.log("Job data being submitted:", {
        title: jobData.title,
        description: jobData.description,
        service_type: jobData.serviceType || '',
        service_details: jobData.serviceDetails,
        building_type: jobData.building,
        status: "pending",
        contractor_id: jobData.assigneeType === 'business' ? null : jobData.contractorId,
        assigned_to: jobData.assigneeType === 'business' ? fullName : selectedContractorName,
        assignment_notes: jobData.assigneeType === 'business' ? `[BUSINESS_SELF_ASSIGNED] Assigned to business user: ${fullName}` : jobData.assignmentNotes,
        time_spent: parseInt(jobData.estimatedHours) || null
      });

      // Then create the job in the database
      let { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert([
          {
            title: jobData.title,
            description: jobData.description,
            service_type: jobData.serviceType || '',
            service_details: jobData.serviceDetails || '',
            building_type: jobData.building || '',
            status: "pending",
            priority: jobData.priority,
            site_id: jobData.site,
            schedule_notes: jobData.scheduleNotes,
            time_spent: parseInt(jobData.estimatedHours) || null,
            start_date: jobData.startDate || null,
            due_date: jobData.dueDate || null,
            location_details: jobData.locationDetails || '',
            // For business assignments, still set contractor_id to null
            contractor_id: jobData.assigneeType === 'business' ? null : jobData.contractorId,
            // Store who the job is assigned to (business user or contractor)
            assigned_to: jobData.assigneeType === 'business' ? fullName : selectedContractorName,
            // Add a special tag in assignment_notes to identify business assignments
            assignment_notes: jobData.assigneeType === 'business' 
              ? `[BUSINESS_SELF_ASSIGNED] Assigned to business user: ${fullName}` 
              : jobData.assignmentNotes,
            // Use job_type to flag self-assigned jobs
            job_type: jobData.assigneeType === 'business' ? 'self_assigned' : jobData.jobType || '',
            attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null,
            created_by: user.id,
            equipment_id: jobData.equipment || null
          }
        ])
        .select();

      if (jobError) {
        throw jobError;
      }
      
      toast.success("Job created successfully!");
        navigate('/jobs/active');
    } catch (error: any) {
      console.error("Error in job creation:", error);
      toast.error(`Something went wrong: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
  };

  const handleImportComplete = () => {
    setImportModalOpen(false);
    toast.success('Jobs successfully imported!');
    setTimeout(() => {
      navigate('/jobs/active');
    }, 1500);
  };

  const handleEquipmentLoad = (equipmentList: Equipment[]) => {
    // Create a mapping of equipment IDs to names
    const nameMap: Record<string, string> = {};
    equipmentList.forEach(item => {
      nameMap[item.id] = `${item.name} (${item.model || 'No model'})`;
    });
    setEquipmentNames(nameMap);
  };

  // Update service type when it changes
  useEffect(() => {
    if (selectedService) {
      const serviceName = serviceTypes.find(st => st.id === selectedService)?.name || '';
      setJobData(prev => ({
        ...prev,
        serviceType: selectedService // Save the service type ID
      }));
    }
  }, [selectedService, serviceTypes]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole="business" 
        handleLogout={handleLogout} 
        title="Assign a Job"
        portalType="business"
        userMode="management"
        userData={{
          fullName,
          email,
          userType: 'business'
        }}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="business"
          userMode="management"
        />
        
        <main className="flex-1 p-2 sm:p-6 bg-gray-50 overflow-x-hidden">
          <div className="flex justify-between items-center mb-4">
            <JobFormHeader title="Assign a Job" />
            <div className="flex space-x-2">
            <Button 
                variant="outline" 
              onClick={handleOpenImportModal}
                className="flex items-center text-sm h-9 px-3"
                size="sm"
            >
                <Import className="h-3.5 w-3.5 mr-1.5" />
              Import Jobs
            </Button>
            </div>
          </div>

          <Card className="w-full bg-white mb-6">
            <CardContent className="pt-6">
              <div className="space-y-8">
                <JobInfoSection 
                  jobData={jobData} 
                  handleInputChange={handleInputChange} 
                  handleSelectChange={handleSelectChange}
                />

                <LocationSection 
                  jobData={jobData}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                  onEquipmentLoad={handleEquipmentLoad}
                />

                <ServiceTypeSection 
                  serviceTypes={serviceTypes}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  serviceDetails={jobData.serviceDetails}
                  handleInputChange={handleInputChange}
                />

                <ScheduleSection 
                  jobData={jobData}
                  handleInputChange={handleInputChange}
                />

                <AssignmentSection 
                  jobData={jobData}
                  handleInputChange={handleInputChange}
                  handleRadioChange={handleRadioChange}
                  handleSelectChange={handleSelectChange}
                  selectedContractorId={jobData.contractorId}
                  onContractorSelect={handleContractorSelection}
                />
                
                <AttachmentsSection 
                  jobData={jobData} 
                  handleFileChange={handleFileChange} 
                  handleVideoUpload={handleTrainingVideoUpload}
                  handleRemoveFile={handleRemoveFile}
                />

                <div className="flex items-start p-4 rounded-md bg-orange-50 border-l-4 border-orange-400">
                  <div className="text-orange-500 mr-2">ⓘ</div>
                  <div>
                    <h4 className="font-medium text-orange-800">Job Assignment</h4>
                    <p className="text-sm text-orange-700">After submitting, the contractor will be notified about this job. Once confirmed, you'll be able to track progress in your job dashboard.</p>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting}
                    size="sm"
                    className="h-9 px-3"
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="!bg-[#FF6B00] !hover:bg-[#E65C00] text-white h-9 px-4"
                    size="sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Job'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {importModalOpen && (
        <JobImportModal 
          open={importModalOpen} 
          onClose={() => setImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default AssignJobPage;
