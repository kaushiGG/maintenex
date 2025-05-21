import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, AlertTriangle, Clock, Plus, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddRequirementDialog from './requirements/AddRequirementDialog';
import { fetchSiteRequirements, deleteSiteRequirement } from '@/services/siteRequirementsService';
import { toast } from 'sonner';

export type RequirementCategory = 'regulatory' | 'corporate' | 'local';
export type RequirementFrequency = 'monthly' | 'quarterly' | 'biannually' | 'annually';

export interface RequirementAttachment {
  name: string;
  type: string;
  url: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  frequency: RequirementFrequency;
  lastUpdated: Date;
  effectiveDate: Date;
  attachments: RequirementAttachment[];
  relatedSites: string[];
}

interface SiteRequirementsProps {
  siteId?: string;
}

const SiteRequirements: React.FC<SiteRequirementsProps> = ({ siteId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadRequirements();
  }, [siteId, selectedCategory]);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSiteRequirements(siteId, selectedCategory);
      setRequirements(data);
    } catch (error) {
      console.error("Failed to load requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequirementSuccess = () => {
    setIsAddDialogOpen(false);
    loadRequirements();
    toast.success("Requirement added successfully");
  };

  const handleDeleteClick = (requirementId: string) => {
    setRequirementToDelete(requirementId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!requirementToDelete) return;
    
    const success = await deleteSiteRequirement(requirementToDelete);
    if (success) {
      loadRequirements();
    }
    
    setIsDeleteDialogOpen(false);
    setRequirementToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setRequirementToDelete(null);
  };

  // Helper function to get the category color
  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'regulatory': return 'bg-orange-100 text-orange-800';
      case 'corporate': return 'bg-orange-100 text-orange-800';
      case 'local': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get the frequency icon
  const getFrequencyIcon = (frequency: RequirementFrequency) => {
    switch (frequency) {
      case 'monthly': return <Clock className="h-4 w-4" />;
      case 'quarterly': return <Calendar className="h-4 w-4" />;
      case 'biannually': return <Calendar className="h-4 w-4" />;
      case 'annually': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          {/* Commented out the duplicate 'Site Requirements' heading */}
          {/* <h2 className="text-2xl font-bold">Site Requirements</h2> */}
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
          <TabsTrigger value="local">Local</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-500">No requirements found for this category.</p>
              <Button 
                variant="outline" 
                className="mt-2 hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Requirement
              </Button>
            </div>
          ) : (
            requirements.map((req) => (
              <RequirementCard 
                key={req.id} 
                requirement={req} 
                onDelete={() => handleDeleteClick(req.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <AddRequirementDialog 
            selectedSiteId={siteId} 
            onSuccess={handleAddRequirementSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this requirement
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface RequirementCardProps {
  requirement: Requirement;
  onDelete: () => void;
}

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement, onDelete }) => {
  const [showAttachments, setShowAttachments] = useState(false);

  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'regulatory': return 'bg-orange-100 text-orange-800';
      case 'corporate': return 'bg-orange-100 text-orange-800';
      case 'local': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyIcon = (frequency: RequirementFrequency) => {
    switch (frequency) {
      case 'monthly': return <Clock className="h-4 w-4" />;
      case 'quarterly': return <Calendar className="h-4 w-4" />;
      case 'biannually': return <Calendar className="h-4 w-4" />;
      case 'annually': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getFileIcon = (type: string) => {
    // Determine icon based on file type
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('xls') || type.includes('sheet')) return '📊';
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️';
    return '📎';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className={getCategoryColor(requirement.category)}>
              {requirement.category.charAt(0).toUpperCase() + requirement.category.slice(1)}
            </Badge>
            <CardTitle className="mt-2">{requirement.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showAttachments ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-500">{requirement.description}</p>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {getFrequencyIcon(requirement.frequency)}
            <span>
              {requirement.frequency.charAt(0).toUpperCase() + requirement.frequency.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Effective: {requirement.effectiveDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FileText className="h-4 w-4" />
            <span>{requirement.attachments.length} attachment(s)</span>
          </div>
        </div>

        {/* Attachments Section */}
        {showAttachments && requirement.attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-sm font-medium mb-2">Attachments</h4>
            <div className="space-y-2">
              {requirement.attachments.map((attachment, index) => (
                <a 
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="mr-2">{getFileIcon(attachment.type)}</span>
                  <span className="text-sm text-orange-600 flex-grow truncate">
                    {attachment.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteRequirements;
