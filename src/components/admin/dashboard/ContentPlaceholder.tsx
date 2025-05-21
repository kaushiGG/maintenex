
import React from 'react';

interface ContentPlaceholderProps {
  title: string;
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ title }) => {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-[#F3F0FF]">
      <div className="text-center p-10 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-pretance-purple mb-4">{title} Page</h2>
        <p className="text-pretance-purple/70">This section is under development</p>
      </div>
    </div>
  );
};

export default ContentPlaceholder;
