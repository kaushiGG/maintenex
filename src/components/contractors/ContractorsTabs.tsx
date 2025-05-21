import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContractorsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function ContractorsTabs({ activeTab, onTabChange }: ContractorsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="flex justify-start gap-2 p-1 bg-gray-100 rounded-lg">
        <TabsTrigger
          value="contractors"
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'contractors'
              ? 'bg-orange-500 text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          Contractors
        </TabsTrigger>
        <TabsTrigger
          value="licenses"
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'licenses'
              ? 'bg-orange-500 text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          Licenses
        </TabsTrigger>
        <TabsTrigger
          value="insurance"
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'insurance'
              ? 'bg-orange-500 text-white'
              : 'hover:bg-gray-200'
          }`}
        >
          Insurance
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
