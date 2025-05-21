import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractorsTable } from '@/components/contractors/ContractorsTable';
import ContractorAccessControl from '@/components/maintenance/ContractorAccessControl';
import { Users, FileText, ShieldCheck, DollarSign, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddContractorDialog from '@/components/contractors/AddContractorDialog';
import { useAuth } from '@/context/AuthContext';
import { useContractors } from '@/components/contractors/hooks/useContractors';

const ContractorsModule = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();
  const { contractors, isLoading, addContractor } = useContractors();

  const handleViewContractor = (id: string) => {
    console.log('View contractor:', id);
    // Implement view logic here
  };

  const handleEditContractor = (id: string) => {
    console.log('Edit contractor:', id);
    // Implement edit logic here
  };

  const handleDeleteContractor = (id: string) => {
    console.log('Delete contractor:', id);
    // Implement delete logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Contractor Management</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#7851CA] hover:bg-[#6742B0]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Contractor
        </Button>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList className="mb-4">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
                </div>
              ) : (
                <ContractorsTable 
                  contractors={contractors} 
                  loading={isLoading}
                  onView={handleViewContractor}
                  onEdit={handleEditContractor}
                  onDelete={handleDeleteContractor}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractorAccessControl />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Performance metrics and reliability ratings will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Rate & Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Pricing and rate information for contractors will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddContractorDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAddContractor={addContractor}
      />
    </div>
  );
};

export default ContractorsModule;
