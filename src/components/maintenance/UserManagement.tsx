
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, UserPlus, UserMinus, Edit, Trash2, User } from 'lucide-react';
import { User as UserType, UserStatus } from '@/types/maintenance';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Sample user data
  const users: UserType[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'admin', department: 'IT', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'admin', department: 'Operations', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'contractor', department: 'Maintenance', status: 'Active' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'contractor', department: 'Finance', status: 'Active' },
    { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', role: 'admin', department: 'Sales', status: 'Inactive' },
    { id: 6, name: 'Sarah Thompson', email: 'sarah.thompson@example.com', role: 'contractor', department: 'Field Services', status: 'Active' },
    { id: 7, name: 'David Martinez', email: 'david.martinez@example.com', role: 'admin', department: 'IT', status: 'Active' },
    { id: 8, name: 'Lisa Anderson', email: 'lisa.anderson@example.com', role: 'admin', department: 'Customer Support', status: 'Inactive' },
  ];
  
  // Filter users based on search query and role filter
  const filteredUsers = users.filter(user => {
    const matchesQuery = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesQuery && matchesRole;
  });
  
  const handleAddUser = () => {
    console.log('Add user clicked');
    // Implementation for adding a new user would go here
  };
  
  const handleEditUser = (id: number) => {
    console.log(`Edit user with ID: ${id}`);
    // Implementation for editing a user would go here
  };
  
  const handleDeleteUser = (id: number) => {
    console.log(`Delete user with ID: ${id}`);
    // Implementation for deleting a user would go here
  };
  
  const handleChangeStatus = (id: number, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    console.log(`Change status of user with ID: ${id} from ${currentStatus} to ${newStatus}`);
    // Implementation for changing user status would go here
  };
  
  const getStatusBadge = (status: UserStatus) => {
    return status === 'Active' 
      ? <Badge className="bg-green-500">Active</Badge> 
      : <Badge className="bg-gray-500">Inactive</Badge>;
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">User Management</h2>
          <p className="text-gray-500 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        
        <Button 
          onClick={handleAddUser} 
          className="bg-pretance-purple hover:bg-pretance-dark"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search users by name, email, or department..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-pretance-purple/10">
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role === 'admin' ? 'Admin' : 'Contractor'}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleChangeStatus(user.id, user.status)}
                        >
                          {user.status === 'Active' 
                            ? <UserMinus className="h-4 w-4" /> 
                            : <UserPlus className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
