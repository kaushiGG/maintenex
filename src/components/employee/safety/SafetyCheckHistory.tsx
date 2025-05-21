import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, ClipboardCheck, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SafetyCheckHistoryProps {
  equipmentId: string;
}

interface SafetyCheck {
  id: string;
  equipment_id: string;
  performed_by: string;
  performer_name?: string;
  performed_date: string;
  check_data: any;
  status: string;
  created_at: string;
  issues?: string | null;
  notes?: string | null;
}

const SafetyCheckHistory: React.FC<SafetyCheckHistoryProps> = ({ equipmentId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<SafetyCheck | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchSafetyChecks = async () => {
      setIsLoading(true);
      try {
        // Step 1: Fetch safety checks
        const { data: checksData, error: checksError } = await supabase
          .from('safety_checks')
          .select('*')
          .eq('equipment_id', equipmentId)
          .order('performed_date', { ascending: false });
        
        if (checksError) throw checksError;
        
        if (!checksData || checksData.length === 0) {
          setSafetyChecks([]);
          setIsLoading(false);
          return;
        }
        
        // Step 2: Extract all performer IDs
        const performerIds = checksData
          .map(check => check.performed_by)
          .filter(id => id !== null && id !== undefined);
        
        if (performerIds.length === 0) {
          // No valid performer IDs, just use the checks as-is
          setSafetyChecks(checksData);
          setIsLoading(false);
          return;
        }
        
        // Step 3: Fetch the corresponding profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', performerIds);
        
        // Create a map of profile ID to name for quick lookup
        const profileMap = new Map();
        
        if (!profilesError && profilesData) {
          profilesData.forEach(profile => {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            profileMap.set(profile.id, fullName || 'Unknown User');
          });
        }
        
        // Step 4: Merge the data
        const processedData = checksData.map(check => ({
          ...check,
          performer_name: check.performed_by && profileMap.has(check.performed_by)
            ? profileMap.get(check.performed_by)
            : 'Unknown User'
        }));
        
        setSafetyChecks(processedData);
      } catch (error) {
        console.error('Error fetching safety checks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSafetyChecks();
  }, [equipmentId]);

  const handleViewDetails = (check: SafetyCheck) => {
    setSelectedCheck(check);
    setShowDetails(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
          <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
          Safety Check History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : safetyChecks.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Safety Checks Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no safety checks recorded for this equipment yet.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safetyChecks.map(check => (
                  <TableRow key={check.id}>
                    <TableCell>
                      {check.performed_date && format(parseISO(check.performed_date), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      {(check as any).performer_name}
                    </TableCell>
                    <TableCell>
                      {check.status === 'passed' || check.status === 'completed' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          {check.status === 'passed' ? 'Passed' : 'Completed'}
                        </Badge>
                      ) : check.status === 'performed' ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Performed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          {check.issues ? 'Issues Found' : check.status || 'Issues Found'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(check)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Safety Check Details - {selectedCheck?.performed_date && 
                      format(parseISO(selectedCheck.performed_date), 'MMM d, yyyy h:mm a')}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedCheck && (
                  <div className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Equipment</h3>
                        <p>{selectedCheck.check_data?.equipment_name || 'Unknown Equipment'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Performed By</h3>
                        <p>{(selectedCheck as any).performer_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date</h3>
                        <p>{selectedCheck.performed_date && 
                          format(parseISO(selectedCheck.performed_date), 'MMM d, yyyy h:mm a')}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div className="mt-1">
                          {selectedCheck.status === 'passed' || selectedCheck.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              {selectedCheck.status === 'passed' ? 'Passed' : 'Completed'}
                            </Badge>
                          ) : selectedCheck.status === 'performed' ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Performed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                              {selectedCheck.issues ? 'Issues Found' : selectedCheck.status || 'Issues Found'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Check Items</h3>
                      <div className="border rounded p-3 bg-gray-50">
                        {selectedCheck.check_data && Array.isArray(selectedCheck.check_data) ? (
                          // For data stored as array directly in check_data
                          <ul className="space-y-2">
                            {selectedCheck.check_data.map((item: any, index: number) => (
                              <li key={index} className="flex gap-2">
                                {item.checked ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                )}
                                <span>{item.label}</span>
                              </li>
                            ))}
                          </ul>
                        ) : selectedCheck.check_data?.items ? (
                          // For data stored in check_data.items
                          <ul className="space-y-2">
                            {selectedCheck.check_data.items.map((item: any, index: number) => (
                              <li key={index} className="flex gap-2">
                                {item.checked ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                )}
                                <span>{item.label}</span>
                              </li>
                            ))}
                          </ul>
                        ) : selectedCheck.check_data ? (
                          // For data stored as string in check_data
                          <div>
                            {(() => {
                              try {
                                const parsedData = JSON.parse(selectedCheck.check_data);
                                if (Array.isArray(parsedData)) {
                                  return (
                                    <ul className="space-y-2">
                                      {parsedData.map((item: any, index: number) => (
                                        <li key={index} className="flex gap-2">
                                          {item.checked ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                          ) : (
                                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                          )}
                                          <span>{item.label}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                } else {
                                  return <p>No check items available</p>;
                                }
                              } catch (e) {
                                return <p>Unable to display check items</p>;
                              }
                            })()}
                          </div>
                        ) : (
                          <p>No check items available</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Display issues - check both locations */}
                    {(selectedCheck.issues || selectedCheck.check_data?.issues) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Issues Identified</h3>
                        <div className="border rounded p-3 bg-red-50 text-red-800">
                          {selectedCheck.issues || selectedCheck.check_data?.issues}
                        </div>
                      </div>
                    )}
                    
                    {/* Display notes - check both locations */}
                    {(selectedCheck.notes || selectedCheck.check_data?.notes) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h3>
                        <div className="border rounded p-3 bg-gray-50">
                          {selectedCheck.notes || selectedCheck.check_data?.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SafetyCheckHistory; 