
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface JobFormHeaderProps {
  title: string;
}

const JobFormHeader: React.FC<JobFormHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-sm breadcrumbs mb-4 text-gray-500">
      <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-pretance-purple">Dashboard</span>
      <span className="mx-2">›</span>
      <span onClick={() => navigate('/jobs')} className="cursor-pointer hover:text-pretance-purple">Job Management</span>
      <span className="mx-2">›</span>
      <span className="text-pretance-purple">{title}</span>
    </div>
  );
};

export default JobFormHeader;
