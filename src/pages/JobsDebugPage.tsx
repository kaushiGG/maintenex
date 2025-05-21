import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { toast } from 'sonner';

const JobsDebugPage = () => {
  const { user, signOut } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(name, address)
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) {
          console.error('Error fetching jobs:', error);
          toast.error('Failed to load jobs');
          return;
        }
        
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Filter jobs based on the filter text
  const filteredJobs = jobs.filter(job => {
    const searchString = filterText.toLowerCase();
    
    const assigned_to = (job.assigned_to || '').toLowerCase();
    const title = (job.title || '').toLowerCase();
    const description = (job.description || '').toLowerCase();
    const service_type = (job.service_type || '').toLowerCase();
    
    return assigned_to.includes(searchString) || 
           title.includes(searchString) || 
           description.includes(searchString) || 
           service_type.includes(searchString);
  });
  
  // Function to check if this job is likely assigned to the current user
  const isLikelyAssignedToUser = (job: any) => {
    if (!user || !userProfile) return false;
    
    const assigned_to = String(job.assigned_to || '').toLowerCase();
    
    // Check possible matches
    const userId = user.id.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const firstName = (userProfile.first_name || '').toLowerCase();
    const lastName = (userProfile.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    
    return assigned_to === userId || 
           assigned_to === email || 
           assigned_to === fullName ||
           assigned_to.includes(firstName) || 
           assigned_to.includes(lastName) ||
           assigned_to.includes(email.split('@')[0]);
  };
  
  const handleCreateTestJob = async () => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }
    
    // Use the user's profile data for the assigned_to field
    const fullName = userProfile ? 
      `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '';
    const assigned_to = fullName || user.email || user.id;
    
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            title: `Test Job for ${assigned_to}`,
            description: 'This is a test job created for debugging purposes',
            service_type: 'Test & Tag',
            priority: 'medium',
            status: 'pending',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            assigned_to: assigned_to,
            created_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) {
        console.error('Error creating test job:', error);
        toast.error('Failed to create test job');
        return;
      }
      
      toast.success('Test job created successfully!');
      
      // Refresh job list
      window.location.reload();
    } catch (error) {
      console.error('Error in handleCreateTestJob:', error);
      toast.error('An error occurred while creating the test job');
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        userRole="business" 
        handleLogout={handleLogout} 
        title="Jobs Debug"
        portalType="business"
        switchRole={() => {}}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="business"
        />
        
        <main className="flex-1 p-4 bg-gray-50 overflow-x-hidden">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>User ID:</strong> {user?.id}</div>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>First Name:</strong> {userProfile?.first_name}</div>
                <div><strong>Last Name:</strong> {userProfile?.last_name}</div>
                <div><strong>Full Name:</strong> {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : ''}</div>
                
                <div className="mt-4">
                  <Button onClick={handleCreateTestJob} className="bg-green-600 hover:bg-green-700">
                    Create Test Job Assigned to Me
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-4">
            <Input
              placeholder="Filter jobs by title, description, service type, or assigned_to"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-xl"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card key={job.id} className={`hover:shadow-md transition-shadow ${isLikelyAssignedToUser(job) ? 'border-pretance-purple border-2' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                      <div className="text-sm text-gray-500">ID: {job.id}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div><strong>Assigned To:</strong> {job.assigned_to || 'Not assigned'}</div>
                      <div><strong>Service Type:</strong> {job.service_type || 'N/A'}</div>
                      <div><strong>Status:</strong> {job.status || 'Unknown'}</div>
                      <div><strong>Due Date:</strong> {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'N/A'}</div>
                      <div><strong>Site:</strong> {job.sites?.name || 'Unknown site'}</div>
                      <div><strong>Address:</strong> {job.sites?.address || 'No address'}</div>
                      <div><strong>Description:</strong> {job.description || 'No description'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No jobs matching your filter criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobsDebugPage; 