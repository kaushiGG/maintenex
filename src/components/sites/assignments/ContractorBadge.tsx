
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContractorBadgeProps {
  contractorName: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ContractorBadge: React.FC<ContractorBadgeProps> = ({ 
  contractorName, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Badge 
      className="bg-forgemate-purple hover:bg-forgemate-purple px-3 py-1 flex items-center gap-2 group"
    >
      <span className="truncate max-w-[120px]">{contractorName}</span>
      <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="h-5 w-5 inline-flex items-center justify-center rounded-full hover:bg-forgemate-dark transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit assignment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="h-5 w-5 inline-flex items-center justify-center rounded-full hover:bg-forgemate-dark transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove assignment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Badge>
  );
};

export default ContractorBadge;
