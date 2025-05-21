
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Search, Pencil, Lock, Unlock, Building, Users, Shield } from 'lucide-react';

// Mock data
const MOCK_CONTRACTORS = [
  { id: 1, name: 'Smith Contractors', email: 'info@smithcontractors.com', assignedSites: ['Site A', 'Site B'], accessLevel: 'Full Access' },
  { id: 2, name: 'ABC Building Services', email: 'contact@abcbuilding.com', assignedSites: ['Site C'], accessLevel: 'Limited Access' },
  { id: 3, name: 'XYZ Maintenance', email: 'support@xyzmaintenance.com', assignedSites: ['Site A', 'Site D', 'Site E'], accessLevel: 'Read-Only' },
  { id: 4, name: 'Johnson Repairs', email: 'info@johnsonrepairs.com', assignedSites: ['Site B'], accessLevel: 'Full Access' },
];

const MOCK_SITES = [
  { id: 1, name: 'Site A', location: 'Melbourne, VIC' },
  { id: 2, name: 'Site B', location: 'Sydney, NSW' },
  { id: 3, name: 'Site C', location: 'Brisbane, QLD' },
  { id: 4, name: 'Site D', location: 'Perth, WA' },
  { id: 5, name: 'Site E', location: 'Adelaide, SA' },
];

const ACCESS_LEVELS = ['Full Access', 'Limited Access', 'Read-Only'];

interface Contractor {
  id: number;
  name: string;
  email: string;
  assignedSites: string[];
  accessLevel: string;
}

interface Site {
  id: number;
  name: string;
  location: string;
}

const ContractorAccessControl = () => {
  const [contractors, setContractors] = useState<Contractor[]>(MOCK_CONTRACTORS);
  const [sites] = useState<Site[]>(MOCK_SITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState('');
  
  const filteredContractors = contractors.filter(contractor => 
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contractor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.assignedSites.some(site => site.toLowerCase().includes(searchQuery.toLowerCase())) ||
    contractor.accessLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignContractorToSites = () => {
    if (!selectedContractor || selectedSites.length === 0 || !accessLevel) {
      toast.error('Please select sites and access level');
      return;
    }

    // Update contractor's assigned sites and access level
    setContractors(contractors.map(contractor => 
      contractor.id === selectedContractor.id 
        ? { ...contractor, assignedSites: selectedSites, accessLevel } 
        : contractor
    ));
    
    // Reset form & close sheet
    setShowAssignSheet(false);
    setSelectedContractor(null);
    setSelectedSites([]);
    setAccessLevel('');
    
    toast.success('Contractor access updated successfully');
  };

  const editContractorAccess = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setSelectedSites(contractor.assignedSites);
    setAccessLevel(contractor.accessLevel);
    setShowAssignSheet(true);
  };

  const toggleSiteSelection = (siteName: string) => {
    if (selectedSites.includes(siteName)) {
      setSelectedSites(selectedSites.filter(site => site !== siteName));
    } else {
      setSelectedSites([...selectedSites, siteName]);
    }
  };

  const revokeAllAccess = (contractorId: number) => {
    if (window.confirm('Are you sure you want to revoke all site access for this contractor?')) {
      setContractors(contractors.map(contractor => 
        contractor.id === contractorId 
          ? { ...contractor, assignedSites: [], accessLevel: 'No Access' } 
          : contractor
      ));
      
      toast.success('All access revoked');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">Contractor Access Control</h2>
          <p className="text-gray-500 mt-1">Assign specific contractors to sites with role-based restrictions</p>
        </div>
      </div>
      
      {/* Search and filter section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pretance-purple/60" />
            <Input
              type="text"
              placeholder="Search contractors, sites, or access levels..."
              className="pl-10 bg-white border-pretance-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Contractors table */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Site Access</CardTitle>
          <CardDescription>Manage which sites contractors can access and their permission level</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-pretance-purple/10">
                <TableHead>Contractor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Sites</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.map((contractor) => (
                <TableRow key={contractor.id} className="hover:bg-pretance-purple/5">
                  <TableCell className="font-medium">{contractor.name}</TableCell>
                  <TableCell>{contractor.email}</TableCell>
                  <TableCell>
                    {contractor.assignedSites.length > 0 ? 
                      contractor.assignedSites.join(', ') : 
                      <span className="text-gray-400 italic">No sites assigned</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contractor.accessLevel === 'Full Access' ? 'bg-green-100 text-green-800' : 
                      contractor.accessLevel === 'Limited Access' ? 'bg-yellow-100 text-yellow-800' : 
                      contractor.accessLevel === 'Read-Only' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contractor.accessLevel}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => editContractorAccess(contractor)}
                        title="Edit access"
                      >
                        <Pencil className="h-4 w-4 text-pretance-purple" />
                      </Button>
                      {contractor.assignedSites.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => revokeAllAccess(contractor.id)}
                          title="Revoke all access"
                        >
                          <Lock className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContractors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No contractors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Access Sheet */}
      <Sheet open={showAssignSheet} onOpenChange={setShowAssignSheet}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Manage Site Access
              {selectedContractor && (
                <span className="block text-sm font-normal text-gray-500 mt-1">
                  {selectedContractor.name}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          {selectedContractor && (
            <div className="py-4">
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Access Level</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select Access Level</option>
                  {ACCESS_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  <div className="flex items-center mt-2">
                    <Shield className="h-3 w-3 mr-1 text-green-600" />
                    <span><strong>Full Access:</strong> Can view and modify all site data</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Shield className="h-3 w-3 mr-1 text-yellow-600" />
                    <span><strong>Limited Access:</strong> Can view and modify specific site areas</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Shield className="h-3 w-3 mr-1 text-blue-600" />
                    <span><strong>Read-Only:</strong> Can only view site data without editing</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned Sites</label>
                <div className="border rounded-md p-2 max-h-64 overflow-y-auto">
                  {sites.map(site => (
                    <div key={site.id} className="py-2 px-3 hover:bg-pretance-purple/5 rounded">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSites.includes(site.name)}
                          onChange={() => toggleSiteSelection(site.name)}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-xs text-gray-500">{site.location}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => setShowAssignSheet(false)}>
              Cancel
            </Button>
            <Button onClick={assignContractorToSites} className="bg-pretance-purple hover:bg-pretance-dark">
              Save Access Settings
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContractorAccessControl;
