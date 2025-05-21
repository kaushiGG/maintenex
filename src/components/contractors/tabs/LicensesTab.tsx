import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Plus, Edit, Eye, FileUp } from 'lucide-react';
import AddLicenseDialog from '../dialogs/AddLicenseDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LicenseImportModal from '../LicenseImportModal';
import { Dialog } from '@/components/ui/dialog';

interface License {
  id: string;
  contractorName: string;
  licenseType: string;
  licenseNumber: string;
  expiryDate: string;
  issueDate: string;
  provider: string;
  notes?: string;
  status: 'Valid' | 'Expiring' | 'Expired';
}

interface LicenseType {
  id: string;
  value: string;
  label: string;
  icon_name: string;
}

const defaultLicenseTypes: LicenseType[] = [
  { value: 'electrical_contractor', label: 'Electrical Contractor', icon_name: 'zap' },
  { value: 'plumbing_contractor', label: 'Plumbing Contractor', icon_name: 'droplet' },
  { value: 'hvac_contractor', label: 'HVAC Contractor', icon_name: 'thermometer' },
  { value: 'general_contractor', label: 'General Contractor', icon_name: 'hammer' },
  { value: 'roofing_contractor', label: 'Roofing Contractor', icon_name: 'home' },
  { value: 'painting_contractor', label: 'Painting Contractor', icon_name: 'brush' },
  { value: 'carpentry_contractor', label: 'Carpentry Contractor', icon_name: 'ruler' },
  { value: 'masonry_contractor', label: 'Masonry Contractor', icon_name: 'brick' },
  { value: 'landscaping_contractor', label: 'Landscaping Contractor', icon_name: 'tree' },
  { value: 'demolition_contractor', label: 'Demolition Contractor', icon_name: 'wrecking-ball' },
  { value: 'asbestos_removal', label: 'Asbestos Removal', icon_name: 'shield' },
  { value: 'fire_safety', label: 'Fire Safety', icon_name: 'flame' },
  { value: 'security_systems', label: 'Security Systems', icon_name: 'lock' },
  { value: 'elevator_contractor', label: 'Elevator Contractor', icon_name: 'arrow-up-down' },
  { value: 'solar_contractor', label: 'Solar Contractor', icon_name: 'sun' }
];

const LicensesTab = () => {
  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  const initializeLicenseTypes = async () => {
    try {
      // First, check if we have any license types
      const { data: existingTypes, error: fetchError } = await supabase
        .from('license_types')
        .select('*');

      if (fetchError) throw fetchError;

      // If no license types exist, insert the default ones
      if (!existingTypes || existingTypes.length === 0) {
        const { error: insertError } = await supabase
          .from('license_types')
          .insert(defaultLicenseTypes);

        if (insertError) throw insertError;
        
        setLicenseTypes(defaultLicenseTypes);
        toast.success('License types initialized successfully');
      } else {
        setLicenseTypes(existingTypes);
      }
    } catch (error: any) {
      console.error('Error initializing license types:', error);
      toast.error('Failed to initialize license types');
    }
  };

  const fetchLicenseTypes = async () => {
    try {
      const { data, error } = await supabase.from('license_types').select('*');
      if (error) throw error;
      if (data) {
        setLicenseTypes(data);
      }
    } catch (error: any) {
      console.error('Error fetching license types:', error);
      toast.error('Failed to load license types');
    }
  };

  const fetchLicenses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractor_licenses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const mappedLicenses = data.map(item => {
          const today = new Date();
          const expiryDate = new Date(item.expiry_date);
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let status: 'Valid' | 'Expiring' | 'Expired' = 'Valid';
          if (diffDays < 0) {
            status = 'Expired';
          } else if (diffDays < 30) {
            status = 'Expiring';
          }
          return {
            id: item.id,
            contractorName: item.contractor_name,
            licenseType: item.license_type,
            licenseNumber: item.license_number,
            expiryDate: item.expiry_date,
            issueDate: item.issue_date,
            provider: item.provider,
            notes: item.notes,
            status: status
          };
        });
        setLicenses(mappedLicenses);
      }
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to load licenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      initializeLicenseTypes();
      fetchLicenses();
    }
  }, [user]);

  const handleAddLicense = async (licenseData: Omit<License, 'id' | 'status'>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to add licenses');
        return;
      }
      const insertData = {
        contractor_id: user.id, // Add required field
        contractor_name: licenseData.contractorName,
        license_type: licenseData.licenseType,
        license_number: licenseData.licenseNumber,
        issue_date: licenseData.issueDate,
        expiry_date: licenseData.expiryDate,
        provider: licenseData.provider,
        notes: licenseData.notes,
        owner_id: user.id
      };
      const { data, error } = await supabase
        .from('contractor_licenses')
        .insert(insertData)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const today = new Date();
        const expiryDate = new Date(data[0].expiry_date);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let status: 'Valid' | 'Expiring' | 'Expired' = 'Valid';
        if (diffDays < 0) {
          status = 'Expired';
        } else if (diffDays < 30) {
          status = 'Expiring';
        }
        const addedLicense: License = {
          id: data[0].id,
          contractorName: data[0].contractor_name,
          licenseType: data[0].license_type,
          licenseNumber: data[0].license_number,
          expiryDate: data[0].expiry_date,
          issueDate: data[0].issue_date,
          provider: data[0].provider,
          notes: data[0].notes,
          status: status
        };
        setLicenses([addedLicense, ...licenses]);
        toast.success('License added successfully');
        setIsAddLicenseOpen(false);
      }
    } catch (error: any) {
      console.error('Error adding license:', error);
      toast.error('Failed to add license: ' + (error.message || 'Unknown error'));
    }
  };

  const handleViewLicense = (license: License) => {
    toast.info(`Viewing details for license: ${license.licenseNumber}`);
  };

  const handleEditLicense = (license: License) => {
    toast.info(`Editing license: ${license.licenseNumber}`);
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
    return matchesStatus;
  });

  const handleImportModalClose = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = () => {
    fetchLicenses();
    setIsImportModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Licenses</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddLicenseOpen(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add License
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-forgemate-dark">Contractor Licenses</h2>
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Valid">Valid</SelectItem>
              <SelectItem value="Expiring">Expiring Soon</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              className="bg-orange-500 hover:bg-orange-600" 
              onClick={() => setIsImportModalOpen(true)}
            >
              <FileUp className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>License Type</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLicenses.length > 0 ? (
              filteredLicenses.map(license => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium">{license.contractorName}</TableCell>
                  <TableCell>{license.licenseType}</TableCell>
                  <TableCell>{license.licenseNumber}</TableCell>
                  <TableCell>{new Date(license.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {license.status === 'Valid' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Valid
                      </span>
                    )}
                    {license.status === 'Expiring' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Expiring Soon
                      </span>
                    )}
                    {license.status === 'Expired' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-1" /> Expired
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLicense(license)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLicense(license)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No licenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAddLicenseOpen} onOpenChange={setIsAddLicenseOpen}>
        <AddLicenseDialog
          open={isAddLicenseOpen}
          onOpenChange={setIsAddLicenseOpen}
          onAddLicense={handleAddLicense}
        />
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <LicenseImportModal
          onClose={handleImportModalClose}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default LicensesTab;
