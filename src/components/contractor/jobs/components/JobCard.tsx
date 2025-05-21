import React from 'react';
import { Calendar, Clock, CheckCircle, Building, Wrench, MapPin, Play, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: any;
  handleViewDetails: (jobId: string) => void;
  handleStartJob: (job: any) => void;
  handleAcceptJob?: (job: any) => void;
  handleViewReport?: (job: any) => void;
  handleCompleteJob?: (job: any) => void;
  hideReportButton?: boolean;
}

const JobCard = ({
  job,
  handleViewDetails,
  handleStartJob,
  handleAcceptJob,
  handleViewReport,
  handleCompleteJob,
  hideReportButton = false
}: JobCardProps) => {
  // Handle case where job is undefined or null
  if (!job || !job.id) {
    return null;
  }

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-200 bg-yellow-50">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>;
      case 'accepted':
        return <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
            <Clock className="h-3 w-3" />
            Accepted
          </Badge>;
      case 'in-progress':
      case 'in progress':
        return <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>;
      case 'completed':
        return <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1 text-gray-600 border-gray-200 bg-gray-50">
            {status || 'Unknown'}
          </Badge>;
    }
  };
  
  // Safely access job properties
  const title = job.title || 'Untitled Job';
  const siteName = job.sites?.name || 'Unknown site';
  const siteAddress = job.sites?.address || '';
  const priority = job.priority || 'Normal';
  const status = job.status || 'Unknown';
  const dueDate = job.due_date ? new Date(job.due_date) : null;
  const serviceType = job.service_type || 'General Service';
  const description = job.description || '';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-pretance-purple">{title}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span>{siteName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(priority)}`}>
              {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal'}
            </span>
            {getStatusBadge(status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {siteAddress && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
              <span className="text-sm text-gray-600">{siteAddress}</span>
            </div>
          )}
          
          {dueDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                Due: {dueDate.toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center">
            <Wrench className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{serviceType}</span>
          </div>
          
          {description && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4 justify-between">
            {!hideReportButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewDetails(job.id)}
              >
                View Details
              </Button>
            )}
            
            <div className="flex gap-2">
              {status.toLowerCase() === 'pending' && handleAcceptJob && !hideReportButton && (
                <Button 
                  size="sm" 
                  className="bg-pretance-purple hover:bg-pretance-purple/90" 
                  onClick={() => handleAcceptJob(job)}
                >
                  Accept Job
                </Button>
              )}
              
              {status.toLowerCase() === 'accepted' && !hideReportButton && (
                <Button 
                  size="sm" 
                  className="bg-purple-700 hover:bg-purple-800 text-white font-medium shadow-sm flex items-center gap-1 px-4" 
                  onClick={() => handleStartJob(job)}
                >
                  <Play className="h-4 w-4" /> Start Job
                </Button>
              )}
              
              {status.toLowerCase() === 'completed' && handleViewReport && !hideReportButton && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1" 
                  onClick={() => handleViewReport(job)}
                >
                  <FileText className="h-4 w-4" /> View Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;