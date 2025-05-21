
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'passed') {
    return (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Passed
      </Badge>
    );
  } else if (status === 'failed') {
    return (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Warning
      </Badge>
    );
  }
};
