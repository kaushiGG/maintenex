import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md', 
  variant = 'dark',
  showText = false,
  className
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <svg
          className={`${sizeClasses[size]}`}
          viewBox="0 0 1200 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid of circles */}
          <g>
            {/* Row 1 */}
            <circle cx="140" cy="140" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="247" cy="140" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="354" cy="140" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="461" cy="140" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="568" cy="140" r="80" fill="url(#forgemate-circle-gradient)" />
            
            {/* Row 2 */}
            <circle cx="140" cy="247" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="247" cy="247" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="354" cy="247" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="461" cy="247" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="568" cy="247" r="20" fill="url(#forgemate-circle-gradient)" />
            
            {/* Row 3 */}
            <circle cx="140" cy="354" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="247" cy="354" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="354" cy="354" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="461" cy="354" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="568" cy="354" r="80" fill="url(#forgemate-circle-gradient)" />
            
            {/* Row 4 */}
            <circle cx="140" cy="461" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="247" cy="461" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="354" cy="461" r="20" fill="url(#forgemate-circle-gradient)" />
            <circle cx="461" cy="461" r="80" fill="url(#forgemate-circle-gradient)" />
            <circle cx="568" cy="461" r="20" fill="url(#forgemate-circle-gradient)" />
          </g>
          
          {/* Forgemate Text */}
          {showText && (
            <g>
              <path d="M700 140 H850 V220 H700 V460 H620 V140 H700Z" fill="url(#forgemate-text-gradient)" />
              <path d="M850 140 A160 160 0 0 1 1010 300 V460 H930 V300 A80 80 0 0 0 850 220 Z" fill="url(#forgemate-text-gradient)" />
              <path d="M1010 140 H1090 V220 H1170 V300 H1090 V460 H1010 V140Z" fill="url(#forgemate-text-gradient)" />
              <path d="M1170 140 H1330 V220 H1170 V140Z M1170 300 H1330 V380 H1170 V300Z" fill="url(#forgemate-text-gradient)" />
            </g>
          )}
          
          {/* Gradients */}
          <defs>
            <linearGradient id="forgemate-circle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4B2B" />
              <stop offset="50%" stopColor="#FF7E45" />
              <stop offset="100%" stopColor="#FFAC5F" />
            </linearGradient>
            
            <linearGradient id="forgemate-text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4B2B" />
              <stop offset="50%" stopColor="#FF7E45" />
              <stop offset="100%" stopColor="#FFAC5F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Logo;
