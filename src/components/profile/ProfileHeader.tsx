
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Star, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ProfileHeader = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Contractor",
    location: "",
    rating: 0,
    completedJobs: 0,
    verificationStatus: "Pending",
    availabilityStatus: "Available"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch contractor data
        const { data: contractorData, error: contractorError } = await supabase
          .from('contractors')
          .select('id, name, service_type, location, rating, status')
          .eq('auth_id', user.id)
          .single();
        
        if (contractorError) throw contractorError;
        
        // Fetch completed jobs count
        const { count, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('contractor_id', contractorData.id)
          .eq('status', 'completed');
        
        if (jobsError) throw jobsError;
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfileData({
          name: contractorData.name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
          title: contractorData.service_type || "Contractor",
          location: contractorData.location || "",
          rating: contractorData.rating || 0,
          completedJobs: count || 0,
          verificationStatus: contractorData?.status === "Active" ? "Verified" : "Pending",
          availabilityStatus: contractorData?.status === "Active" ? "Available" : "Unavailable"
        });
      } catch (error) {
        console.error("Error fetching profile header data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  return (
    <Card className="w-full overflow-hidden">
      <div className="bg-forgemate-purple/10 h-32 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 bg-white/80 hover:bg-white"
        >
          <Camera size={18} />
        </Button>
      </div>
      
      <CardContent className="pt-0 px-6">
        <div className="flex flex-col md:flex-row -mt-14 items-start md:items-end gap-4">
          <Avatar className="h-28 w-28 border-4 border-white bg-white">
            <AvatarFallback className="text-2xl bg-forgemate-purple text-white">
              {loading ? '...' : (profileData.name.split(' ').map(n => n[0]).join('') || 'C')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col justify-end pt-2 md:pt-0">
            <h2 className="text-2xl font-bold">{loading ? 'Loading...' : profileData.name}</h2>
            <p className="text-gray-600">{loading ? '...' : profileData.title}</p>
            
            {!loading && profileData.location && (
              <div className="flex items-center mt-1 text-gray-600">
                <MapPin size={16} className="mr-1" />
                <span className="text-sm">{profileData.location}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="bg-forgemate-purple/5 flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span>{loading ? '...' : `${profileData.rating} Rating`}</span>
              </Badge>
              
              <Badge variant="outline" className="bg-forgemate-purple/5 flex items-center gap-1">
                <CheckCircle2 size={14} className="text-green-500" />
                <span>{loading ? '...' : `${profileData.completedJobs} Jobs Completed`}</span>
              </Badge>
              
              <Badge variant="outline" className="bg-forgemate-purple/5 flex items-center gap-1">
                <Award size={14} className="text-blue-500" />
                <span>{loading ? '...' : profileData.verificationStatus}</span>
              </Badge>
              
              <Badge className={`flex items-center gap-1 ${profileData.availabilityStatus === 'Available' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <span>{loading ? '...' : profileData.availabilityStatus}</span>
              </Badge>
            </div>
          </div>
          
          <div className="ml-auto mt-4 md:mt-0">
            <Button>Update Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
