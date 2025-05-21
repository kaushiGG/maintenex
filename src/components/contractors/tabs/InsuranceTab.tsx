import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Plus, Edit, Eye, Upload, FileDown } from 'lucide-react';
import AddInsuranceDialog from '../dialogs/AddInsuranceDialog';
import InsuranceImportModal from '../InsuranceImportModal';
import { Dialog } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Insurance {
  id: string;
  contractorName: string;
  insuranceType: string;
  provider: string;
  policyNumber: string;
  coverage: string;
  expiryDate: string;
  issueDate: string;
  status: 'Valid' | 'Expiring' | 'Expired';
  notes?: string;
}

const InsuranceTab = () => {
  const [isAddInsuranceOpen, setIsAddInsuranceOpen] = useState(false);
  const [isImportInsuranceOpen, setIsImportInsuranceOpen] = useState(false);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  const fetchInsurances = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractor_insurance')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const mappedInsurances = data.map(item => {
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
            insuranceType: item.insurance_type,
            provider: item.provider,
            policyNumber: item.policy_number,
            coverage: item.coverage,
            expiryDate: item.expiry_date,
            issueDate: item.issue_date,
            status: status,
            notes: item.notes
          };
        });
        
        setInsurances(mappedInsurances);
      }
    } catch (error: any) {
      console.error('Error fetching insurances:', error);
      toast.error('Failed to load insurances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInsurances();
    }
  }, [user]);

  const handleAddInsurance = async (insuranceData: Omit<Insurance, 'id' | 'status'>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to add insurances');
        return;
      }
      const insertData = {
        contractor_id: user.id, // Add this required field
        contractor_name: insuranceData.contractorName,
        insurance_type: insuranceData.insuranceType,
        provider: insuranceData.provider,
        policy_number: insuranceData.policyNumber,
        coverage: insuranceData.coverage,
        issue_date: insuranceData.issueDate,
        expiry_date: insuranceData.expiryDate,
        notes: insuranceData.notes,
        owner_id: user.id
      };
      
      const {
        data,
        error
      } = await supabase.from('contractor_insurance').insert(insertData).select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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
        const addedInsurance: Insurance = {
          id: data[0].id,
          contractorName: data[0].contractor_name,
          insuranceType: data[0].insurance_type,
          provider: data[0].provider,
          policyNumber: data[0].policy_number,
          coverage: data[0].coverage,
          expiryDate: data[0].expiry_date,
          issueDate: data[0].issue_date,
          status: status,
          notes: data[0].notes
        };
        setInsurances([addedInsurance, ...insurances]);
        toast.success('Insurance added successfully');
        setIsAddInsuranceOpen(false);
      } else {
        throw new Error('No data returned from insert operation');
      }
    } catch (error: any) {
      console.error('Error adding insurance:', error);
      toast.error('Failed to add insurance: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredInsurances = insurances.filter(insurance => {
    const matchesStatus = filterStatus === 'all' || insurance.status === filterStatus;
    return matchesStatus;
  });

  const handleImportSuccess = () => {
    setIsImportInsuranceOpen(false);
    fetchInsurances();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Insurance</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddInsuranceOpen(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add Insurance
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1560bd]"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Insurance Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Policy Number</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInsurances.length > 0 ? (
              filteredInsurances.map(insurance => (
                <TableRow key={insurance.id}>
                  <TableCell className="font-medium">{insurance.contractorName}</TableCell>
                  <TableCell>{insurance.insuranceType}</TableCell>
                  <TableCell>{insurance.provider}</TableCell>
                  <TableCell>{insurance.policyNumber}</TableCell>
                  <TableCell>{insurance.coverage}</TableCell>
                  <TableCell>{new Date(insurance.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {insurance.status === 'Valid' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Valid
                      </span>
                    )}
                    {insurance.status === 'Expiring' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Expiring Soon
                      </span>
                    )}
                    {insurance.status === 'Expired' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-1" /> Expired
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <p className="text-gray-500">
                    {filterStatus !== 'all' ? 'No insurance policies found matching your filters.' : 'No insurances found. Add a new insurance to get started.'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <AddInsuranceDialog 
        open={isAddInsuranceOpen} 
        onOpenChange={setIsAddInsuranceOpen} 
        onAddInsurance={handleAddInsurance} 
      />

      <Dialog open={isImportInsuranceOpen} onOpenChange={setIsImportInsuranceOpen}>
        <InsuranceImportModal 
          onClose={() => setIsImportInsuranceOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default InsuranceTab;
