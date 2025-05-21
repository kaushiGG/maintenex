
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddEquipmentForm from '@/components/equipment/AddEquipmentForm';
import { EquipmentFormValues } from '@/components/equipment/EquipmentFormSchema';
import { toast } from 'sonner';

const AddEquipmentPage = () => {
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsAddEquipmentOpen(false);
    navigate(-1); // Go back to the previous page
  };

  const handleSave = (data: EquipmentFormValues) => {
    toast.success('Equipment added successfully');
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <AddEquipmentForm
          isOpen={isAddEquipmentOpen}
          onClose={handleClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AddEquipmentPage;
