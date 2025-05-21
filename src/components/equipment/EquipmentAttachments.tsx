import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, File, AlertCircle, Eye, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile, deleteFile } from '@/utils/fileUpload';
import { useAuth } from '@/hooks/useAuth';
import { UploadedFile } from '@/types/asset';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentAttachmentsProps {
  equipmentId: string;
  initialAttachments: UploadedFile[] | null;
  onAttachmentsChange: (attachments: UploadedFile[]) => void;
}

const EquipmentAttachments: React.FC<EquipmentAttachmentsProps> = ({
  equipmentId,
  initialAttachments,
  onAttachmentsChange
}) => {
  console.log('EquipmentAttachments received props:', {
    equipmentId,
    initialAttachments
  });

  const [attachments, setAttachments] = useState<UploadedFile[]>(initialAttachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [activeView, setActiveView] = useState('all');
  const { user } = useAuth();
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  // Add effect to update attachments when initialAttachments changes
  React.useEffect(() => {
    console.log('initialAttachments changed:', initialAttachments);
    if (initialAttachments) {
      // Parse attachments if they are stored as a string
      let parsedAttachments = initialAttachments;
      if (typeof initialAttachments === 'string') {
        try {
          parsedAttachments = JSON.parse(initialAttachments);
        } catch (error) {
          console.error('Error parsing initialAttachments:', error);
          parsedAttachments = [];
        }
      }
      console.log('Setting parsed attachments:', parsedAttachments);
      setAttachments(parsedAttachments);
    } else {
      console.log('No initialAttachments provided');
      setAttachments([]);
    }
  }, [initialAttachments]);

  // Add a new useEffect to preload URLs when the view tab is selected:
  React.useEffect(() => {
    console.log('initialAttachments changed:', initialAttachments);
    if (initialAttachments) {
      // Parse attachments if they are stored as a string
      let parsedAttachments = initialAttachments;
      if (typeof initialAttachments === 'string') {
        try {
          parsedAttachments = JSON.parse(initialAttachments);
        } catch (error) {
          console.error('Error parsing initialAttachments:', error);
          parsedAttachments = [];
        }
      }
      console.log('Setting parsed attachments:', parsedAttachments);
      setAttachments(parsedAttachments);
    } else {
      console.log('No initialAttachments provided');
      setAttachments([]);
    }
  }, [initialAttachments]);
  
  // Add a new effect to refresh file URLs when viewing files
  React.useEffect(() => {
    // When switching to view tab, preload fresh URLs for attachments
    if (activeTab === 'view' && attachments.length > 0) {
      console.log('Preloading fresh URLs for attachments');
      const refreshedAttachments = attachments.map(attachment => {
        try {
          // Get a fresh URL from Supabase
          const { data } = supabase.storage
            .from('equipments')
            .getPublicUrl(attachment.path);
          
          const freshUrl = data?.publicUrl;
          
          if (freshUrl) {
            console.log(`Updated URL for ${attachment.name}`);
      return { 
              ...attachment,
              url: freshUrl
            };
          }
        } catch (err) {
          console.error(`Error refreshing URL for ${attachment.name}:`, err);
        }
        return attachment;
      });
      
      setAttachments(refreshedAttachments);
    }
  }, [activeTab, attachments.length]);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload images, PDFs, or Word documents.');
      }

      // Create a unique file path that includes the equipment ID
      const fileExtension = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const filePath = `${equipmentId}/${timestamp}-${file.name}`;

      // Upload the file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('equipments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload file');
      }

      // Get the public URL with the correct bucket URL
      const bucketUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/equipments`;
      const publicUrl = `${bucketUrl}/${filePath}`;

      console.log('Generated public URL:', publicUrl);

      // Create the attachment object
      const newAttachment: UploadedFile = {
        name: file.name,
        url: publicUrl,
        path: filePath,
        type: file.type,
        size: file.size,
        equipmentId: equipmentId,
        uploadedAt: new Date().toISOString()
      };

      console.log('Created new attachment:', newAttachment);

      // Get current attachments from the database
      const { data: currentEquipment, error: fetchError } = await supabase
        .from('equipment')
        .select('attachments')
        .eq('id', equipmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching current attachments:', fetchError);
        throw new Error('Failed to fetch current attachments');
      }

      // Parse current attachments or initialize empty array
      let currentAttachments: UploadedFile[] = [];
      if (currentEquipment?.attachments) {
        try {
          currentAttachments = typeof currentEquipment.attachments === 'string'
            ? JSON.parse(currentEquipment.attachments)
            : currentEquipment.attachments;
          console.log('Current attachments from database:', currentAttachments);
        } catch (error) {
          console.error('Error parsing current attachments:', error);
          currentAttachments = [];
        }
      }

      // Add new file to attachments
      const newAttachments = [...currentAttachments, newAttachment];
      console.log('New attachments array to save:', newAttachments);
      
      // Update the database with the new attachments
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ 
          attachments: JSON.stringify(newAttachments)
        })
        .eq('id', equipmentId);

      if (updateError) {
        console.error('Error updating equipment attachments:', updateError);
        throw new Error('Failed to update equipment attachments');
      }

      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('equipment')
        .select('attachments')
        .eq('id', equipmentId)
        .single();

      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      } else {
        console.log('Verified attachments in database:', verifyData.attachments);
      }

      setAttachments(newAttachments);
      onAttachmentsChange(newAttachments);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file');
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (file: UploadedFile) => {
    try {
      setIsUploading(true);
      setError(null);

      // Remove file from storage
      const { error: storageError } = await supabase.storage
        .from('equipments')
        .remove([file.path]);

      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        throw new Error('Failed to remove file from storage');
      }

      // Get current attachments from the database
      const { data: currentEquipment, error: fetchError } = await supabase
        .from('equipment')
        .select('attachments')
        .eq('id', equipmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching current attachments:', fetchError);
        throw new Error('Failed to fetch current attachments');
      }

      // Parse current attachments
      let currentAttachments: UploadedFile[] = [];
      if (currentEquipment?.attachments) {
        try {
          currentAttachments = typeof currentEquipment.attachments === 'string'
            ? JSON.parse(currentEquipment.attachments)
            : currentEquipment.attachments;
        } catch (error) {
          console.error('Error parsing current attachments:', error);
          currentAttachments = [];
        }
      }

      // Remove the file from attachments
      const newAttachments = currentAttachments.filter(
        attachment => attachment.path !== file.path
      );

      // Update the database
      const { error: updateError } = await supabase
        .from('equipment')
        .update({
          attachments: JSON.stringify(newAttachments)
        })
        .eq('id', equipmentId);

      if (updateError) {
        console.error('Error updating equipment attachments:', updateError);
        throw new Error('Failed to update equipment attachments');
      }

      setAttachments(newAttachments);
      onAttachmentsChange(newAttachments);
      toast.success('File removed successfully');
    } catch (error: any) {
      console.error('Error removing file:', error);
      setError(error.message || 'Failed to remove file');
      toast.error(error.message || 'Failed to remove file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handlePreview = (file: UploadedFile) => {
    console.log('Previewing file:', file);
    if (!file.url) {
      console.error('File has no URL:', file);
      toast.error('Cannot preview file: No URL available');
      return;
    }

    // Show loading state immediately
    setIsPreviewLoading(true);
    
    // First, try to directly access the file using the bucket URL
    try {
      // Extract file path from the current URL or use the file.path
      let filePath = file.path;
      
      // Generate direct URL to the file in the bucket
      const bucketName = 'equipments';
      
      // Get base URL from environment or construct it from Supabase URL
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rdanrykykujoytbcpcmo.supabase.co';
      const directBucketUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
      
      console.log('Attempting to load with direct bucket URL:', directBucketUrl);
      
      // Set preview file with direct URL
      setPreviewFile({
        ...file, 
        url: directBucketUrl
      });
      
      // For quicker feedback, set loading to false after a minimum timeout
      setTimeout(() => {
        if (isPreviewLoading) {
          setIsPreviewLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating direct URL:', error);
      // Fallback to original URL
      setPreviewFile(file);
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    if (!file.url) {
      toast.error('Download URL not available');
        return;
      }

    try {
      setDownloadingFile(file.path);
      
      // Get a fresh URL before downloading
      const { data: { publicUrl } } = supabase.storage
        .from('equipments')
        .getPublicUrl(file.path);
      
      const downloadUrl = publicUrl || file.url;
      
      // Create an invisible anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  const filterAttachments = (type: string) => {
    console.log('Filtering attachments by type:', type);
    console.log('Current attachments:', attachments);
    
    if (!attachments || attachments.length === 0) {
      return [];
    }
    
    let filtered = attachments;
    if (type === 'all') {
      filtered = attachments;
    } else if (type === 'images') {
      filtered = attachments.filter(file => file.type?.startsWith('image/'));
    } else if (type === 'documents') {
      filtered = attachments.filter(file => 
        file.type === 'application/pdf' || 
        file.type?.includes('document') || 
        file.type?.includes('text')
      );
    }
    
    console.log('Filtered attachments:', filtered);
    return filtered;
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    const isImage = previewFile.type?.startsWith('image/');
    const isPDF = previewFile.type === 'application/pdf';

    return (
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {renderFileIcon(previewFile)}
              {previewFile.name}
            </DialogTitle>
            <DialogDescription>
              {isImage ? 'Image Preview' : isPDF ? 'PDF Preview' : 'File Preview'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {isPreviewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                )}
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => setIsPreviewLoading(false)}
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    
                    try {
                      // Attempt with an alternative URL construction approach
                      // Extract just the file path from the full URL or from file.path
                      const filePath = previewFile.path;
                      
                      if (!filePath) {
                        throw new Error('No file path available for fallback');
                      }
                      
                      // Use a fixed Supabase URL if the dynamic one isn't working
                      const supabaseUrl = 'https://rdanrykykujoytbcpcmo.supabase.co';
                      const bucketName = 'equipments';
                      const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
                      
                      console.log('Trying fallback direct URL:', fallbackUrl);
                      
                      // Update the image src with the fallback URL
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = fallbackUrl;
                      
                      // Also update the previewFile state so future renders use this URL
                      setPreviewFile({
                        ...previewFile,
                        url: fallbackUrl
                      });
                      
                      // Don't turn off loading here - let the next load/error event handle it
                    } catch (err) {
                      console.error('Error in direct fallback loading:', err);
                      toast.error('Could not load image.');
                      setIsPreviewLoading(false);
                    }
                  }}
                />
              </div>
            ) : isPDF ? (
              <div className="relative w-full h-full">
                {isPreviewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                )}
                <iframe
                  src={previewFile.url}
                  className="w-full h-full"
                  title={previewFile.name}
                  onLoad={() => setIsPreviewLoading(false)}
                  onError={(e) => {
                    console.error('Error loading PDF:', e);
                    
                    // Try once more with a direct URL
                    try {
                      const directUrl = previewFile.url.split('?')[0]; // Remove query params
                      console.log('Retrying PDF with direct URL:', directUrl);
                      
                      // Create a test image to check if the URL is accessible
                      const testFetch = fetch(directUrl, { method: 'HEAD' })
                        .then(() => {
                          // URL is accessible, update the iframe src
                          setPreviewFile({
                            ...previewFile,
                            url: directUrl
                          });
                          setIsPreviewLoading(false);
                        })
                        .catch((err) => {
                          console.error('Error in PDF URL test:', err);
                          toast.error('Failed to load PDF preview');
                          setIsPreviewLoading(false);
                        });
                    } catch (err) {
                      console.error('Error in fallback PDF loading:', err);
                      toast.error('Failed to load PDF preview');
                      setIsPreviewLoading(false);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Preview not available for this file type
              </p>
              <Button 
                variant="outline" 
                    onClick={() => setPreviewFile(null)}
                  >
                    Close
                      </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderFileIcon = (file: UploadedFile) => {
    if (!file.type) {
      return <File className="h-5 w-5 text-gray-500" />;
    }
    
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-orange-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              onClick={() => setActiveTab('upload')}
            >
              Upload Files
            </TabsTrigger>
            <TabsTrigger 
              value="view" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              onClick={() => setActiveTab('view')}
            >
              View Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={isUploading}
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}>
                <Upload className="mx-auto h-12 w-12 text-orange-500" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {isUploading ? 'Uploading...' : 'Drag and drop files here, or click to select files'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: Images, PDF, Word documents (max 50MB)
                </p>
              </label>
                  </div>
          </TabsContent>

          <TabsContent value="view">
            <div className="space-y-4">
              <Tabs defaultValue="all" value={activeView} onValueChange={setActiveView}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">All Files</TabsTrigger>
                  <TabsTrigger value="images" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Images</TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Documents</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-4">
                    {isUploading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading files...</p>
                      </div>
                    ) : filterAttachments(activeView).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <File className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                        <p>No files found</p>
                        <p className="text-sm">Upload files to see them here</p>
                      </div>
                    ) : (
                      filterAttachments(activeView).map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {renderFileIcon(file)}
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreview(file)}
                              disabled={isUploading || isPreviewLoading}
                              className="hover:text-orange-500"
                            >
                              {isPreviewLoading && previewFile?.path === file.path ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(file)}
                              disabled={isUploading || downloadingFile === file.path}
                              className="hover:text-orange-500"
                            >
                              {downloadingFile === file.path ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFile(file)}
                              disabled={isUploading}
                              className="hover:text-orange-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                    </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
                </div>
          </TabsContent>
        </Tabs>

        {renderFilePreview()}
              </CardContent>
            </Card>
  );
};

export { EquipmentAttachments };
