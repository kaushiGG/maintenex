import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContractorsLayout from './ContractorsLayout';
import { ContractorsTabs } from './ContractorsTabs';
import { ContractorsTable } from './ContractorsTable';
import AddContractorDialog from './AddContractorDialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TestATagService from '../services/test-a-tag/TestATagService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus, FileText, Shield, Plus, Upload } from 'lucide-react';
import LicensesTab from './tabs/LicensesTab';
import InsuranceTab from './tabs/InsuranceTab';

interface Contractor {
  id: string;
  name: string;
  service_type: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  auth_id?: string;
  created_at?: string;
  credentials?: string;
  job_title?: string;
  notes?: string;
  owner_id?: string;
  updated_at?: string;
}

export const ContractorsManagement = () => {
  const location = useLocation();
  const isTestATagService = location.pathname.includes('/test-a-tag');
  const isEmergencyExitService = location.pathname.includes('/emergency-exit');
  const [activeTab, setActiveTab] = useState('contractors');
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isImportContractorsOpen, setIsImportContractorsOpen] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contractors')
        .select('*');

      if (error) throw error;

      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast.error('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContractor = async (contractor: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .insert([contractor])
        .select()
        .single();

      if (error) throw error;

      setContractors([...contractors, data]);
      toast.success('Contractor added successfully');
      setIsAddContractorOpen(false);
    } catch (error) {
      console.error('Error adding contractor:', error);
      toast.error('Failed to add contractor');
    }
  };

  const handleUpdateContractor = async (id: string, updates: Partial<Contractor>) => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContractors(contractors.map(c => c.id === id ? data : c));
      toast.success('Contractor updated successfully');
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast.error('Failed to update contractor');
    }
  };

  const handleDeleteContractor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContractors(contractors.filter(c => c.id !== id));
      toast.success('Contractor deleted successfully');
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast.error('Failed to delete contractor');
    }
  };

  const handleViewContractor = (id: string) => {
    // Implementation of handleViewContractor
  };

  const handleEditContractor = (id: string) => {
    // Implementation of handleEditContractor
  };

  if (isTestATagService || isEmergencyExitService) {
    return (
      <ContractorsLayout>
        {isTestATagService ? <TestATagService /> : null}
        {isEmergencyExitService ? <TestATagService /> : null}
      </ContractorsLayout>
    );
  }

  return (
    <ContractorsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contractors Management</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddContractorOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add Contractor
            </Button>
          </div>
        </div>

        <ContractorsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'contractors' && (
            <ContractorsTable
              contractors={contractors}
              loading={loading}
              onView={handleViewContractor}
              onEdit={handleEditContractor}
              onDelete={handleDeleteContractor}
            />
          )}

          {activeTab === 'licenses' && (
            <LicensesTab />
          )}

          {activeTab === 'insurance' && (
            <InsuranceTab />
          )}
        </div>
      </div>

      <AddContractorDialog
        open={isAddContractorOpen}
        onOpenChange={setIsAddContractorOpen}
        onAdd={handleAddContractor}
      />
    </ContractorsLayout>
  );
};

export default ContractorsManagement;
