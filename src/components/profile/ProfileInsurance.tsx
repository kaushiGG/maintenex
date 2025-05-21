import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Insurance {
  id: string;
  contractor_name: string;
  insurance_type: string;
  provider: string;
  policy_number: string;
  coverage: string;
  issue_date: string;
  expiry_date: string;
  notes: string | null;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const insuranceTypes = [
  "Public Liability",
  "Professional Indemnity",
  "Workers Compensation",
  "Vehicle Insurance",
  "Property Insurance",
  "General Liability",
  "Other"
];

const ProfileInsurance = () => {
  const { user } = useAuth();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [newInsurance, setNewInsurance] = useState({
    contractor_name: '',
    insurance_type: '',
    policy_number: '',
    provider: '',
    issue_date: '',
    expiry_date: '',
    coverage: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInsurances();
      fetchCompanyName();
      fetchContractorId();
    }
  }, [user]);

  const fetchInsurances = async () => {
    try {
      const { data, error } = await supabase
        .from('contractor_insurance')
        .select('*')
        .eq('owner_id', user?.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInsurances(data || []);
    } catch (error) {
      console.error('Error fetching insurances:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyName = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching company name');
      return;
    }
    
    try {
      console.log('Fetching company name for user:', user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load company name. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Profile data fetched:', profileData);

      // Use type assertion since we know the field exists
      const profile = profileData as unknown as { company: string | null };
      if (profile?.company) {
        console.log('Company name found:', profile.company);
        setCompanyName(profile.company);
        setNewInsurance(prev => ({ ...prev, contractor_name: profile.company }));
      } else {
        console.warn('No company name found in profile. Profile data:', profileData);
        toast({
          title: "Warning",
          description: "Please update your company name in your profile first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchCompanyName:', error);
      toast({
        title: "Error",
        description: "Failed to load company name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchContractorId = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching contractor ID:', error);
        return null;
      }

      if (data) {
        console.log('Found contractor ID:', data.id);
        setContractorId(data.id);
        return data.id;
      } else {
        console.warn('No contractor found for user:', user.id);
        return null;
      }
    } catch (err) {
      console.error('Exception fetching contractor ID:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user?.id && !companyName) {
      console.log('Initiating company name fetch');
      fetchCompanyName();
    }
  }, [user, companyName]);

  const handleDialogOpen = () => {
    if (!companyName) {
      console.log('Company name not found, fetching before opening dialog');
      fetchCompanyName();
    }
    setIsDialogOpen(true);
  };

  const handleAddInsurance = async () => {
    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (!companyName) {
      toast({
        title: "Error",
        description: "Company name is required. Please update your profile first.",
        variant: "destructive",
      });
      return;
    }

    let contractorIdToUse = contractorId;
    if (!contractorIdToUse) {
      contractorIdToUse = await fetchContractorId();
      if (!contractorIdToUse) {
        toast({
          title: "Error",
          description: "Contractor profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      console.log('Adding new insurance with data:', {
        contractor_id: contractorIdToUse,
        contractor_name: companyName,
        insurance_type: newInsurance.insurance_type,
        policy_number: newInsurance.policy_number,
        provider: newInsurance.provider,
        issue_date: newInsurance.issue_date,
        expiry_date: newInsurance.expiry_date,
        coverage: newInsurance.coverage,
        notes: newInsurance.notes,
        owner_id: user.id,
        status: 'active'
      });

      const { data: contractorCheck, error: contractorCheckError } = await supabase
        .from('contractors')
        .select('id')
        .eq('id', contractorIdToUse)
        .single();
      
      if (contractorCheckError || !contractorCheck) {
        console.error('Contractor verification failed:', contractorCheckError);
        toast({
          title: "Error",
          description: "The contractor ID is invalid. Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Verified contractor ID exists:', contractorCheck);

      const { data, error } = await supabase
        .from('contractor_insurance')
        .insert({
          contractor_id: contractorIdToUse,
          contractor_name: companyName,
          insurance_type: newInsurance.insurance_type,
          policy_number: newInsurance.policy_number,
          provider: newInsurance.provider,
          issue_date: newInsurance.issue_date,
          expiry_date: newInsurance.expiry_date,
          coverage: newInsurance.coverage,
          notes: newInsurance.notes || '',
          owner_id: user.id,
          status: 'active'
        } as any) // Use type assertion to bypass schema validation
        .select();

      if (error) {
        console.error('Error adding insurance:', error);
        throw error;
      }

      console.log('Insurance successfully added:', data);
      
      // Update the UI with the new insurance
      if (data && data.length > 0) {
        setInsurances([...insurances, data[0] as unknown as Insurance]);
      } else {
        // If no data returned, refresh all insurances
        await fetchInsurances();
      }
      
      setIsDialogOpen(false);
      setNewInsurance({
        contractor_name: companyName,
        insurance_type: '',
        policy_number: '',
        provider: '',
        issue_date: '',
        expiry_date: '',
        coverage: '',
        notes: '',
      });

      toast({ 
        title: "Success", 
        description: "Insurance added successfully" 
      });
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast({ 
        title: "Error", 
        description: "Failed to add insurance. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleRemoveInsurance = async (insuranceId: string) => {
    try {
      const { error } = await supabase
        .from('contractor_insurance')
        .delete()
        .eq('id', insuranceId);

      if (error) throw error;

      setInsurances(insurances.filter(insurance => insurance.id !== insuranceId));
      toast({
        title: "Success",
        description: "Insurance removed successfully",
      });
    } catch (error) {
      console.error('Error removing insurance:', error);
      toast({
        title: "Error",
        description: "Failed to remove insurance. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Insurance</h2>
        <Button onClick={handleDialogOpen} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Insurance
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading insurance details...</div>
      ) : insurances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No insurance details added yet.</p>
            <p className="text-sm">Click "Add New Insurance" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insurances.map((insurance) => (
            <Card key={insurance.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{insurance.insurance_type}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInsurance(insurance.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-500">Provider</Label>
                    <p>{insurance.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Policy Number</Label>
                    <p>{insurance.policy_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Coverage</Label>
                    <p>{insurance.coverage}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Issue Date</Label>
                      <p>{new Date(insurance.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Expiry Date</Label>
                      <p>{new Date(insurance.expiry_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {insurance.notes && (
                    <div>
                      <Label className="text-sm text-gray-500">Notes</Label>
                      <p className="text-sm">{insurance.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Insurance</DialogTitle>
            <DialogDescription>
              Enter your insurance details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contractor_name">Company Name</Label>
              <Input
                id="contractor_name"
                value={companyName || "Loading..."}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="insurance_type">Insurance Type</Label>
              <Select
                value={newInsurance.insurance_type}
                onValueChange={(value) => setNewInsurance({ ...newInsurance, insurance_type: value })}
              >
                <SelectTrigger id="insurance_type">
                  <SelectValue placeholder="Select insurance type" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policy_number">Policy Number</Label>
              <Input
                id="policy_number"
                value={newInsurance.policy_number}
                onChange={(e) => setNewInsurance({ ...newInsurance, policy_number: e.target.value })}
                placeholder="Enter policy number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Insurance Provider</Label>
              <Input
                id="provider"
                value={newInsurance.provider}
                onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
                placeholder="Enter insurance provider"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coverage">Coverage</Label>
              <Input
                id="coverage"
                value={newInsurance.coverage}
                onChange={(e) => setNewInsurance({ ...newInsurance, coverage: e.target.value })}
                placeholder="Enter coverage details"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={newInsurance.issue_date}
                  onChange={(e) => setNewInsurance({ ...newInsurance, issue_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={newInsurance.expiry_date}
                  onChange={(e) => setNewInsurance({ ...newInsurance, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newInsurance.notes}
                onChange={(e) => setNewInsurance({ ...newInsurance, notes: e.target.value })}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddInsurance}
              disabled={!companyName}
            >
              Add Insurance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileInsurance;
