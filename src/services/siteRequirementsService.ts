import { supabase } from '@/integrations/supabase/client';
import { Requirement, RequirementAttachment, RequirementCategory, RequirementFrequency } from '@/components/sites/SiteRequirements';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface RequirementFormData {
  title: string;
  description: string;
  category: RequirementCategory;
  frequency: RequirementFrequency;
  effectiveDate: Date;
  relatedSites: string[];
  attachments?: RequirementAttachment[];
}

const convertJsonToAttachments = (jsonData: Json | null): RequirementAttachment[] => {
  if (!jsonData) return [];
  
  try {
    if (Array.isArray(jsonData)) {
      return jsonData.map(item => {
        if (typeof item === 'object' && item !== null) {
          const name = typeof (item as any).name === 'string' ? (item as any).name : 'Unknown';
          const type = typeof (item as any).type === 'string' ? (item as any).type : 'unknown';
          const url = typeof (item as any).url === 'string' ? (item as any).url : '';
          
          return { name, type, url };
        }
        return { name: 'Unknown', type: 'unknown', url: '' };
      });
    }
    
    if (typeof jsonData === 'object' && jsonData !== null) {
      const obj = jsonData as any;
      const name = typeof obj.name === 'string' ? obj.name : 'Unknown';
      const type = typeof obj.type === 'string' ? obj.type : 'unknown';
      const url = typeof obj.url === 'string' ? obj.url : '';
      
      return [{ name, type, url }];
    }
  } catch (error) {
    console.error('Error parsing attachments from JSON:', error);
  }
  
  return [];
};

export const fetchSiteRequirements = async (siteId?: string, category: string = 'all'): Promise<Requirement[]> => {
  try {
    let query = supabase
      .from('site_requirements')
      .select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching requirements:", error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.log("No requirements found, returning mock data");
      return mockRequirements;
    }
    
    const requirements: Requirement[] = data.map(item => {
      const attachments: RequirementAttachment[] = convertJsonToAttachments(item.attachments);
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category as RequirementCategory,
        frequency: item.frequency as RequirementFrequency,
        lastUpdated: new Date(item.last_updated),
        effectiveDate: new Date(item.effective_date),
        attachments,
        relatedSites: item.related_sites || []
      };
    });
    
    if (siteId) {
      return requirements.filter(req => 
        req.relatedSites.includes(siteId)
      );
    }
    
    return requirements;
  } catch (error) {
    console.error('Error fetching site requirements:', error);
    return mockRequirements;
  }
};

export const addSiteRequirement = async (formData: RequirementFormData): Promise<string> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      toast.error('You must be logged in to add requirements');
      throw new Error('User not authenticated');
    }
    
    const attachmentsForJson = formData.attachments ? formData.attachments.map(attachment => ({
      name: attachment.name,
      type: attachment.type,
      url: attachment.url
    })) : [];
    
    const { data, error } = await supabase
      .from('site_requirements')
      .insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        frequency: formData.frequency,
        effective_date: formData.effectiveDate.toISOString(),
        last_updated: new Date().toISOString(),
        related_sites: formData.relatedSites,
        attachments: attachmentsForJson as unknown as Json,
        created_by: userData.user.id
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Insert error:", error);
      throw new Error(error.message);
    }
    
    return data.id;
  } catch (error) {
    console.error('Error adding site requirement:', error);
    throw error;
  }
};

export const deleteSiteRequirement = async (requirementId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_requirements')
      .delete()
      .eq('id', requirementId);
      
    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete requirement: " + error.message);
      return false;
    }
    
    toast.success("Requirement deleted successfully");
    return true;
  } catch (error) {
    console.error('Error deleting site requirement:', error);
    toast.error("An unexpected error occurred while deleting");
    return false;
  }
};

const mockRequirements: Requirement[] = [
  {
    id: 'req-001',
    title: 'Fire Safety Compliance Regulation',
    description: 'All buildings must comply with the Fire Safety Act 2023 requiring regular inspections of fire equipment, clear emergency exits, and evacuation plans.',
    category: 'regulatory',
    frequency: 'quarterly',
    lastUpdated: new Date('2023-11-15'),
    effectiveDate: new Date('2024-01-01'),
    attachments: [
      { name: 'Fire_Safety_Act_2023.pdf', type: 'pdf', url: '#' },
      { name: 'Evacuation_Plan_Template.docx', type: 'document', url: '#' }
    ],
    relatedSites: ['1', '2', '3', '4']
  },
  {
    id: 'req-002',
    title: 'Electrical Testing Requirements',
    description: 'All electrical equipment must be tested and tagged according to AS/NZS 3760 standards. RCD testing must be performed quarterly.',
    category: 'regulatory',
    frequency: 'quarterly',
    lastUpdated: new Date('2023-10-20'),
    effectiveDate: new Date('2023-11-01'),
    attachments: [
      { name: 'AS_NZS_3760_Summary.pdf', type: 'pdf', url: '#' },
      { name: 'Testing_Schedule_Template.xlsx', type: 'spreadsheet', url: '#' }
    ],
    relatedSites: ['1', '2', '5']
  },
  {
    id: 'req-003',
    title: 'Corporate Health & Safety Standards',
    description: 'Internal corporate standards for workplace health and safety exceed regulatory requirements and include additional monthly inspections.',
    category: 'corporate',
    frequency: 'monthly',
    lastUpdated: new Date('2023-12-01'),
    effectiveDate: new Date('2024-01-15'),
    attachments: [
      { name: 'Corporate_HS_Manual.pdf', type: 'pdf', url: '#' },
      { name: 'Monthly_Inspection_Checklist.pdf', type: 'pdf', url: '#' }
    ],
    relatedSites: ['1', '2', '3', '4', '5', '6']
  }
];
