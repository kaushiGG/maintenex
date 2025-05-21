
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobInfoSectionProps {
  jobData: {
    title: string;
    jobType: string;
    priority: string;
    description: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
}

const JobInfoSection: React.FC<JobInfoSectionProps> = ({ 
  jobData, 
  handleInputChange,
  handleSelectChange 
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Job Information</h3>
      
      <div className="space-y-4">
        <div className="form-group">
          <Label htmlFor="title">Job Title</Label>
          <Input 
            id="title" 
            placeholder="Enter a descriptive title" 
            className="mt-1" 
            value={jobData.title}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <Label htmlFor="jobType">Job Type</Label>
            <Select 
              value={jobData.jobType} 
              onValueChange={(value) => handleSelectChange('jobType', value)}
            >
              <SelectTrigger id="jobType" className="w-full">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Routine Maintenance</SelectItem>
                <SelectItem value="inspection">Compliance Inspection</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-group">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={jobData.priority} 
              onValueChange={(value) => handleSelectChange('priority', value)}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="form-group">
          <Label htmlFor="description">Job Description</Label>
          <Textarea 
            id="description" 
            rows={4} 
            placeholder="Provide detailed description of the job requirements" 
            className="mt-1"
            value={jobData.description}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default JobInfoSection;
