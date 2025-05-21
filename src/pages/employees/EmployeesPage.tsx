import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  Users, 
  UserCheck, 
  UserCog, 
  Shield, 
  ArrowUpDown, 
  MoreHorizontal,
  Mail,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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

interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  department?: string;
  is_safety_officer: boolean;
  manager_name?: string;
  is_manager?: boolean;
}

const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Employee>('first_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Fetch employee data from profiles and invitations tables
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      // Query profiles table for employees (user_type = 'employee')
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'employee');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(`Failed to fetch profiles: ${profilesError.message}`);
        return;
      }
      
      // Query invitations table to get role information
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('invitation_type', 'employee');
      
      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        setError(`Failed to fetch invitations: ${invitationsError.message}`);
        return;
      }
      
      console.log('Profiles data:', profilesData);
      console.log('Invitations data:', invitationsData);
      
      // Combine data from both tables
      const combinedEmployees = profilesData.map(profile => {
        // Find matching invitation by email
        const invitation = invitationsData.find(inv => inv.email === profile.email);
        
        // Determine if this is a manager based on role
        const role = invitation?.role || 'Employee';
        const isManager = role.toLowerCase().includes('manager');
        
        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          role: role,
          department: invitation?.department || 'General',
          is_safety_officer: invitation?.is_safety_officer || false,
          is_manager: isManager,
        };
      });
      
      // Sort the combined data
      const sortedEmployees = [...combinedEmployees].sort((a, b) => {
        const aValue = String(a[sortColumn] || '');
        const bValue = String(b[sortColumn] || '');
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      
      setEmployees(sortedEmployees);
      setError(null);
    } catch (err: any) {
      console.error('Error in fetchEmployees:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort employees by column
  const handleSort = (column: keyof Employee) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter employees based on active tab and search query
  const getFilteredEmployees = () => {
    return employees.filter((employee) => {
      // Filter by tab
      if (activeTab === 'safety-officers' && !employee.is_safety_officer) return false;
      if (activeTab === 'managers' && !employee.is_manager) return false;
      if (activeTab === 'other-employees' && (employee.is_safety_officer || employee.is_manager)) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          employee.first_name?.toLowerCase().includes(query) ||
          employee.last_name?.toLowerCase().includes(query) ||
          employee.email?.toLowerCase().includes(query) ||
          employee.department?.toLowerCase().includes(query) ||
          employee.role?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  // Load employees on initial render and when sort parameters change
  useEffect(() => {
    fetchEmployees();
  }, [sortColumn, sortDirection]);

  // Navigate to employee invitations page
  const goToInvitesPage = () => {
    navigate('/employees/invitations');
  };

  // Handle employee deletion (currently not implemented for profiles)
  const handleDeleteEmployee = async (id: string) => {
    try {
      // Update to handle profile deletion
      toast.error('Direct deletion not supported. Please deactivate the user profile instead.');
    } catch (err: any) {
      console.error('Error in handleDeleteEmployee:', err);
      toast.error(`An unexpected error occurred: ${err.message}`);
    }
  };

  const filteredEmployees = getFilteredEmployees();

  return (
    <BusinessDashboardContent 
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage your company employees and safety officers
            </p>
          </div>
          <Button onClick={goToInvitesPage} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Employees
          </Button>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

          <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Employee Directory
              </CardTitle>
              <div className="flex items-center space-x-2">
                    <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search employees..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchEmployees}>
                  Refresh
                </Button>
              </div>
            </div>
            <CardDescription>
              View and manage all employees in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="managers" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Managers
                </TabsTrigger>
                <TabsTrigger value="safety-officers" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Safety Officers
                </TabsTrigger>
                <TabsTrigger value="other-employees" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Other Employees
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-12 border rounded-md">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No employees found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery ? 'Try adjusting your search term' : 'Start by inviting employees to join your organization'}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={goToInvitesPage}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Employees
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
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
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="font-medium flex items-center gap-2">
                                {employee.first_name} {employee.last_name}
                                {employee.is_safety_officer && (
                                  <Badge variant="outline" className="flex items-center gap-1 border-green-200 text-green-700 bg-green-50">
                                    <Shield className="h-3 w-3" />
                                    Safety Officer
                                  </Badge>
                                )}
                                {employee.is_manager && (
                                  <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-700 bg-blue-50">
                                    <UserCog className="h-3 w-3" />
                                    Manager
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{employee.role || "Employee"}</TableCell>
                            <TableCell>{employee.department || "Not specified"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="flex items-center text-sm">
                                  <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  {employee.email}
                                </span>
                </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                employee.is_manager 
                                  ? "outline" 
                                  : employee.is_safety_officer 
                                    ? "outline" 
                                    : "secondary"
                              } className={
                                employee.is_manager 
                                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                                  : employee.is_safety_officer 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : ""
                              }>
                                {employee.is_manager 
                                  ? "Manager" 
                                  : employee.is_safety_officer 
                                    ? "Safety Officer" 
                                    : "Employee"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Edit Employee
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/settings/user-approval`)}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Manage Approval
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
              </div>
                )}
              </TabsContent>
            </Tabs>
            </CardContent>
          </Card>
        </div>
    </BusinessDashboardContent>
  );
};

export default EmployeesPage; 