import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Check, Search, Loader2, Briefcase, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contractor } from '@/types/contractor';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AssignmentSectionProps {
  jobData: {
    assignmentMethod: string;
    assignmentNotes: string;
    serviceType?: string | null; // Add service type to filter contractors
    assigneeType?: string; // Change type to string to match JobData
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (field: string, value: string) => void;
  selectedContractorId: string | null;
  onContractorSelect: (contractorId: string | null, contractorName?: string, contractorEmail?: string) => void;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  jobData,
  handleInputChange,
  handleRadioChange,
  handleSelectChange,
  selectedContractorId,
  onContractorSelect
}) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [assigneeType, setAssigneeType] = useState<'contractor' | 'business'>('contractor');

  // Handle assignee type change
  const handleAssigneeTypeChange = (value: string) => {
    const newType = value as 'contractor' | 'business';
    setAssigneeType(newType);
    
    // Clear selected contractor if switching to business
    if (newType === 'business' && selectedContractorId) {
      onContractorSelect(null);
    }
    
    // Update the job data if handleSelectChange is provided
    if (handleSelectChange) {
      handleSelectChange('assigneeType', newType);
    }
  };

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching contractors from Supabase...');
        
        const { data, error } = await supabase
          .from('contractors')
          .select('*')
          .eq('status', 'Active')
          .order('name');

        if (error) {
          console.error('Error fetching contractors:', error);
          setError(`Failed to load contractors: ${error.message}`);
          throw error;
        }

        if (data) {
          console.log('Contractors fetched:', data.length, data);
          const formattedContractors: Contractor[] = data.map((contractor) => ({
            id: contractor.id,
            name: contractor.name,
            serviceType: contractor.service_type,
            rating: contractor.rating || 3,
            credentials: contractor.credentials,
            completedJobs: Math.floor(Math.random() * 50) + 5,
            status: (contractor.status || 'Active') as 'Active' | 'Warning' | 'Suspended',
            contactEmail: contractor.contact_email,
            contactPhone: contractor.contact_phone,
            location: contractor.location,
            notes: contractor.notes
          }));

          setContractors(formattedContractors);
          setFilteredContractors(formattedContractors);
          console.log('Formatted contractors:', formattedContractors);
        } else {
          console.log('No contractors found');
          setContractors([]);
          setFilteredContractors([]);
        }
      } catch (error: any) {
        console.error('Error fetching contractors:', error);
        toast.error('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractors();
  }, []);

  useEffect(() => {
    if (contractors.length === 0) return;
    console.log('No longer filtering contractors by service type');
    
    let filtered = [...contractors];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contractor => 
        contractor.name.toLowerCase().includes(query) || 
        (contractor.serviceType && contractor.serviceType.toLowerCase().includes(query))
      );
    }
    
    console.log('Filtered contractors:', filtered.length);
    setFilteredContractors(filtered);
  }, [searchQuery, contractors]);

  const renderStarRating = (rating: number = 3) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-yellow-500">☆</span>);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Job Assignment</h3>
      
      <div className="mb-6">
        <Label className="block mb-2">Assign job to:</Label>
        <RadioGroup 
          defaultValue="contractor" 
          value={assigneeType}
          onValueChange={handleAssigneeTypeChange}
          className="flex space-x-4 mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="contractor" id="assignee-contractor" />
            <Label htmlFor="assignee-contractor" className="flex items-center cursor-pointer">
              <Briefcase className="w-4 h-4 mr-1" />
              Contractor
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="business" id="assignee-business" />
            <Label htmlFor="assignee-business" className="flex items-center cursor-pointer">
              <User className="w-4 h-4 mr-1" />
              Business User (Self-Assigned)
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {assigneeType === 'contractor' && (
        <>
          <div className="mb-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search contractors by name, skill, or location" 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {error ? (
            <div className="text-center p-4 text-red-500">
              {error}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading contractors...</span>
            </div>
          ) : filteredContractors.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-gray-500">No contractors found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredContractors.map((contractor) => (
                <div 
                  key={contractor.id}
                  className={`border rounded-md p-4 cursor-pointer hover:border-orange-300 hover:bg-orange-50 ${selectedContractorId === contractor.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => onContractorSelect(contractor.id, contractor.name, contractor.contactEmail)}
                >
                  <div className="flex mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500 font-semibold">
                      {contractor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{contractor.name}</div>
                      <div className="text-xs text-gray-500">{contractor.serviceType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm mb-2">
                    {renderStarRating(contractor.rating)}
                    <div className="ml-1">{contractor.rating?.toFixed(1)}/5</div>
                  </div>
                  
                  <div className="flex text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {contractor.completedJobs || 0} jobs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {assigneeType === 'business' && (
        <div className="border rounded-md p-4 mb-6 bg-orange-50 border-orange-200">
          <div className="flex mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center mr-3 text-orange-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Self-Assigned Job</div>
              <div className="text-xs text-gray-600">This job will be assigned to your business account</div>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Self-assigned jobs can be viewed and managed in the Business User portal. You can perform and complete these jobs yourself.
          </p>
        </div>
      )}
      
      <div className="form-group">
        <Label htmlFor="assignmentNotes">Assignment Notes</Label>
        <Textarea 
          id="assignmentNotes" 
          name="assignmentNotes"
          rows={3} 
          placeholder="Any specific instructions for the assigned party" 
          className="mt-1"
          value={jobData.assignmentNotes}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default AssignmentSection;
