import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Contractor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_approved: boolean;
  approval_date: string | null;
}

export function ContractorApproval() {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, is_approved, approval_date')
        .eq('user_type', 'contractor')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContractors(data || []);
    } catch (error) {
      console.error('Error loading contractors:', error);
      toast.error('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contractorId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          approval_date: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', contractorId);

      if (error) {
        throw error;
      }

      toast.success('Contractor approved successfully');
      loadContractors();
    } catch (error) {
      console.error('Error approving contractor:', error);
      toast.error('Failed to approve contractor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pretance-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contractor Approval</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contractors.map((contractor) => (
          <Card key={contractor.id}>
            <CardHeader>
              <CardTitle>
                {contractor.first_name} {contractor.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{contractor.email}</p>
              <div className="mt-4">
                {contractor.is_approved ? (
                  <div className="text-green-600">
                    Approved on {new Date(contractor.approval_date!).toLocaleDateString()}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleApprove(contractor.id)}
                    className="w-full"
                  >
                    Approve Contractor
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 