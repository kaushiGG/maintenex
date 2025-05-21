import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileSkills from '@/components/profile/ProfileSkills';
import ProfileAvailability from '@/components/profile/ProfileAvailability';
import ProfileLicense from '@/components/profile/ProfileLicense';
import ProfileInsurance from '@/components/profile/ProfileInsurance';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import UpcomingJobs from '@/components/contractor/dashboard/UpcomingJobs';
import { Card } from '@/components/ui/card';

const Profile = () => {
  // Mock logout function for the sidebar
  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar 
        handleLogout={handleLogout}
        portalType="contractor"
      />
      
      <div className="flex-1 p-6 pt-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <ProfileHeader />
        
        <Tabs defaultValue="personal" className="mt-8 w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="mt-6">
            <ProfileForm />
          </TabsContent>
          
          <TabsContent value="license" className="mt-6">
            <ProfileLicense />
          </TabsContent>
          
          <TabsContent value="insurance" className="mt-6">
            <ProfileInsurance />
          </TabsContent>
          
          <TabsContent value="availability" className="mt-6">
            <ProfileAvailability />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
};

export default Profile;
