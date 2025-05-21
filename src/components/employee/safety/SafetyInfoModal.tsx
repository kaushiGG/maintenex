import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Film, User, Clipboard, CalendarClock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SafetyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    name: string;
    manufacturer: string;
    model: string;
    safety_frequency: string;
    safety_instructions: string;
    authorized_officers: string[] | string;
    authorized_officers_names?: string;
    safety_manager_id: string;
    safety_manager_name?: string;
    training_video_url: string;
    training_video_name: string;
    last_safety_check: string | null;
  } | null;
  onPerformCheck: (equipmentId: string) => void;
}

const SafetyInfoModal: React.FC<SafetyInfoModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onPerformCheck
}) => {
  if (!equipment) return null;

  const getFrequencyLabel = (frequency: string): string => {
    const mapping: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly (3 months)',
      'biannually': 'Bi-annually (6 months)',
      'annually': 'Annually (yearly)'
    };
    return mapping[frequency] || frequency;
  };

  const handlePerformCheck = () => {
    onPerformCheck(equipment.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="bg-blue-50 p-6 rounded-t-lg">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            {equipment.name}
          </DialogTitle>
          <DialogDescription>
            Safety information and requirements for this equipment
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Equipment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Clipboard className="h-5 w-5 text-gray-600" />
                Equipment Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Name</span>
                  <span className="block">{equipment.name}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Manufacturer</span>
                  <span className="block">{equipment.manufacturer || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Model</span>
                  <span className="block">{equipment.model || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <CalendarClock className="h-5 w-5 text-gray-600" />
                Safety Check Schedule
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Frequency</span>
                  <span className="block">{getFrequencyLabel(equipment.safety_frequency)}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Last Check</span>
                  <span className="block">
                    {equipment.last_safety_check 
                      ? format(parseISO(equipment.last_safety_check), 'MMMM d, yyyy')
                      : 'No previous checks recorded'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Safety Manager</span>
                  <span className="block">{equipment.safety_manager_name || 'Not assigned'}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Authorised Officers</span>
                  <span className="block">
                    {equipment.authorized_officers_names || 
                      (Array.isArray(equipment.authorized_officers) 
                        ? equipment.authorized_officers.join(', ')
                        : equipment.authorized_officers || 'Not assigned')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <FileText className="h-5 w-5 text-gray-600" />
              Safety Instructions
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {equipment.safety_instructions ? (
                <pre className="whitespace-pre-wrap font-sans text-sm">{equipment.safety_instructions}</pre>
              ) : (
                <p className="text-gray-500">No specific safety instructions provided.</p>
              )}
            </div>
          </div>
          
          {/* Training Video */}
          {equipment.training_video_url && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Film className="h-5 w-5 text-gray-600" />
                Training Video
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {equipment.training_video_url ? (
                  <div>
                    <p className="mb-2">{equipment.training_video_name}</p>
                    <div className="aspect-video">
                      <video 
                        controls 
                        className="w-full h-full rounded"
                        src={equipment.training_video_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No training video available.</p>
                )}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handlePerformCheck}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Perform Safety Check
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SafetyInfoModal; 