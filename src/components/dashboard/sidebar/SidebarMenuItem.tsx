
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  title: string;
  label?: string; 
  to?: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  badge?: React.ReactNode;
  activeClassName?: string;
  hoverClassName?: string;
}

const SidebarMenuItem = ({ 
  icon: Icon, 
  title, 
  label,
  to, 
  isActive = false, 
  onClick,
  size = 'md',
  badge,
  activeClassName = "bg-gray-200 text-gray-800 font-medium", 
  hoverClassName = "hover:bg-gray-100 hover:text-gray-700" 
}: SidebarMenuItemProps) => {
  const displayText = label || title;
  const baseClasses = `flex items-center justify-between ${size === 'md' ? 'px-4 py-3' : 'px-3 py-2'} rounded-md transition-colors`;
  const activeClasses = isActive 
    ? activeClassName
    : `text-gray-700 ${hoverClassName}`;
  
  const sizeClasses = size === 'md' ? 'mr-3 h-5 w-5' : 'mr-2 h-4 w-4';
  const textClasses = size === 'sm' ? 'text-sm' : 'font-medium';
  
  const content = (
    <>
      <div className="flex items-center">
        <Icon className={sizeClasses} />
        <span className={textClasses}>{displayText}</span>
      </div>
      {badge && <div>{badge}</div>}
    </>
  );
  
  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, activeClasses)}>
        {content}
      </Link>
    );
  }
  
  return (
    <div 
      className={cn(baseClasses, activeClasses, "cursor-pointer")}
      onClick={onClick}
    >
      {content}
    </div>
  );
};

export default SidebarMenuItem;
