
import React from 'react';
import { Wrench, Droplet, CheckCircle, AlertCircle, Thermometer, WrenchIcon } from 'lucide-react';

type IconType = 'WrenchIcon' | 'Droplet' | 'CheckCircle' | 'AlertCircle' | 'Wrench' | 'Thermometer';

interface PlumbingStatusCardProps {
  title: string;
  value: string;
  color: string;
  icon: IconType;
  subtext?: string;
  textColor?: string;
  valueSize?: string;
}

const PlumbingStatusCard: React.FC<PlumbingStatusCardProps> = ({
  title,
  value,
  color,
  icon,
  subtext,
  textColor = "text-gray-800",
  valueSize = "text-2xl"
}) => {
  const IconComponent = () => {
    switch (icon) {
      case 'WrenchIcon':
        return <Wrench className={`h-5 w-5 ${textColor}`} />;
      case 'Droplet':
        return <Droplet className={`h-5 w-5 ${textColor}`} />;
      case 'CheckCircle':
        return <CheckCircle className={`h-5 w-5 ${textColor}`} />;
      case 'AlertCircle':
        return <AlertCircle className={`h-5 w-5 ${textColor}`} />;
      case 'Wrench':
        return <Wrench className={`h-5 w-5 ${textColor}`} />;
      case 'Thermometer':
        return <Thermometer className={`h-5 w-5 ${textColor}`} />;
      default:
        return <Wrench className={`h-5 w-5 ${textColor}`} />;
    }
  };

  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-1 flex items-center">
          <p className={`${valueSize} font-bold ${textColor}`}>{value}</p>
        </div>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

export default PlumbingStatusCard;
