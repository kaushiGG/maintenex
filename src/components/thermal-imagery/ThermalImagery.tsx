import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ThermalImageryProps {
  thermalImageUrl: string;
  standardImageUrl: string;
}

const ThermalImagery: React.FC<ThermalImageryProps> = ({ 
  thermalImageUrl, 
  standardImageUrl 
}) => {
  const [activeTab, setActiveTab] = useState('thermal');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="p-4 border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thermal">Thermal Image</TabsTrigger>
            <TabsTrigger value="standard">Standard Image</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="thermal" className="mt-0">
          <div className="relative aspect-video">
            <img 
              src={thermalImageUrl} 
              alt="Thermal image" 
              className="w-full object-contain max-h-[500px]"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="standard" className="mt-0">
          <div className="relative aspect-video">
            <img 
              src={standardImageUrl} 
              alt="Standard image" 
              className="w-full object-contain max-h-[500px]"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThermalImagery; 