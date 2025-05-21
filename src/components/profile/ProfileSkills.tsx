import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Award, Calendar, Ribbon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { updateSkills } from '@/services/profileService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ProfileSkills = () => {
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAddCertificationOpen, setIsAddCertificationOpen] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiry: ''
  });
  
  const [certifications, setCertifications] = useState([
    { 
      name: 'Licensed Plumber', 
      issuer: 'Victorian Building Authority', 
      date: '2010-05-15',
      expiry: '2025-05-15' 
    },
    { 
      name: 'Electrical License A Grade', 
      issuer: 'Energy Safe Victoria', 
      date: '2012-03-10',
      expiry: '2024-03-10' 
    },
    { 
      name: 'Working at Heights', 
      issuer: 'SafeWork Australia', 
      date: '2021-11-05',
      expiry: '2024-11-05' 
    }
  ]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('contractors')
          .select('skills')
          .eq('auth_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data && data.skills) {
          setSkills(data.skills);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  const handleAddSkill = async () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setNewSkill('');
      setSkills(updatedSkills);
      
      try {
        setUpdating(true);
        await updateSkills(updatedSkills);
      } catch (error) {
        console.error("Error saving skill:", error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    
    try {
      setUpdating(true);
      await updateSkills(updatedSkills);
    } catch (error) {
      console.error("Error removing skill:", error);
      // Restore the skill if the update fails
      setSkills(prev => [...prev, skillToRemove]);
      toast.error("Failed to remove skill");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.date) {
      // Add expiry date if not provided (default to 1 year from issue date)
      if (!newCertification.expiry) {
        const issueDate = new Date(newCertification.date);
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        newCertification.expiry = expiryDate.toISOString().split('T')[0];
      }
      
      setCertifications([...certifications, { ...newCertification }]);
      setIsAddCertificationOpen(false);
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        expiry: ''
      });
      toast.success('Certification added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleRemoveCertification = (index: number) => {
    const updatedCertifications = [...certifications];
    updatedCertifications.splice(index, 1);
    setCertifications(updatedCertifications);
    toast.success('Certification removed successfully');
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Award size={20} className="text-pretance-purple" />
              Professional Skills
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add skills that showcase your expertise to potential clients
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading skills...</p>
            ) : skills.length === 0 ? (
              <p className="text-sm text-gray-500">No skills added yet</p>
            ) : (
              skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-sm py-1.5 px-3">
                  {skill}
                  <button 
                    className="ml-2 hover:text-red-500" 
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={updating}
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Add a new skill..." 
              value={newSkill} 
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
              disabled={updating}
            />
            <Button 
              onClick={handleAddSkill} 
              className="shrink-0"
              disabled={updating || !newSkill.trim()}
            >
              <Plus size={18} className="mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Ribbon size={20} className="text-pretance-purple" />
              Licenses & Insurance
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Track your professional licenses, insurance policies and qualifications
            </p>
          </div>
          
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between">
                  <h4 className="font-medium">{cert.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                    onClick={() => handleRemoveCertification(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{cert.issuer}</p>
                
                <div className="flex items-center gap-x-6 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Issued: {new Date(cert.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Expires: {new Date(cert.expiry).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsAddCertificationOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            Add New Certification
          </Button>
        </CardFooter>
      </Card>

      {/* Add Certification Dialog */}
      <Dialog open={isAddCertificationOpen} onOpenChange={setIsAddCertificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Certification</DialogTitle>
            <DialogDescription>
              Enter the details of your new license or certification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Certification Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={newCertification.name}
                onChange={handleCertificationChange}
                placeholder="e.g., Licensed Plumber"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="issuer">Issuing Authority <span className="text-red-500">*</span></Label>
              <Input
                id="issuer"
                name="issuer"
                value={newCertification.issuer}
                onChange={handleCertificationChange}
                placeholder="e.g., Victorian Building Authority"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Issue Date <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newCertification.date}
                onChange={handleCertificationChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                name="expiry"
                type="date"
                value={newCertification.expiry}
                onChange={handleCertificationChange}
                placeholder="Leave blank for annual renewal"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCertificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCertification}>
              Add Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSkills;
