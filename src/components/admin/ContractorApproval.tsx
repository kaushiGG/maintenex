import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";

interface ContractorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  role: string;
  is_approved: boolean;
  approval_date: string | null;
  created_at: string;
  user_type: string;
}

const ContractorApproval = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserType(data?.user_type || null);
      } catch (error) {
        console.error('Error fetching user type:', error);
      }
    };
    
    fetchUserType();
  }, [user]);

  useEffect(() => {
    const fetchContractors = async () => {
      if (!user || userType !== 'business') return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'contractor')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map the data to include email from auth.users if needed
        const contractorsWithEmail = await Promise.all(
          (data || []).map(async (contractor: any) => {
            // Get email from auth.users if not in profiles
            if (!contractor.email) {
              const { data: userData } = await supabase.auth.admin.getUserById(contractor.id);
              return {
                ...contractor,
                email: userData?.user?.email || 'N/A'
              };
            }
            return contractor;
          })
        );
        
        setContractors(contractorsWithEmail as ContractorProfile[]);
      } catch (error) {
        console.error('Error fetching contractors:', error);
        toast.error('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractors();
  }, [user, userType]);

  const handleApprove = async (contractorId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: true,
          approval_date: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', contractorId);
        
      if (error) throw error;
      
      // Update local state
      setContractors(prev => 
        prev.map(contractor => 
          contractor.id === contractorId 
            ? { 
                ...contractor, 
                is_approved: true, 
                approval_date: new Date().toISOString() 
              } 
            : contractor
        )
      );
      
      toast.success('Contractor approved successfully');
    } catch (error) {
      console.error('Error approving contractor:', error);
      toast.error('Failed to approve contractor');
    }
  };

  const handleReject = async (contractorId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: false,
          approval_date: null,
          approved_by: null
        })
        .eq('id', contractorId);
        
      if (error) throw error;
      
      // Update local state
      setContractors(prev => 
        prev.map(contractor => 
          contractor.id === contractorId 
            ? { 
                ...contractor, 
                is_approved: false, 
                approval_date: null 
              } 
            : contractor
        )
      );
      
      toast.success('Contractor rejected successfully');
    } catch (error) {
      console.error('Error rejecting contractor:', error);
      toast.error('Failed to reject contractor');
    }
  };

  if (userType !== 'business') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Only business users can access this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contractor Approval</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading contractors...</p>
        ) : contractors.length === 0 ? (
          <p>No contractors found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractors.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell>{`${contractor.first_name} ${contractor.last_name}`}</TableCell>
                  <TableCell>{contractor.email || 'N/A'}</TableCell>
                  <TableCell>{contractor.phone || 'N/A'}</TableCell>
                  <TableCell>{contractor.company_name || 'N/A'}</TableCell>
                  <TableCell>{contractor.role || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={contractor.is_approved ? "default" : "destructive"}>
                      {contractor.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contractor.is_approved ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(contractor.id)}
                      >
                        Reject
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleApprove(contractor.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractorApproval; 