import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Building2, User, MapPin, Wrench } from 'lucide-react';
import { getProfileData, updateProfileData, ProfileData } from '@/services/profileService';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { serviceTypeOptions } from '@/components/contractors/schemas/contractor-form-schema';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Extended interface for form data
interface ExtendedProfileData extends ProfileData {
  serviceType?: string;
  location?: string; // Location is only for contractors table
}

const ProfileForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExtendedProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    serviceType: ""
  });
  const [contractorId, setContractorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getProfileData();
        if (data) {
          setFormData({
            ...data,
            serviceType: '',
            location: '' // Initialize location as empty string
          } as ExtendedProfileData);
          
          // Check if a contractor record exists for this user
          const { data: contractorData, error: contractorError } = await supabase
            .from('contractors')
            .select('id, name, service_type, contact_email, contact_phone, location')
            .eq('auth_id', user.id)
            .single();
            
          if (!contractorError && contractorData) {
            // Update form data with contractor information
            setFormData(prev => ({
              ...prev,
              serviceType: contractorData.service_type || '',
              phone: contractorData.contact_phone || '',
              location: contractorData.location || ''
            }));
            setContractorId(contractorData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data. Please try again later.");
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Update profile data (only phone and company fields)
      const { serviceType, location, ...profileData } = formData;
      await updateProfileData({
        ...profileData,
        phone: formData.phone,
        company: formData.company
      });
      
      // Update or create contractor record
      if (user) {
        if (contractorId) {
          // Update existing contractor
          const { error: updateError } = await supabase
            .from('contractors')
            .update({
              name: formData.company,
              service_type: formData.serviceType,
              contact_email: formData.email,
              contact_phone: formData.phone,
              location: formData.location,
              updated_at: new Date().toISOString()
            })
            .eq('id', contractorId);
            
          if (updateError) {
            console.error('Error updating contractor:', updateError);
            throw new Error('Failed to update contractor information');
          }
        } else {
          // Create new contractor
          const newContractorId = uuidv4();
          const { error: insertError } = await supabase
            .from('contractors')
            .insert({
              id: newContractorId,
              name: formData.company,
              service_type: formData.serviceType,
              contact_email: formData.email,
              contact_phone: formData.phone,
              location: formData.location,
              status: 'Active',
              auth_id: user.id,
              owner_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating contractor:', insertError);
            throw new Error('Failed to create contractor record');
          }
          
          setContractorId(newContractorId);
        }
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError("Failed to update profile. Please try again later.");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.firstName) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <p>Loading profile data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !formData.firstName) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col justify-center items-center h-40">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-forgemate-purple hover:bg-forgemate-dark text-white"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={formData.firstName} 
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail size={16} />
                <span>Email</span>
              </Label>
              <Input 
                id="email" 
                name="email" 
                value={formData.email} 
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone size={16} />
                <span>Phone</span>
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1">
                <Building2 size={16} />
                <span>Company Name</span>
              </Label>
              <Input 
                id="company" 
                name="company" 
                value={formData.company} 
                onChange={handleChange}
                placeholder="Enter your company name"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Location</span>
              </Label>
              <Input 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                placeholder="Enter your location"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="flex items-center gap-1">
                <Wrench size={16} />
                <span>Service Type</span>
              </Label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Select service type</option>
                {serviceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-forgemate-purple hover:bg-forgemate-dark text-white"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfileForm;
