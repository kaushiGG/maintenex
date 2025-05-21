
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  title: string;
  label?: string; 
  to?: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  badge?: React.ReactNode;
}

const SidebarMenuItem = ({ 
  icon: Icon, 
  title, 
  label,
  to, 
  isActive = false, 
  onClick,
  size = 'md',
  badge
}: SidebarMenuItemProps) => {
  const displayText = label || title;
  const baseClasses = `flex items-center justify-between ${size === 'md' ? 'px-4 py-3' : 'px-2 py-1.5'} text-gray-700`;
  const activeClasses = isActive ? 'bg-pretance-purple/10 text-pretance-purple font-medium' : 'hover:bg-pretance-purple/10 hover:text-pretance-purple';
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
      <Link to={to} className={`${baseClasses} ${activeClasses} rounded`}>
        {content}
      </Link>
    );
  }
  
  return (
    <div 
      className={`${baseClasses} ${activeClasses} rounded cursor-pointer`}
      onClick={onClick}
    >
      {content}
    </div>
  );
};

export default SidebarMenuItem;
