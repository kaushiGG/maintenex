import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, X, Loader2, Upload, File, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Site } from '@/types/site';
import { addSiteRequirement, RequirementFormData } from '@/services/siteRequirementsService';
import { RequirementCategory, RequirementFrequency, RequirementAttachment } from '../SiteRequirements';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from '@/utils/fileUpload';

const requirementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(['regulatory', 'corporate', 'local'] as const),
  frequency: z.enum(['monthly', 'quarterly', 'biannually', 'annually'] as const),
  effectiveDate: z.date({
    required_error: "Effective date is required",
  }),
  relatedSites: z.array(z.string()).min(1, "At least one site must be selected"),
});

export type RequirementFormValues = z.infer<typeof requirementSchema>;

interface AddRequirementDialogProps {
  selectedSiteId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddRequirementDialog: React.FC<AddRequirementDialogProps> = ({
  selectedSiteId,
  onSuccess,
  onCancel,
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [attachments, setAttachments] = useState<RequirementAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const { data, error } = await supabase
          .from('business_sites')
          .select('id, name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setSites(data.map(site => ({
          id: site.id,
          name: site.name,
          address: '',  // Required by Site type but not needed for this component
          complianceStatus: 'pending',  // Required by Site type but not needed for this component
          assignedContractors: []  // Required by Site type but not needed for this component
        })));
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error("Failed to load sites");
      } finally {
        setSitesLoading(false);
      }
    };
    
    fetchSites();
  }, []);

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'regulatory',
      frequency: 'quarterly',
      effectiveDate: new Date(),
      relatedSites: selectedSiteId ? [selectedSiteId] : [],
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = e.target.files[0];
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB.");
        return;
      }
      
      // Upload file to Supabase storage
      const uploadedFile = await uploadFile(file, 'requirement_files');
      
      if (uploadedFile) {
        // Add the uploaded file to attachments
        setAttachments(prev => [...prev, {
          name: uploadedFile.name,
          type: file.name.split('.').pop() || '',
          url: uploadedFile.url
        }]);
        toast.success(`File "${file.name}" uploaded successfully`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prevAttachments => 
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (data: RequirementFormValues) => {
    try {
      setIsLoading(true);
      const formData: RequirementFormData = {
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        effectiveDate: data.effectiveDate,
        relatedSites: data.relatedSites,
        attachments: attachments // Add the attachments
      };
      await addSiteRequirement(formData);
      toast.success("Requirement added successfully");
      onSuccess();
    } catch (error) {
      console.error("Failed to add requirement:", error);
      toast.error("Failed to add requirement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Add New Requirement</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Fire Safety Regulation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Full description of the requirement" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="biannually">Biannually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Effective Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relatedSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Sites</FormLabel>
                <div className="border rounded-md p-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value.map((siteId) => {
                      const site = sites.find(s => s.id === siteId);
                      return (
                        <div 
                          key={siteId} 
                          className="bg-[#7851CA] text-white px-2 py-1 rounded-md flex items-center gap-1"
                        >
                          <span>{site?.name || "Loading..."}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter(id => id !== siteId));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {sitesLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading sites...</span>
                    </div>
                  ) : (
                    <Select 
                      onValueChange={(value) => {
                        if (!field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add a site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites
                          .filter(site => !field.value.includes(site.id))
                          .map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload Section */}
          <div className="space-y-2">
            <FormLabel>Attachments</FormLabel>
            <div className="border border-dashed rounded-md p-4 text-center">
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Upload related documents, images, or PDFs
              </p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBrowseClick}
                disabled={isUploading}
                className="mt-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : "Select Files"}
              </Button>
              <p className="mt-1 text-xs text-gray-500">
                PDF, Word, Excel, images up to 10MB
              </p>
            </div>
          </div>

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <FormLabel>Attached Files</FormLabel>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-100 rounded-md px-3 py-2"
                  >
                    <File className="h-4 w-4 mr-2 text-[#7851CA]" />
                    <span className="text-sm truncate max-w-[150px]">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || sitesLoading || isUploading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : "Save Requirement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRequirementDialog;
