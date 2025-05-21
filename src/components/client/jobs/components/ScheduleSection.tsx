
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleSectionProps {
  jobData: {
    startDate: string;
    dueDate: string;
    scheduleNotes?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  jobData,
  handleInputChange,
}) => {
  // Helper function to validate date display
  const formatDateDisplay = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      return format(date, 'PPP');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Schedule Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="form-group">
          <Label htmlFor="startDate">Preferred Start Date</Label>
          <div className="relative mt-1">
            <Input 
              type="date" 
              id="startDate" 
              name="startDate"
              className="pr-10"
              value={jobData.startDate}
              onChange={handleInputChange}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {jobData.startDate && formatDateDisplay(jobData.startDate)}
          </div>
        </div>
        
        <div className="form-group">
          <Label htmlFor="dueDate">Due Date</Label>
          <div className="relative mt-1">
            <Input 
              type="date" 
              id="dueDate" 
              name="dueDate"
              className="pr-10"
              value={jobData.dueDate}
              onChange={handleInputChange}  
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {jobData.dueDate && formatDateDisplay(jobData.dueDate)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-start p-4 rounded-md bg-amber-50 border-l-4 border-amber-400">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Note on Scheduling</h4>
            <p className="text-sm text-amber-700">Scheduling is subject to contractor availability. You'll be notified once a contractor accepts the job.</p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <Label htmlFor="scheduleNotes">Additional Scheduling Notes</Label>
        <Textarea 
          id="scheduleNotes" 
          name="scheduleNotes"
          rows={3} 
          placeholder="Any specific requirements for scheduling" 
          className="mt-1"
          value={jobData.scheduleNotes || ''}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ScheduleSection;
