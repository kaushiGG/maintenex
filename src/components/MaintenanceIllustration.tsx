
import React from 'react';

interface MaintenanceIllustrationProps {
  className?: string;
}

const MaintenanceIllustration: React.FC<MaintenanceIllustrationProps> = ({ className }) => {
  return (
    <div className={className}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background elements */}
        <rect x="0" y="0" width="800" height="600" fill="none" />
        
        {/* Gears - representing general maintenance */}
        <g className="animate-spin-slow" style={{ transformOrigin: '200px 300px' }}>
          <circle cx="200" cy="300" r="50" stroke="white" strokeWidth="6" strokeOpacity="0.6" fill="none" />
          <path d="M200 260 L200 240 L210 230 L190 230 L200 240 Z" fill="white" fillOpacity="0.6" />
          <path d="M200 340 L200 360 L210 370 L190 370 L200 360 Z" fill="white" fillOpacity="0.6" />
          <path d="M160 300 L140 300 L130 310 L130 290 L140 300 Z" fill="white" fillOpacity="0.6" />
          <path d="M240 300 L260 300 L270 310 L270 290 L260 300 Z" fill="white" fillOpacity="0.6" />
        </g>

        {/* Testing Tags - tag with checkmark */}
        <g transform="translate(100, 180)">
          <path d="M30 0 L60 0 L70 10 L70 40 L30 40 Z" fill="white" fillOpacity="0.5" />
          <path d="M60 0 L60 10 L70 10" stroke="white" strokeWidth="2" strokeOpacity="0.7" fill="none" />
          <path d="M40 20 L50 30 L60 15" stroke="white" strokeWidth="3" strokeOpacity="0.9" fill="none" strokeLinecap="round" />
        </g>

        {/* RCD - electrical symbol */}
        <g transform="translate(100, 400)">
          <circle cx="15" cy="15" r="15" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M10 15 L20 15 M15 10 L15 20" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
          <path d="M30 5 L60 25" stroke="white" strokeWidth="3" strokeOpacity="0.7" fill="none" strokeLinecap="round" />
          <path d="M30 25 L60 5" stroke="white" strokeWidth="3" strokeOpacity="0.7" fill="none" strokeLinecap="round" />
        </g>

        {/* Emergency Exit */}
        <g transform="translate(300, 150)">
          <rect x="0" y="0" width="60" height="80" rx="2" fill="white" fillOpacity="0.5" />
          <path d="M20 80 L20 50 L40 50 L40 80" stroke="white" strokeWidth="3" strokeOpacity="0.9" fill="none" />
          <path d="M30 50 L30 30 L15 45 L30 45" stroke="white" strokeWidth="3" strokeOpacity="0.9" fill="none" />
          <path d="M30 10 L30 0" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
        </g>

        {/* Thermal Imaging - heat map pattern */}
        <g transform="translate(300, 400)">
          <rect x="0" y="0" width="70" height="50" rx="5" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <ellipse cx="35" cy="25" rx="20" ry="15" fill="white" fillOpacity="0.2" />
          <ellipse cx="35" cy="25" rx="15" ry="10" fill="white" fillOpacity="0.3" />
          <ellipse cx="35" cy="25" rx="10" ry="5" fill="white" fillOpacity="0.5" />
          <ellipse cx="35" cy="25" rx="5" ry="3" fill="white" fillOpacity="0.7" />
        </g>

        {/* Fire Services - fire extinguisher */}
        <g transform="translate(400, 250)">
          <rect x="10" y="0" width="20" height="10" rx="2" fill="white" fillOpacity="0.6" />
          <rect x="5" y="10" width="30" height="60" rx="5" fill="white" fillOpacity="0.6" />
          <path d="M15 20 C5 30, 5 50, 15 60" stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="none" />
          <path d="M25 20 C35 30, 35 50, 25 60" stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="none" />
          <rect x="15" y="70" width="10" height="5" fill="white" fillOpacity="0.6" />
        </g>

        {/* Air Conditioning Service - AC unit with cool air symbols */}
        <g transform="translate(480, 150)">
          <rect x="0" y="0" width="70" height="40" rx="5" fill="white" fillOpacity="0.5" />
          <rect x="10" y="10" width="50" height="20" rx="2" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M15 20 L20 20 M25 20 L30 20 M35 20 L40 20" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
          <path d="M55 5 C60 10, 65 5, 70 10" stroke="white" strokeWidth="1" strokeOpacity="0.7" fill="none" />
          <path d="M55 15 C60 20, 65 15, 70 20" stroke="white" strokeWidth="1" strokeOpacity="0.7" fill="none" />
          <path d="M55 25 C60 30, 65 25, 70 30" stroke="white" strokeWidth="1" strokeOpacity="0.7" fill="none" />
        </g>

        {/* Lift Service - elevator */}
        <g transform="translate(480, 400)">
          <rect x="0" y="0" width="40" height="60" rx="2" fill="white" fillOpacity="0.5" />
          <line x1="20" y1="5" x2="20" y2="55" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <rect x="5" y="15" width="30" height="20" fill="white" fillOpacity="0.3" />
          <path d="M10 35 L15 40 L25 40 L30 35" stroke="white" strokeWidth="1" strokeOpacity="0.9" fill="none" />
          <path d="M15 10 L20 5 L25 10" stroke="white" strokeWidth="1" strokeOpacity="0.9" fill="none" />
          <path d="M15 50 L20 55 L25 50" stroke="white" strokeWidth="1" strokeOpacity="0.9" fill="none" />
        </g>

        {/* Pest Control - bug and spray */}
        <g transform="translate(600, 200)">
          <ellipse cx="20" cy="20" rx="15" ry="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="5" y1="15" x2="0" y2="10" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="5" y1="25" x2="0" y2="30" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="35" y1="15" x2="40" y2="10" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="35" y1="25" x2="40" y2="30" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          <circle cx="15" cy="17" r="2" fill="white" fillOpacity="0.9" />
          <circle cx="25" cy="17" r="2" fill="white" fillOpacity="0.9" />
          <path d="M50 10 L70 30" stroke="white" strokeWidth="1" strokeOpacity="0.9" />
          <path d="M70 30 L80 25 L85 35 L75 40 L70 30" fill="white" fillOpacity="0.6" />
          <path d="M70 30 L65 35 L60 25" stroke="white" strokeWidth="1" strokeOpacity="0.7" fill="none" />
        </g>

        {/* Cleaning - broom and bucket */}
        <g transform="translate(650, 350)">
          <path d="M10 0 L15 60" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M10 0 L40 10" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <path d="M40 10 L50 5 L55 10 L50 15 L40 10" fill="white" fillOpacity="0.6" />
          <path d="M15 60 L5 50 L25 50 L15 60" fill="white" fillOpacity="0.6" />
          <ellipse cx="40" cy="40" rx="15" ry="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
          <rect x="25" y="40" width="30" height="20" rx="2" fill="white" fillOpacity="0.5" />
        </g>

        {/* Connecting lines to show integration of services */}
        <path d="M200 300 C300 250, 400 350, 500 300" stroke="white" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5,5" fill="none" />
      </svg>
    </div>
  );
};

export default MaintenanceIllustration;
