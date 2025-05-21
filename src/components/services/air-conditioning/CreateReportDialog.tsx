
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollText, Calendar, Upload, Filter, User } from 'lucide-react';
import { ACUnit } from './mockData';
import { useToast } from "@/hooks/use-toast";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: ACUnit[];
  selectedUnitId: string | null;
}

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({ 
  open, 
  onOpenChange,
  units,
  selectedUnitId
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    unitId: selectedUnitId || '',
    technicianName: '',
    date: new Date().toISOString().split('T')[0],
    filterReplaced: false,
    workPerformed: [],
    issues: '',
    recommendations: '',
  });

  const workOptions = [
    'General inspection',
    'Filter cleaning',
    'Filter replacement',
    'Coil cleaning',
    'Refrigerant check',
    'Drainage check',
    'Electrical inspection',
    'Thermostat calibration',
    'Fan motor lubrication',
    'Noise assessment',
    'Ductwork inspection',
    'Remote control check'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, workPerformed: [...prev.workPerformed, option] };
      } else {
        return { ...prev, workPerformed: prev.workPerformed.filter(item => item !== option) };
      }
    });
  };

  const handleFilterReplacedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, filterReplaced: checked }));
    
    // If filter replaced is checked, also check the 'Filter replacement' work option
    if (checked) {
      if (!formData.workPerformed.includes('Filter replacement')) {
        handleCheckboxChange('Filter replacement', true);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: "Images Uploaded",
        description: `${e.target.files.length} images attached to report`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit form data:', formData);
    
    toast({
      title: "Report Created",
      description: "Service report has been saved successfully"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-cyan-700" />
            Create Service Report
          </DialogTitle>
          <DialogDescription>
            Document maintenance work performed on an AC unit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitId">AC Unit</Label>
              <select 
                id="unitId" 
                name="unitId" 
                value={formData.unitId} 
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select AC Unit</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicianName" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Technician Name
              </Label>
              <Input 
                id="technicianName" 
                name="technicianName" 
                value={formData.technicianName} 
                onChange={handleChange} 
                placeholder="Enter technician name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Service Date
              </Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 h-10">
                <Checkbox 
                  id="filterReplaced" 
                  checked={formData.filterReplaced} 
                  onCheckedChange={handleFilterReplacedChange}
                />
                <Label htmlFor="filterReplaced" className="flex items-center gap-1 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Filter Replaced During Service
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">Work Performed</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {workOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`work-${option}`} 
                    checked={formData.workPerformed.includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(option, checked === true)}
                  />
                  <Label htmlFor={`work-${option}`} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">Issues Found</Label>
            <Textarea 
              id="issues" 
              name="issues" 
              value={formData.issues} 
              onChange={handleChange} 
              placeholder="Describe any issues found during service"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea 
              id="recommendations" 
              name="recommendations" 
              value={formData.recommendations} 
              onChange={handleChange} 
              placeholder="Provide recommendations for future maintenance"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">Upload Photos</Label>
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop photos or click to browse</p>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="photo-upload" 
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Select Photos
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              Create Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
