import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  UserCog, 
  Shield, 
  ArrowUpDown, 
  Users,
  ClipboardList,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_approved: boolean;
  company?: string | null;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_safety_officer: boolean;
  status: string;
}

interface SafetyOfficer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  equipment_count: number;
  created_at: string;
}

interface EquipmentCount {
  employee_id: string;
  count: number;
}

const SafetyOfficersPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [safetyOfficers, setSafetyOfficers] = useState<SafetyOfficer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof SafetyOfficer>('first_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSafetyOfficers();
  }, [sortColumn, sortDirection]);

  const fetchSafetyOfficers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Get employees from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'employee');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(`Failed to fetch profiles: ${profilesError.message}`);
        return;
      }
      
      // Step 2: Get invitations to identify safety officers
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('invitation_type', 'employee')
        .eq('is_safety_officer', true);
      
      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        setError(`Failed to fetch invitations: ${invitationsError.message}`);
        return;
      }
      
      console.log('Safety officer invitations:', invitationsData);
      
      // Step 3: Find profiles that match safety officer invitations by email
      const safetyOfficerProfiles = profilesData.filter(profile => 
        invitationsData.some(invitation => invitation.email === profile.email)
      );
      
      console.log('Safety officer profiles:', safetyOfficerProfiles);
      
      // Step 4: Combine data
      const safetyOfficersData = safetyOfficerProfiles.map(profile => {
        const invitation = invitationsData.find(inv => inv.email === profile.email);
        
        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          role: invitation?.role || 'Safety Officer',
          department: invitation?.department || 'General',
          equipment_count: 0, // We'll update this in step 5
          created_at: profile.created_at
        };
      });
      
      // Step 5: Fetch equipment assignments (if any equipment table exists)
      try {
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('safety_manager_id, id');
          
        if (equipmentError && equipmentError.code !== '42P01') { // Not just a missing table error
          console.error('Error fetching equipment:', equipmentError);
        } else if (equipmentData) {
          // Count equipment per safety officer
          const counts: Record<string, number> = {};
          equipmentData.forEach(item => {
            if (item.safety_manager_id) {
              counts[item.safety_manager_id] = (counts[item.safety_manager_id] || 0) + 1;
            }
          });
          
          // Update equipment counts
          safetyOfficersData.forEach(officer => {
            officer.equipment_count = counts[officer.id] || 0;
          });
        }
      } catch (err) {
        console.log('Equipment table may not exist yet, ignoring:', err);
      }
      
      // Sort the data
      const sortedOfficers = [...safetyOfficersData].sort((a, b) => {
        const aValue = String(a[sortColumn] || '');
        const bValue = String(b[sortColumn] || '');
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      
      setSafetyOfficers(sortedOfficers);
    } catch (err: any) {
      console.error('Error in fetchSafetyOfficers:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof SafetyOfficer) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSafetyOfficers = safetyOfficers.filter(officer => 
    officer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewOfficerEquipment = (officerId: string) => {
    // Navigate to equipment page filtered by this safety officer
    navigate(`/equipment?safety_officer=${officerId}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleManageEmployees = () => {
    navigate('/employees');
  };

  return (
    <BusinessDashboardContent 
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Safety Officers</h1>
            <p className="text-muted-foreground">
              View and manage safety officers responsible for your equipment
            </p>
          </div>
          <Button onClick={handleManageEmployees} variant="outline" className="w-full md:w-auto">
            <Users className="mr-2 h-4 w-4" /> Manage All Employees
          </Button>
        </div>

        {/* Error message if any */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safety Officers
            </CardTitle>
            <CardDescription>
              Employees designated as safety officers within your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search safety officers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchSafetyOfficers}>
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredSafetyOfficers.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No safety officers found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm ? 'Try adjusting your search term' : 'Add safety officers by inviting employees'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/employees/invitations')} 
                  className="mt-4"
                >
                  Invite Safety Officers
                </Button>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/20"
                        onClick={() => handleSort('first_name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortColumn === 'first_name' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/20"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">
                          Role
                          {sortColumn === 'role' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/20"
                        onClick={() => handleSort('department')}
                      >
                        <div className="flex items-center">
                          Department
                          {sortColumn === 'department' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Equipment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSafetyOfficers.map((officer) => (
                      <TableRow key={officer.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {officer.first_name} {officer.last_name}
                            <Badge variant="outline" className="flex items-center gap-1 border-green-200 text-green-700 bg-green-50">
                              <Shield className="h-3 w-3" />
                              Safety Officer
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{officer.role || "Safety Officer"}</TableCell>
                        <TableCell>{officer.department || "General"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center text-sm">
                              <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              {officer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOfficerEquipment(officer.id)}
                            className="hover:bg-green-50"
                          >
                            <span className="mr-1 text-muted-foreground">{officer.equipment_count}</span>
                            <ClipboardList className="h-4 w-4 text-green-700" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessDashboardContent>
  );
};

export default SafetyOfficersPage; 