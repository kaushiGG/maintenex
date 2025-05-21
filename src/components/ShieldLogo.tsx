
import React from 'react';
import { cn } from '@/lib/utils';

interface ShieldLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShieldLogo: React.FC<ShieldLogoProps> = ({
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <img 
        src="/lovable-uploads/01f47b43-4e69-421b-b504-a3c0f03f76ac.png" 
        alt="Forgemate Logo" 
        className={cn('object-contain p-2', sizeClasses[size])}
      />
    </div>
  );
};

export default ShieldLogo;
