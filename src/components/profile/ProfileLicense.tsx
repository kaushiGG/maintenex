import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface that matches the database table structure
interface DbLicense {
  id: string;
  contractor_id: string;
  owner_id?: string;
  contractor_name: string;  // Database uses contractor_name, not name
  license_type: string;
  license_number: string;
  provider: string;  // Changed from issuing_authority
  issue_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

// List of license types for the dropdown
const licenseTypes = [
  "Electrical License",
  "Plumbing License",
  "HVAC License",
  "General Contractor License",
  "Roofing License",
  "Painting License",
  "Carpentry License",
  "Masonry License",
  "Landscaping License",
  "Other"
];

export default function ProfileLicense() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<DbLicense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    name: '',
    license_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [contractorId, setContractorId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchLicenses();
      fetchContractorInfo();
    }
  }, [user]);

  const fetchLicenses = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    // First, get the contractor ID if not already available
    if (!contractorId) {
      try {
        const { data: contractorData, error: contractorError } = await supabase
          .from('contractors')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (contractorError) {
          console.error('Error fetching contractor ID:', contractorError);
          setLoading(false);
          return;
        }

        if (contractorData) {
          console.log('Contractor ID found:', contractorData.id);
          setContractorId(contractorData.id);
          
          // Now fetch licenses with the contractor ID
          await fetchLicensesWithContractorId(contractorData.id);
        } else {
          console.warn('No contractor found for user:', user.id);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting contractor ID:', error);
        setLoading(false);
      }
    } else {
      // If we already have the contractor ID, use it directly
      await fetchLicensesWithContractorId(contractorId);
    }
  };

  const fetchLicensesWithContractorId = async (id: string) => {
    console.log('Fetching licenses for contractor:', id);
    try {
      const { data, error } = await supabase
        .from('contractor_licenses')
        .select('*')
        .eq('contractor_id', id)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched licenses:', data);
      setLicenses((data as unknown) as DbLicense[] || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: "Error",
        description: "Failed to load licenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContractorInfo = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching contractor info');
      return;
    }
    
    try {
      console.log('Fetching contractor info for user:', user.id);
      // First get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Profile data fetched:', profileData);

      // Get the company name
      const profile = profileData as unknown as { company: string | null };
      if (profile?.company) {
        console.log('Company name found:', profile.company);
        setCompanyName(profile.company);
      } else {
        console.warn('No company name found in profile. Profile data:', profileData);
        toast({
          title: "Warning",
          description: "Please update your company name in your profile first.",
          variant: "destructive",
        });
      }

      // Debug: Directly run a query to check existing contractors for this user
      const { data: debugData, error: debugError } = await supabase
        .from('contractors')
        .select('id, owner_id, company_name')
        .eq('owner_id', user.id);
      
      console.log('Debug contractor info:', debugData, debugError);

      // Now fetch the contractor ID using the user ID
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (contractorError) {
        console.error('Error fetching contractor ID:', contractorError);
        
        // Debug: show alternative query for contractors
        const { data: allContractors, error: allError } = await supabase
          .from('contractors')
          .select('id, owner_id, company_name')
          .limit(10);
        
        console.log('All contractors (first 10):', allContractors, allError);
        
        toast({
          title: "Warning",
          description: "Could not find your contractor profile. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (contractorData) {
        console.log('Contractor ID found:', contractorData.id);
        setContractorId(contractorData.id);
      } else {
        console.warn('No contractor found for user:', user.id);
        toast({
          title: "Warning",
          description: "Please complete your contractor profile setup first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchContractorInfo:', error);
      toast({
        title: "Error",
        description: "Failed to load contractor information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogOpen = () => {
    if (!companyName) {
      console.log('Company name not found, fetching before opening dialog');
      fetchContractorInfo();
    }
    setIsDialogOpen(true);
  };

  const resetLicenseForm = () => {
    setNewLicense({
      name: '',
      license_number: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      notes: ''
    });
  };

  const handleAddLicense = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add a license.",
        variant: "destructive",
      });
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

    if (!contractorId) {
      toast({
        title: "Error",
        description: "Contractor profile not found. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Double-check that the contractor actually exists
      const { data: contractorCheck, error: contractorCheckError } = await supabase
        .from('contractors')
        .select('id')
        .eq('id', contractorId)
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
      
      // Include contractor_name which is required (has NOT NULL constraint)
      const licenseData = {
        contractor_id: contractorId,
        contractor_name: companyName, // Required field with NOT NULL constraint
        license_type: newLicense.name,
        license_number: newLicense.license_number,
        provider: newLicense.issuing_authority,
        issue_date: newLicense.issue_date,
        expiry_date: newLicense.expiry_date,
        status: 'active'
      };

      console.log('Adding new license with required fields:', licenseData);
      
      // Use direct table insert with all required fields
      const { data, error } = await supabase
        .from('contractor_licenses')
        .insert(licenseData as any)
        .select();

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      console.log('License successfully added:', data);
      
      // Refresh licenses from server to ensure we have the latest data
      await fetchLicenses();
      
      setIsDialogOpen(false);
      resetLicenseForm();

      toast({
        title: "Success",
        description: "License added successfully",
      });
    } catch (error) {
      console.error('Error adding license:', error);
      toast({
        title: "Error",
        description: "Failed to add license. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLicense = async (licenseId: string) => {
    try {
      const { error } = await supabase
        .from('contractor_licenses')
        .delete()
        .eq('id', licenseId);

      if (error) throw error;

      setLicenses(licenses.filter(license => license.id !== licenseId));
      toast({
        title: "Success",
        description: "License removed successfully",
      });
    } catch (error) {
      console.error('Error removing license:', error);
      toast({
        title: "Error",
        description: "Failed to remove license. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Licenses</h2>
        <Button onClick={handleDialogOpen} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New License
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading licenses...</div>
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No licenses added yet.</p>
            <p className="text-sm">Click "Add New License" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{license.license_type}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLicense(license.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-500">License Number</Label>
                    <p>{license.license_number}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Issue Date</Label>
                      <p>{new Date(license.issue_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Expiry Date</Label>
                      <p>{new Date(license.expiry_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      license.status === 'active' ? 'bg-green-100 text-green-800' :
                      license.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New License</DialogTitle>
            <DialogDescription>
              Enter your license details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={companyName || "Loading..."}
                disabled
                className="bg-gray-50"
              />
              {!companyName && (
                <p className="text-sm text-red-500 mt-1">
                  Please update your company name in your profile first.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license_type">License Type</Label>
              <Select
                value={newLicense.name}
                onValueChange={(value) => setNewLicense({ ...newLicense, name: value })}
              >
                <SelectTrigger id="license_type">
                  <SelectValue placeholder="Select a license type" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={newLicense.license_number}
                onChange={(e) => setNewLicense({ ...newLicense, license_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issuing_authority">Issuing Authority</Label>
              <Input
                id="issuing_authority"
                value={newLicense.issuing_authority}
                onChange={(e) => setNewLicense({ ...newLicense, issuing_authority: e.target.value })}
                placeholder="Enter issuing authority"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={newLicense.issue_date}
                  onChange={(e) => setNewLicense({ ...newLicense, issue_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={newLicense.expiry_date}
                  onChange={(e) => setNewLicense({ ...newLicense, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLicense.notes}
                onChange={(e) => setNewLicense({ ...newLicense, notes: e.target.value })}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                resetLicenseForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddLicense}
              disabled={!companyName || !newLicense.name || !newLicense.license_number || !newLicense.issue_date || !newLicense.expiry_date}
            >
              Add License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
