
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ContractorSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ContractorSearch: React.FC<ContractorSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search contractors..."
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
