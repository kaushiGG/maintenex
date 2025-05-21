
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';
import { createServiceArea, ServiceArea } from '@/services/serviceAreas';

interface AddServiceAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAreaAdded: (area: ServiceArea) => void;
}

const AddServiceAreaDialog = ({ 
  open, 
  onOpenChange,
  onAreaAdded 
}: AddServiceAreaDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    radius: 10,
    coordinates: '',
    postcodes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.coordinates.trim()) {
      newErrors.coordinates = 'Coordinates are required';
    } else if (!isValidCoordinates(formData.coordinates)) {
      newErrors.coordinates = 'Invalid coordinates format. Use lat,lng (e.g., -33.865143,151.209900)';
    }
    
    if (!formData.postcodes.trim()) {
      newErrors.postcodes = 'At least one postcode is required';
    }
    
    if (formData.radius <= 0) {
      newErrors.radius = 'Radius must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidCoordinates = (coords: string) => {
    const pattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    return pattern.test(coords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const serviceAreaData = {
        name: formData.name,
        radius: Number(formData.radius),
        coordinates: formData.coordinates,
        postcodes: formData.postcodes,
        status: 'pending'
      };
      
      const newArea = await createServiceArea(serviceAreaData);
      onAreaAdded(newArea);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating service area:', error);
      setErrors({ submit: 'Failed to create service area. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          setFormData(prev => ({ ...prev, coordinates: coords }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setErrors({ coordinates: 'Failed to get current location' });
        }
      );
    } else {
      setErrors({ coordinates: 'Geolocation is not supported by this browser' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Service Area</DialogTitle>
            <DialogDescription>
              Define a new area where your services are available
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="name" className="col-span-4">
                Area Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Melbourne CBD"
                className="col-span-4"
              />
              {errors.name && (
                <p className="text-red-500 text-sm col-span-4">{errors.name}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="radius" className="col-span-4">
                Service Radius (km)
              </Label>
              <Input
                id="radius"
                name="radius"
                type="number"
                min="1"
                max="100"
                value={formData.radius}
                onChange={handleChange}
                className="col-span-4"
              />
              {errors.radius && (
                <p className="text-red-500 text-sm col-span-4">{errors.radius}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="coordinates" className="col-span-4">
                Center Coordinates
              </Label>
              <Input
                id="coordinates"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleChange}
                placeholder="lat,lng (e.g., -33.865143,151.209900)"
                className="col-span-3"
              />
              <Button 
                type="button" 
                variant="outline" 
                className="col-span-1"
                onClick={getCurrentLocation}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              {errors.coordinates && (
                <p className="text-red-500 text-sm col-span-4">{errors.coordinates}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="postcodes" className="col-span-4">
                Postcodes Covered
              </Label>
              <Textarea
                id="postcodes"
                name="postcodes"
                value={formData.postcodes}
                onChange={handleChange}
                placeholder="Comma separated postcodes (e.g., 3000, 3001, 3002)"
                className="col-span-4"
                rows={3}
              />
              {errors.postcodes && (
                <p className="text-red-500 text-sm col-span-4">{errors.postcodes}</p>
              )}
            </div>
            
            {errors.submit && (
              <p className="text-red-500 text-sm">{errors.submit}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-pretance-purple hover:bg-pretance-dark" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Service Area'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceAreaDialog;
