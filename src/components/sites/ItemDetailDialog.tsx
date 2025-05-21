
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, X, FileText, File, Download, Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ThermalImageAnalysis } from './ThermalImageAnalysis';

interface ItemDetailDialogProps {
  item: any;
}

export const ItemDetailDialog = ({ item }: ItemDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [description, setDescription] = useState(item.description || '');
  const { serviceType } = useParams<{ serviceType: string }>();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-[#7851CA]">{item.itemNumber}</span> - {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Photos/Videos</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{item.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center">
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
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Inspection</p>
                <p>{item.lastInspected.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Inspection</p>
                <p>{item.nextInspection.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add a description..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button className="bg-[#7851CA] hover:bg-[#6a46b5]">
                Save Changes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            {serviceType === 'thermal-imaging' ? (
              <ThermalImageAnalysis item={item} />
            ) : (
              <>
                <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
                  <div className="flex flex-col items-center justify-center">
                    <Image className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Drag and drop photos or videos</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
                
                {item.images > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Array.from({ length: item.images }).map((_, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No photos or videos uploaded yet</p>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Upload inspection reports or certificates</p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Inspection Report</p>
                    <p className="text-xs text-gray-500">Added Jan 15, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
              <div className="flex flex-col items-center justify-center">
                <File className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Upload related documents</p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
            
            {item.documents > 0 ? (
              <div className="space-y-2">
                {Array.from({ length: item.documents }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Document {index + 1}</p>
                        <p className="text-xs text-gray-500">Added {new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No documents uploaded yet</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
