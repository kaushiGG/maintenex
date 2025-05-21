import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ServiceTypeSectionProps {
  serviceTypes: ServiceType[];
  selectedService: string | null;
  setSelectedService: (id: string) => void;
  serviceDetails: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ServiceTypeSection: React.FC<ServiceTypeSectionProps> = ({
  serviceTypes,
  selectedService,
  setSelectedService,
  serviceDetails,
  handleInputChange
}) => {
  // Group services into categories based on their position in the array
  const electricalServices = serviceTypes.slice(0, 3);
  const inspectionServices = serviceTypes.slice(3, 4);
  const mechanicalServices = serviceTypes.slice(4, 6);
  const otherServices = serviceTypes.slice(6);

  const renderServiceCard = (service: ServiceType) => (
    <div 
      key={service.id}
      className={`relative border rounded-md p-3 cursor-pointer transition-all hover:!border-orange-300 hover:!bg-orange-50 ${selectedService === service.id ? '!border-orange-500 !bg-orange-50' : 'border-gray-200'}`}
      onClick={() => setSelectedService(service.id)}
    >
      {selectedService === service.id && (
        <div className="absolute top-1 right-1 !bg-orange-500 text-white rounded-full p-0.5">
          <Check className="h-3 w-3" />
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-1">{service.icon}</div>
        <div className="font-medium text-sm text-center">{service.name}</div>
        <div className="text-xs text-gray-500 line-clamp-2 text-center">{service.description}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Service Type</h3>
      
      <div className="space-y-6 mb-6">
        {/* Electrical Services */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Electrical Services</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {electricalServices.map(renderServiceCard)}
          </div>
        </div>
        
        {/* Inspection Services */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Inspection Services</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {inspectionServices.map(renderServiceCard)}
          </div>
        </div>
        
        {/* Mechanical Services */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Mechanical Services</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mechanicalServices.map(renderServiceCard)}
          </div>
        </div>
        
        {/* Other Services */}
        {otherServices.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Other Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {otherServices.map(renderServiceCard)}
            </div>
          </div>
        )}
      </div>
      
      <div className="form-group">
        <Label htmlFor="serviceDetails">Service Details</Label>
        <Textarea 
          id="serviceDetails" 
          rows={3} 
          placeholder="Any specific requirements for this service" 
          className="mt-1"
          value={serviceDetails}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ServiceTypeSection;
