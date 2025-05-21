import React from 'react';

interface DataRowProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, className = '' }) => {
  return (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <div className="text-gray-600">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
};

export default DataRow; 