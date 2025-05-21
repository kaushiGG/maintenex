
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ContractorsPaginationProps {
  currentPage: number;
  totalContractors: number;
  onPageChange: (page: number) => void;
}

export const ContractorsPagination = ({ 
  currentPage, 
  totalContractors, 
  onPageChange 
}: ContractorsPaginationProps) => {
  const totalPages = Math.ceil(totalContractors / 10);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);
  
  return (
    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm border">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalContractors)}</span> of <span className="font-medium">{totalContractors}</span> contractors
      </div>
      <div className="flex space-x-1">
        <Button 
          variant="outline" 
          className="w-9 h-9 p-0" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            className={`w-9 h-9 p-0 ${currentPage === page ? 'bg-pretance-purple' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="outline" 
          className="w-9 h-9 p-0"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
