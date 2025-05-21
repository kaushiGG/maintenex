import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  iconBgColor?: string;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    blink?: boolean;
  };
}

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  iconBgColor = "bg-pretance-light",
  iconColor = "text-pretance-purple",
  badge 
}: QuickActionCardProps) => (
  <Card 
    className="p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 rounded-lg flex flex-col items-center text-center"
    onClick={onClick}
  >
    <div className="relative mb-4">
      <div className={`${iconBgColor} p-4 rounded-full inline-flex items-center justify-center`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      {badge && (
        <Badge 
          variant={badge.variant} 
          className={`absolute -top-2 -right-2 text-xs bg-[#FF6B00] text-white ${badge.blink ? 'animate-pulse' : ''}`}
        >
          {badge.text}
        </Badge>
      )}
    </div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Card>
);

export default QuickActionCard;
