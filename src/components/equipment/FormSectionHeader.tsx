
import React, { ReactNode } from 'react';

interface FormSectionHeaderProps {
  icon: ReactNode;
  title: string;
}

const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({ icon, title }) => {
  return (
    <div className="md:col-span-2">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        {icon}
        <span className="ml-1">{title}</span>
      </h3>
    </div>
  );
};

export default FormSectionHeader;
