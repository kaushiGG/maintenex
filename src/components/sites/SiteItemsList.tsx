
import React from 'react';
import { Check, X, PlusCircle, Tag, Zap, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemDetailDialog } from './ItemDetailDialog';

interface SiteItemsListProps {
  items: any[];
  handleViewTestingService: (type: string) => void;
  serviceType: string;
}

export const SiteItemsList = ({ items, handleViewTestingService, serviceType }: SiteItemsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No items found</p>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {serviceType === 'test-a-tag' && (
            <Button 
              onClick={() => handleViewTestingService('test-a-tag')}
              className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 py-6"
            >
              <Tag className="h-5 w-5" />
              <span>View Testing Tags Service</span>
            </Button>
          )}
          
          {serviceType === 'rcd' && (
            <Button 
              onClick={() => handleViewTestingService('rcd')}
              className="bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center gap-2 py-6"
            >
              <Zap className="h-5 w-5" />
              <span>View RCD Testing Service</span>
            </Button>
          )}
          
          {serviceType === 'emergency-exit' && (
            <Button 
              onClick={() => handleViewTestingService('emergency-exit')}
              className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 py-6"
            >
              <Lightbulb className="h-5 w-5" />
              <span>View Emergency Exit Lighting</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>{item.name}</span>
              {item.status === 'Passed' ? (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Passed
                </div>
              ) : (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center">
                  <X className="h-3 w-3 mr-1" />
                  Failed
                </div>
              )}
            </CardTitle>
            <CardDescription>
              <span className="font-mono text-xs text-[#7851CA]">{item.itemNumber}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span>{item.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last inspection:</span>
                <span>{item.lastInspected.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next due:</span>
                <span>{item.nextInspection.toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <ItemDetailDialog item={item} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
