
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, Filter, ChevronDown, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Contractor } from '@/types/contractor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContractorsFilterProps {
  filters: {
    serviceType: string;
    location: string;
    rating: string;
    status: string;
  };
  contractors: Contractor[];
  onFilterChange: (key: string, value: string) => void;
}

export const ContractorsFilter = ({ filters, contractors, onFilterChange }: ContractorsFilterProps) => {
  // Extract unique service types from contractors
  const serviceTypes = [...new Set(contractors.map(contractor => contractor.serviceType))];
  
  // Extract unique statuses from contractors
  const statuses = [...new Set(contractors.map(contractor => contractor.status))];

  // Get status icon based on status value
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-2" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />;
      case 'Suspended':
        return <XCircle className="h-4 w-4 text-red-600 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-5 bg-purple-50 rounded-lg mb-6 shadow-sm">
      <h2 className="text-lg font-medium text-pretance-purple mb-4">Filter Contractors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
            <Select value={filters.serviceType} onValueChange={(value) => onFilterChange('serviceType', value)}>
              <SelectTrigger className="pl-10 border-gray-300 focus:border-pretance-purple">
                <SelectValue placeholder="Select service..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              className="pl-10 border-gray-300 focus:border-pretance-purple"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="relative">
            <Star className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Minimum rating..."
              value={filters.rating}
              onChange={(e) => onFilterChange('rating', e.target.value)}
              className="pl-10 border-gray-300 focus:border-pretance-purple"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
            <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
              <SelectTrigger className="pl-10 border-gray-300 focus:border-pretance-purple">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="flex items-center">
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
