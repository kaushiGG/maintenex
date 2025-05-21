import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserCheck, Building } from 'lucide-react';

// Simple interface for user profiles
interface Profile {
  id: string;
  email?: string | null;
  user_type?: string | null;
  is_approved?: boolean | null;
  first_name?: string | null;
  last_name?: string | null;
}

export default function UserApproval() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      console.log('Loading user profiles for approval...');
      
      // Query all profiles (contractors and employees), prioritizing unapproved users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, user_type, is_approved, first_name, last_name')
        .in('user_type', ['contractor', 'employee'])
        .order('is_approved', { ascending: true })  // Unapproved first
        .order('created_at', { ascending: false });  // Newest first

      if (error) {
        console.error('Error loading profiles:', error);
        toast('Failed to load profiles', {
          description: error.message,
        });
        return;
      }

      console.log('User profiles loaded:', data?.length, 'profiles found');
      console.log('Unapproved users:', data?.filter(p => !p.is_approved).length);
      setProfiles(data || []);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profiles';
      console.error('Error in loadProfiles:', error);
      toast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      console.log('Approving user:', id);
      console.log('Current user ID:', user?.id);
      
      // Get profile to show proper message
      const profileToApprove = profiles.find(p => p.id === id);
      const userType = profileToApprove?.user_type === 'contractor' ? 'contractor' : 'employee';
      
      // Log user type to verify business user
      const { data: currentUserData, error: userError } = await supabase
        .from('profiles')
        .select('user_type, is_approved')
        .eq('id', user?.id)
        .single();
        
      if (userError) {
        console.error('Error fetching current user data:', userError);
      } else {
        console.log('Current user data:', currentUserData);
      }
      
      const updateData = { 
        is_approved: true,
        approval_date: new Date().toISOString(),
        approved_by: user?.id
      };
      
      console.log('Update data to be applied:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error approving ${userType}:`, error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        toast(`Failed to approve ${userType}`, {
          description: error.message,
        });
        return;
      }

      console.log('Update response:', data);
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === id ? { 
          ...profile, 
          is_approved: true 
        } : profile
      ));

      // Show success message
      toast(`${userType === 'contractor' ? 'Contractor' : 'Employee'} approved successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve user';
      console.error('Error in handleApprove:', error);
      toast(errorMessage);
    }
  };

  // Filter profiles based on the active tab
  const filteredProfiles = profiles.filter(profile => {
    if (activeTab === 'all') return true;
    if (activeTab === 'contractors') return profile.user_type === 'contractor';
    if (activeTab === 'employees') return profile.user_type === 'employee';
    if (activeTab === 'pending') return !profile.is_approved;
    return true;
  });

  return (
    <div className="p-6 bg-white text-black">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-black">User Approval Management</h1>
        <p className="text-gray-600">Manage approval status for contractors and employees</p>
      </div>

      <Card className="border-gray-200 bg-white text-black shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-black">User Approval Management</CardTitle>
          <CardDescription className="text-gray-600">
            Manage approval status for contractors and employees
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-gray-100 border border-gray-200">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-700">
                <User className="h-4 w-4 mr-2" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="contractors" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-700">
                <Building className="h-4 w-4 mr-2" />
                Contractors
              </TabsTrigger>
              <TabsTrigger value="employees" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-700">
                <UserCheck className="h-4 w-4 mr-2" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-700">
                Pending Approval
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profiles...</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-b border-gray-200 hover:bg-gray-50/80">
                        <TableHead className="text-gray-700">Name</TableHead>
                        <TableHead className="text-gray-700">Email</TableHead>
                        <TableHead className="text-gray-700">User Type</TableHead>
                        <TableHead className="text-gray-700">Status</TableHead>
                        <TableHead className="text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <TableRow key={profile.id} className="border-b border-gray-200 hover:bg-gray-50/30">
                          <TableCell className="text-black">
                            {profile.first_name || ''} {profile.last_name || ''}
                          </TableCell>
                          <TableCell className="text-black">{profile.email || ''}</TableCell>
                          <TableCell className="capitalize text-black">{profile.user_type || ''}</TableCell>
                          <TableCell>
                            <Badge className={`${profile.is_approved ? 'bg-green-600' : 'bg-orange-500'} text-white`}>
                              {profile.is_approved ? "Approved" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!profile.is_approved && (
                              <Button
                                className="bg-white hover:bg-orange-500 hover:text-white text-black border border-gray-200"
                                size="sm"
                                onClick={() => handleApprove(profile.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-600">No profiles found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
