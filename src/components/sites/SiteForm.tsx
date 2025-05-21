import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Site, ComplianceStatus, SiteEquipment } from '@/types/site';

export type SiteFormData = {
  id?: string;
  name: string;
  address: string;
  complianceStatus: ComplianceStatus;
  assignedContractors: string[];
  equipment?: SiteEquipment[];
  site_type?: string;
  contact_email?: string;
  contact_phone?: string;
};

interface SiteFormProps {
  editingSite: SiteFormData | null;
  setEditingSite: (site: SiteFormData | null) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({
  editingSite,
  setEditingSite,
  onCancel,
  onSubmit
}) => {
  if (!editingSite) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingSite.id ? 'Edit Site' : 'Add New Site'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label htmlFor="site-name" className="text-sm font-medium">
            Site Name
          </label>
          <Input
            id="site-name"
            placeholder="Enter site name"
            value={editingSite.name || ''}
            onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="site-address" className="text-sm font-medium">
            Address
          </label>
          <Input
            id="site-address"
            placeholder="Enter site address"
            value={editingSite.address || ''}
            onChange={(e) => setEditingSite({ ...editingSite, address: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="site-type" className="text-sm font-medium">
            Site Type
          </label>
          <Input
            id="site-type"
            placeholder="Enter site type (office, branch, etc.)"
            value={editingSite.site_type || ''}
            onChange={(e) => setEditingSite({ ...editingSite, site_type: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-sm font-medium">
              Contact Email
            </label>
            <Input
              id="contact-email"
              type="email"
              placeholder="Enter contact email"
              value={editingSite.contact_email || ''}
              onChange={(e) => setEditingSite({ ...editingSite, contact_email: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact-phone" className="text-sm font-medium">
              Contact Phone
            </label>
            <Input
              id="contact-phone"
              placeholder="Enter contact phone"
              value={editingSite.contact_phone || ''}
              onChange={(e) => setEditingSite({ ...editingSite, contact_phone: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="compliance-status" className="text-sm font-medium">
            Compliance Status
          </label>
          <Select
            value={editingSite.complianceStatus || 'compliant'}
            onValueChange={(value: ComplianceStatus) => 
              setEditingSite({ ...editingSite, complianceStatus: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliant">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Compliant
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Warning
                </div>
              </SelectItem>
              <SelectItem value="non-compliant">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Non-Compliant
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
          disabled={!editingSite.name || !editingSite.address}
        >
          {editingSite.id ? 'Save Changes' : 'Add Site'}
        </Button>
      </DialogFooter>
    </>
  );
};

export default SiteForm;
