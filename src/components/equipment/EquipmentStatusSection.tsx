import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { equipmentStatuses, equipmentStatusLabels } from './EquipmentFormSchema';

interface EquipmentStatusSectionProps {
  status: string;
  onStatusChange: (status: string) => void;
}

const EquipmentStatusSection: React.FC<EquipmentStatusSectionProps> = ({
  status,
  onStatusChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {equipmentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {equipmentStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default EquipmentStatusSection; 