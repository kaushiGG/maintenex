
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const SidebarSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isExpanded, 
  onToggle,
  className
}: SidebarSectionProps) => {
  return (
    <div className={cn("mb-4", className)}>
      <div 
        className="flex items-center justify-between px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-gray-100 rounded-md"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <Icon size={16} className="mr-2" />
          <span>{title}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      
      {isExpanded && (
        <div className="mt-1 ml-3 pl-2 border-l border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default SidebarSection;
