import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, CalendarRange, Clock, AlertCircle, Eye, AlertTriangle, CheckCircle, History, Bell, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, addDays, addWeeks, addMonths, addYears, isBefore, parseISO, compareAsc } from 'date-fns';
import SafetyInfoModal from './SafetyInfoModal';
import { useAuth } from '@/context/AuthContext';

interface EquipmentWithSafety {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category?: string;
  safety_frequency: string;
  safety_instructions: string;
  authorized_officers: string[] | string;
  safety_manager_id: string;
  training_video_url: string;
  training_video_name: string;
  last_safety_check: string | null;
  safety_manager_name?: string;
  authorized_officers_names?: string;
}

interface SafetyCheckSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  manufacturer: string;
  scheduledDate: Date;
  frequency: string;
  isPastDue: boolean;
  instructions: string;
  authorisedOfficers: string[] | string;
  safetyManager: string;
  videoUrl: string;
  videoName: string;
}

interface CompletedSafetyCheck {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_manufacturer: string;
  performed_by: string;
  performed_by_name: string;
  performed_date: string;
  notes: string | null;
  status: string;
  issues: string | null;
  check_data: any;
  created_at: string;
}

const UpcomingSafetyChecks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [equipment, setEquipment] = useState<EquipmentWithSafety[]>([]);
  const [schedules, setSchedules] = useState<SafetyCheckSchedule[]>([]);
  const [completedChecks, setCompletedChecks] = useState<CompletedSafetyCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithSafety | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSafetyOfficer, setIsSafetyOfficer] = useState(false);

  useEffect(() => {
    // Get the current user's role and check if they're a safety officer
    const getUserRoleAndData = async () => {
      if (user?.id) {
        try {
          // Get user role from profiles
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            const role = data.role;
            setUserRole(role);
            setIsSafetyOfficer(role === 'safety officer');
            
            console.log('User role detected:', role, 'isSafetyOfficer:', role === 'safety officer');
            
            // Only fetch data after role is determined
            await fetchEquipmentWithSafety(role === 'safety officer');
            await fetchCompletedSafetyChecks(role === 'safety officer');
          } else {
            console.error('Error fetching user role:', error);
            // Fallback to regular fetch with no role-based filtering
            await fetchEquipmentWithSafety(false);
            await fetchCompletedSafetyChecks(false);
          }
        } catch (error) {
          console.error('Error in getUserRoleAndData:', error);
          // Fallback to regular fetch with no role-based filtering
          await fetchEquipmentWithSafety(false);
          await fetchCompletedSafetyChecks(false);
        }
      } else {
        console.log('No user ID available, fetching all equipment');
        // No user ID available, fetch all equipment
        await fetchEquipmentWithSafety(false);
        await fetchCompletedSafetyChecks(false);
      }
    };
    
    getUserRoleAndData();
  }, [user]);

  useEffect(() => {
    if (equipment.length > 0) {
      const scheduleData = generateSchedules();
      setSchedules(scheduleData);
    }
  }, [equipment]);

  useEffect(() => {
    if (schedules.length > 0) {
      const count = schedules.filter(s => s.isPastDue).length;
      setOverdueCount(count);
    }
  }, [schedules]);

  const fetchEquipmentWithSafety = async (isSafetyOfficerParam = false) => {
    console.log('Fetching equipment with isSafetyOfficer:', isSafetyOfficerParam);
    setIsLoading(true);
    setHasError(false);
    try {
      // Fetch equipment with safety frequency set
      let query = supabase
        .from('equipment')
        .select('*, safety_manager:safety_manager_id(first_name, last_name)')
        .not('safety_frequency', 'is', null)
        .not('safety_frequency', 'eq', '')
        .order('name');
      
      const { data: equipmentData, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (!equipmentData || equipmentData.length === 0) {
        throw new Error('No equipment with safety data found');
      }
      
      // Log raw equipment data to inspect authorised_officers format
      console.log('Raw equipment data count:', equipmentData.length);
      
      // For safety officers, only show equipment they are authorized for
      let filteredEquipment = equipmentData;
      
      if (isSafetyOfficerParam && user?.id) {
        console.log('Filtering equipment for safety officer with ID:', user.id);
        
        // Filter for equipment where the current user is an authorized officer
        filteredEquipment = equipmentData.filter(item => {
          // Handle different formats of authorized_officers
          if (!item.authorized_officers) return false;
          
          let officerIds: string[] = [];
          
          if (typeof item.authorized_officers === 'string') {
            try {
              // Try to parse as JSON
              officerIds = JSON.parse(item.authorized_officers);
            } catch (e) {
              // If parsing fails, treat as comma-separated string
              officerIds = item.authorized_officers.split(',').map(id => id.trim());
            }
          } else if (Array.isArray(item.authorized_officers)) {
            officerIds = item.authorized_officers;
          }
          
          // Check if current user's ID is in the authorized officers list
          const isAuthorized = officerIds.includes(user.id);
          if (isAuthorized) {
            console.log(`User is authorized for equipment: ${item.name} (${item.id})`);
          }
          return isAuthorized;
        });
        
        console.log('Filtered equipment for safety officer:', filteredEquipment.length, 'out of', equipmentData.length);
      }
      
      // Fetch profile information for authorized officers
      const processedEquipment = await Promise.all(filteredEquipment.map(async (item) => {
        let authorizedOfficersNames = 'Not assigned';
        
        if (item.authorized_officers) {
          try {
            // Handle different possible formats of authorised_officers
            let officerIds = [];
            
            if (typeof item.authorized_officers === 'string') {
              // Try parsing as JSON string
              try {
                officerIds = JSON.parse(item.authorized_officers);
              } catch (parseError) {
                // If not valid JSON, could be comma-separated or single value
                officerIds = item.authorized_officers.split(',').map(id => id.trim());
              }
            } else if (Array.isArray(item.authorized_officers)) {
              officerIds = item.authorized_officers;
            }
            
            // Filter out empty values and ensure we have valid IDs
            officerIds = officerIds.filter(id => id && id !== '');
            
            if (officerIds.length > 0) {
              // Fetch officer profiles
              const { data: officerProfiles, error: officerError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', officerIds);
              
              if (!officerError && officerProfiles && officerProfiles.length > 0) {
                authorizedOfficersNames = officerProfiles.map(profile => 
                  `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                ).join(', ');
              } else if (officerError) {
                console.error('Error fetching officer profiles:', officerError);
              }
            }
          } catch (e) {
            console.error('Error processing authorized officers:', e);
          }
        }
        
        return {
        ...item,
          safety_frequency: item.safety_frequency || 'weekly',
          safety_manager_name: item.safety_manager ? 
            `${item.safety_manager.first_name || ''} ${item.safety_manager.last_name || ''}`.trim() : 
            'Not assigned',
          authorized_officers_names: authorizedOfficersNames
        };
      }));
      
      console.log('Final processed equipment count:', processedEquipment.length);
      
      setEquipment(processedEquipment);
      const scheduleData = generateSchedules();
      setSchedules(scheduleData);
    } catch (error: any) {
      setHasError(true);
      console.error('Error fetching equipment with safety data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedSafetyChecks = async (isSafetyOfficerParam = false) => {
    setIsLoadingHistory(true);
    try {
      // Base query to fetch all safety checks with performer and equipment info
      let query = supabase
        .from('safety_checks')
        .select(`
          *,
          equipment:equipment_id(name, manufacturer, authorized_officers)
        `)
        .order('created_at', { ascending: false });
      
      // For safety officers, only show checks for equipment they are assigned to
      if (isSafetyOfficerParam && user?.id) {
        console.log('Filtering completed checks for safety officer:', user.id);
        
        // First get equipment IDs where user is authorized
        const { data: authorizedEquipment } = await supabase
          .from('equipment')
          .select('id, authorized_officers');
        
        if (authorizedEquipment && authorizedEquipment.length > 0) {
          // Filter for equipment where user is an authorized officer
          const authorizedEquipmentIds = authorizedEquipment
            .filter(item => {
              if (!item.authorized_officers) return false;
              
              let officerIds: string[] = [];
              
              if (typeof item.authorized_officers === 'string') {
                try {
                  officerIds = JSON.parse(item.authorized_officers);
                } catch (e) {
                  officerIds = item.authorized_officers.split(',').map(id => id.trim());
                }
              } else if (Array.isArray(item.authorized_officers)) {
                officerIds = item.authorized_officers;
              }
              
              return officerIds.includes(user.id);
            })
            .map(item => item.id);
          
          console.log('Authorized equipment IDs for safety checks:', authorizedEquipmentIds);
          
          // Then filter safety checks for those equipment IDs
          if (authorizedEquipmentIds.length > 0) {
            query = query.in('equipment_id', authorizedEquipmentIds);
          } else {
            // If no authorized equipment, return empty result
            console.log('No authorized equipment found for safety officer');
            setCompletedChecks([]);
            setIsLoadingHistory(false);
            return;
          }
        }
      }
      
      const { data: checksData, error: checksError } = await query;
      
      if (checksError) {
        console.error('Error fetching safety checks:', checksError);
        setIsLoadingHistory(false);
        return;
      }
      
      if (!checksData || checksData.length === 0) {
        setCompletedChecks([]);
        setIsLoadingHistory(false);
        return;
      }
      
      console.log('Raw safety checks data:', checksData);
      
      // Extract performer IDs for profile lookup
      const performerIds = checksData
        .map(check => check.performed_by)
        .filter(id => id !== null && id !== undefined);
      
      // Fetch profile data for performers
      let profileMap = new Map();
      
      if (performerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', performerIds);
        
        if (profilesData && profilesData.length > 0) {
          profilesData.forEach(profile => {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            profileMap.set(profile.id, fullName || 'Unknown User');
          });
        }
      }
      
      // Transform the data to match our interface
      const transformedData: CompletedSafetyCheck[] = checksData.map((check: any) => ({
        id: check.id,
        equipment_id: check.equipment_id,
        equipment_name: check.equipment?.name || 'Unknown Equipment',
        equipment_manufacturer: check.equipment?.manufacturer || 'N/A',
        performed_by: check.performed_by,
        performed_by_name: check.performed_by && profileMap.has(check.performed_by)
          ? profileMap.get(check.performed_by)
          : 'Unknown User',
        performed_date: check.performed_date || check.created_at,
        notes: check.notes,
        status: check.status || 'performed',
        issues: check.issues,
        check_data: check.check_data,
        created_at: check.created_at
      }));
      
      console.log('Transformed safety checks:', transformedData);
      setCompletedChecks(transformedData);
    } catch (error: any) {
      console.error('Error fetching completed safety checks:', error.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const generateSchedules = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    const oneYearFromNow = addYears(now, 1);
    const allSchedules: SafetyCheckSchedule[] = [];

    equipment.forEach(item => {
      const scheduleList = generateScheduleForEquipment(item, now, oneYearFromNow);
      allSchedules.push(...scheduleList);
    });

    // Identify past due safety checks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const schedulesWithPastDue = allSchedules.map(schedule => ({
      ...schedule,
      isPastDue: schedule.scheduledDate < today
    }));

    // Sort by date
    schedulesWithPastDue.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    return schedulesWithPastDue;
  };

  // Calculate the next occurrence of a specific day of week from today
  const getNextDayOfWeek = (dayOfWeek: number, startDate = new Date()): Date => {
    const date = new Date(startDate);
    date.setHours(0, 0, 0, 0);
    
    // In JavaScript, 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilTargetDay = (dayOfWeek + 7 - date.getDay()) % 7;
    
    // If today is the target day, return today
    if (daysUntilTargetDay === 0) {
      return date;
    }
    
    // Otherwise, get the next occurrence
    date.setDate(date.getDate() + daysUntilTargetDay);
    return date;
  };

  const generateScheduleForEquipment = (
    equipment: EquipmentWithSafety, 
    startDate: Date, 
    endDate: Date
  ): SafetyCheckSchedule[] => {
    const scheduleList: SafetyCheckSchedule[] = [];
    const today = new Date(startDate);
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    // Determine the interval based on frequency
    const getNextDate = (date: Date): Date => {
      const frequency = equipment.safety_frequency?.toLowerCase() || '';
      const nextDate = new Date(date);
      
      switch (frequency) {
        case 'daily':
          return addDays(nextDate, 1);
        case 'weekly':
          return addDays(nextDate, 7);
        case 'monthly':
          return addMonths(nextDate, 1);
        case 'quarterly':
          return addMonths(nextDate, 3);
        case 'biannually':
          return addMonths(nextDate, 6);
        case 'annually':
          return addYears(nextDate, 1);
        default:
          return addMonths(nextDate, 1);
      }
    };

    // For weekly frequency, create checks on a consistent day of the week
    if (equipment.safety_frequency?.toLowerCase() === 'weekly') {
      // For weekly checks, schedule on Fridays (5 = Friday)
      const WEEKLY_CHECK_DAY = 5; // Friday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      
      // Get the next Friday (or today if it is Friday)
      const firstCheckDate = getNextDayOfWeek(WEEKLY_CHECK_DAY, today);
      
      // Add the first check
      scheduleList.push({
        id: `${equipment.id}-${firstCheckDate.getTime()}`,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        manufacturer: equipment.manufacturer || 'N/A',
        scheduledDate: new Date(firstCheckDate),
        frequency: equipment.safety_frequency,
        isPastDue: false,
        instructions: equipment.safety_instructions || '',
        authorisedOfficers: equipment.authorized_officers_names || 'Not assigned',
        safetyManager: equipment.safety_manager_name || 'Not assigned',
        videoUrl: equipment.training_video_url || '',
        videoName: equipment.training_video_name || ''
      });
      
      // Generate future weekly checks
      let weeklyDate = addDays(firstCheckDate, 7); // Next week's Friday
      
      for (let i = 0; i < 12; i++) {
        if (!isBefore(weeklyDate, endDate)) break;
        
        scheduleList.push({
          id: `${equipment.id}-${weeklyDate.getTime()}`,
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          manufacturer: equipment.manufacturer || 'N/A',
          scheduledDate: new Date(weeklyDate),
          frequency: equipment.safety_frequency,
          isPastDue: false,
          instructions: equipment.safety_instructions || '',
          authorisedOfficers: equipment.authorized_officers_names || 'Not assigned',
          safetyManager: equipment.safety_manager_name || 'Not assigned',
          videoUrl: equipment.training_video_url || '',
          videoName: equipment.training_video_name || ''
        });
        
        weeklyDate = addDays(weeklyDate, 7); // Next Friday
      }
    } else {
      // For non-weekly frequencies, use the original approach
      // First, add today's check
      scheduleList.push({
        id: `${equipment.id}-${today.getTime()}`,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        manufacturer: equipment.manufacturer || 'N/A',
        scheduledDate: new Date(today),
        frequency: equipment.safety_frequency,
        isPastDue: false,
        instructions: equipment.safety_instructions || '',
        authorisedOfficers: equipment.authorized_officers_names || 'Not assigned',
        safetyManager: equipment.safety_manager_name || 'Not assigned',
        videoUrl: equipment.training_video_url || '',
        videoName: equipment.training_video_name || ''
      });
      
      // Generate future checks
      let currentDate = getNextDate(today);
      
      // Generate future checks (at least 12)
      for (let i = 0; i < 12; i++) {
        if (!isBefore(currentDate, endDate)) break;
        
        scheduleList.push({
          id: `${equipment.id}-${currentDate.getTime()}`,
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          manufacturer: equipment.manufacturer || 'N/A',
          scheduledDate: new Date(currentDate),
          frequency: equipment.safety_frequency,
          isPastDue: false,
          instructions: equipment.safety_instructions || '',
          authorisedOfficers: equipment.authorized_officers_names || 'Not assigned',
          safetyManager: equipment.safety_manager_name || 'Not assigned',
          videoUrl: equipment.training_video_url || '',
          videoName: equipment.training_video_name || ''
        });
        
        currentDate = getNextDate(currentDate);
      }
    }
    
    return scheduleList;
  };

  const getFrequencyLabel = (frequency: string): string => {
    const mapping: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly (Fridays)',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly (3 months)',
      'biannually': 'Bi-annually (6 months)',
      'annually': 'Annually (yearly)'
    };
    return mapping[frequency?.toLowerCase()] || frequency;
  };

  // Function to highlight if a check is scheduled for the current week
  const isThisWeek = (date: Date): boolean => {
    const now = new Date();
    
    // Calculate start of the current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Check if the date falls within this week's range
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Calculate the next appropriate weekly check day from today
  const getNextWeeklyCheckDay = (startFrom: Date = new Date()): Date => {
    const today = new Date(startFrom);
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    // If it's already the correct day of week, return today
    // Otherwise return the next occurrence of the day
    return today;
  };

  // Sort schedules giving priority to overdue items and then weekly checks
  const sortSchedules = (schedules: SafetyCheckSchedule[]): SafetyCheckSchedule[] => {
    return [...schedules].sort((a, b) => {
      // First priority: Overdue checks
      if (a.isPastDue && !b.isPastDue) return -1;
      if (!a.isPastDue && b.isPastDue) return 1;
      
      // Second priority: This week's weekly checks
      const aIsWeeklyThisWeek = a.frequency?.toLowerCase() === 'weekly' && isThisWeek(a.scheduledDate);
      const bIsWeeklyThisWeek = b.frequency?.toLowerCase() === 'weekly' && isThisWeek(b.scheduledDate);
      
      if (aIsWeeklyThisWeek && !bIsWeeklyThisWeek) return -1;
      if (!aIsWeeklyThisWeek && bIsWeeklyThisWeek) return 1;
      
      // Third priority: Weekly checks
      const aIsWeekly = a.frequency?.toLowerCase() === 'weekly';
      const bIsWeekly = b.frequency?.toLowerCase() === 'weekly';
      
      if (aIsWeekly && !bIsWeekly) return -1;
      if (!aIsWeekly && bIsWeekly) return 1;
      
      // Fourth priority: Sort by date
      return a.scheduledDate.getTime() - b.scheduledDate.getTime();
    });
  };

  const handlePerformSafetyCheck = (equipmentId: string) => {
    navigate(`/employee/safety-checks/${equipmentId}`);
  };

  const handleViewEquipmentDetails = (equipmentId: string) => {
    const found = equipment.find(e => e.id === equipmentId);
    if (found) {
      setSelectedEquipment(found);
      setIsModalOpen(true);
    }
  };

  // Filter schedules based on the active tab
  const filteredSchedules = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Get the end of the current week
    const endOfThisWeek = new Date(now);
    endOfThisWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
    endOfThisWeek.setHours(23, 59, 59, 999);
    
    // Get the start of next week (Sunday after this week)
    const startOfNextWeek = new Date(endOfThisWeek);
    startOfNextWeek.setDate(endOfThisWeek.getDate() + 1);
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    switch (activeTab) {
      case 'overdue':
        // Overdue: Show safety checks that are past due
        return sortSchedules(schedules.filter(s => s.isPastDue));
      case 'upcoming':
        // This Week: Show only schedules for the current week
        return sortSchedules(schedules.filter(s => isThisWeek(s.scheduledDate)));
      case 'future':
        // Future Checks: Show schedules beyond this week
        return sortSchedules(schedules.filter(s => s.scheduledDate >= startOfNextWeek));
      case 'all':
        // All scheduled checks from today onwards
        return sortSchedules(schedules);
      default:
        return [];
    }
  })();

  // Filter completed checks to only show relevant ones
  const filteredCompletedChecks = (() => {
    // Show all safety checks
    return completedChecks;
  })();

  // Get recent checks for completed tab
  const recentCompletedChecks = filteredCompletedChecks.slice(0, 10);

  // Don't show error state, always try to render with available data
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-blue-500" />
            {isSafetyOfficer ? "Your Assigned Safety Checks" : "Equipment Safety Checks"}
          </CardTitle>
          <div className="text-xs text-gray-500 flex items-start gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              {isSafetyOfficer 
                ? "Only showing equipment you are authorized to check as a safety officer" 
                : "Only equipment with safety check requirements configured will appear here"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              {overdueCount > 0 && (
                <TabsTrigger value="overdue" className="flex items-center gap-1 bg-red-50 text-red-900 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  <AlertTriangle className="h-4 w-4" />
                  Overdue
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-700 text-white text-xs font-bold">
                    {overdueCount}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger value="upcoming">This Week</TabsTrigger>
              <TabsTrigger value="future">Future Checks</TabsTrigger>
              <TabsTrigger value="all">All Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {activeTab === 'completed' ? (
                // Render completed checks table
                isLoadingHistory ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : recentCompletedChecks.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date Performed</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Performed By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issues Found</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentCompletedChecks.map((check) => (
                          <TableRow key={check.id}>
                            <TableCell className="font-medium">
                              {format(new Date(check.performed_date), 'MMM d, yyyy')}
                              <div className="text-xs text-gray-500">
                                {format(new Date(check.performed_date), 'h:mm a')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{check.equipment_name}</div>
                              <div className="text-xs text-gray-500">{check.equipment_manufacturer}</div>
                            </TableCell>
                            <TableCell>{check.performed_by_name}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                check.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : check.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : check.status === 'performed'
                                      ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {check.status === 'completed' ? 'Completed' : 
                                 check.status === 'failed' ? 'Failed' : 
                                 check.status === 'performed' ? 'Performed' : 'Pending'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {check.issues ? (
                                <span className="flex items-center text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Yes
                                </span>
                              ) : (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  No
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-lg bg-gray-50">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Safety Check Records Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No recently completed safety checks found.
                    </p>
                  </div>
                )
              ) : isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredSchedules.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  {activeTab === 'overdue' && (
                    <div className="bg-red-100 p-4 border-b border-red-200">
                      <div className="flex gap-2 items-start">
                        <Bell className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0 animate-pulse" />
                        <div>
                          <h3 className="font-semibold text-red-900">Critical Safety Alert</h3>
                          <p className="text-red-800 text-sm">
                            {overdueCount} overdue safety {overdueCount === 1 ? 'check needs' : 'checks need'} immediate attention. 
                            These checks are past their scheduled date and represent a significant safety risk.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Safety Manager</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.slice(0, 50).map((schedule) => (
                        <TableRow 
                          key={schedule.id}
                          className={schedule.isPastDue ? 'bg-red-50' : undefined}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {schedule.isPastDue && (
                                <div className="relative">
                                  <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                  </span>
                                </div>
                              )}
                              {schedule.frequency?.toLowerCase() === 'weekly' && isThisWeek(schedule.scheduledDate) && (
                                <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 text-xs font-medium">This Friday</span>
                              )}
                              <div>
                                <div className={schedule.isPastDue ? 'text-red-700 font-bold' : ''}>
                                  {format(schedule.scheduledDate, 'MMM d, yyyy')}
                                  {schedule.isPastDue && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-red-200 text-red-800 text-xs font-bold">
                                      OVERDUE
                                    </span>
                                  )}
                                </div>
                                <div className={`text-xs ${
                                  schedule.isPastDue 
                                    ? 'text-red-600 font-medium' 
                                    : schedule.frequency?.toLowerCase() === 'weekly' 
                                    ? 'font-medium text-blue-600' 
                                    : 'text-gray-500'
                                }`}>
                                  {format(schedule.scheduledDate, 'EEEE')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{schedule.equipmentName}</div>
                            <div className="text-xs text-gray-500">{schedule.manufacturer}</div>
                          </TableCell>
                          <TableCell>
                            {schedule.frequency?.toLowerCase() === 'weekly' ? (
                              <span className="font-medium text-blue-600">{getFrequencyLabel(schedule.frequency)}</span>
                            ) : (
                              getFrequencyLabel(schedule.frequency)
                            )}
                          </TableCell>
                          <TableCell>
                            {schedule.safetyManager}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEquipmentDetails(schedule.equipmentId)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={schedule.isPastDue ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handlePerformSafetyCheck(schedule.equipmentId)}
                                className={schedule.isPastDue ? "animate-pulse" : ""}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                {schedule.isPastDue ? "Urgent Check" : "Perform Check"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredSchedules.length > 50 && (
                    <div className="px-4 py-2 text-sm text-gray-500 border-t">
                      Showing 50 of {filteredSchedules.length} scheduled checks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg bg-gray-50">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Scheduled Checks Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {activeTab === 'overdue' 
                      ? "No overdue safety checks found. All safety checks are up to date."
                      : activeTab === 'upcoming' 
                        ? "No safety checks are scheduled for this week."
                        : activeTab === 'future'
                          ? "No future safety checks are scheduled beyond this week."
                          : "No upcoming safety checks are scheduled at this time."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Safety Info Modal */}
      <SafetyInfoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipment={selectedEquipment}
        onPerformCheck={handlePerformSafetyCheck}
      />
    </>
  );
};

export default UpcomingSafetyChecks; 