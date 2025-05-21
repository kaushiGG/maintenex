import React, { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/BusinessDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Medal, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  AlertTriangle,
  Star as StarIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AddRatingDialog } from '@/components/contractors/AddRatingDialog';

interface ContractorRating {
  rating: number;
  comment: string;
  created_at: string;
}

interface ContractorPerformance {
  id: string;
  name: string;
  service_type: string;
  rating: number;
  response_time: number; // in minutes
  completion_rate: number;
  quality_score: string;
  trend: 'up' | 'down' | 'stable';
  status: 'Active' | 'Warning' | 'Inactive';
  total_jobs: number;
  completed_jobs: number;
  average_rating: number;
  last_updated: string;
}

interface Job {
  id: string;
  contractor_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  rating?: number;
}

const PerformanceRatings = () => {
  const [loading, setLoading] = useState(true);
  const [contractorPerformance, setContractorPerformance] = useState<ContractorPerformance[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContractor, setSelectedContractor] = useState<{ id: string; name: string } | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  useEffect(() => {
    fetchContractorPerformance();
  }, []);

  const fetchContractorPerformance = async () => {
    try {
      setLoading(true);
      const { data: contractors, error: contractorsError } = await supabase
        .from('contractors')
        .select('*');

      if (contractorsError) throw contractorsError;

      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Calculate performance metrics for each contractor
      const performanceData = contractors.map(contractor => {
        const contractorJobs = (jobs as Job[]).filter(job => job.contractor_id === contractor.id);
        const completedJobs = contractorJobs.filter(job => job.status === 'completed');
        const totalJobs = contractorJobs.length;
        const completionRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;
        
        // Calculate average response time (time between job creation and first response)
        const responseTimes = completedJobs.map(job => {
          const created = new Date(job.created_at).getTime();
          const responded = new Date(job.updated_at).getTime(); // Using updated_at as first response time
          return (responded - created) / (1000 * 60); // Convert to minutes
        });
        const avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0;

        // Get rating from contractor data
        const avgRating = contractor.rating || 0;

        // Calculate trend based on recent jobs
        const recentJobs = completedJobs.slice(-5);
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (recentJobs.length >= 2) {
          const firstHalf = recentJobs.slice(0, Math.floor(recentJobs.length / 2));
          const secondHalf = recentJobs.slice(Math.floor(recentJobs.length / 2));
          const firstAvg = firstHalf.reduce((sum, job) => sum + (job.rating || 0), 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, job) => sum + (job.rating || 0), 0) / secondHalf.length;
          trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
        }

        // Determine quality score
        let qualityScore = 'Average';
        if (avgRating >= 4) qualityScore = 'Excellent';
        else if (avgRating >= 3) qualityScore = 'Very Good';
        else if (avgRating >= 2) qualityScore = 'Good';
        else if (avgRating >= 1) qualityScore = 'Average';
        else qualityScore = 'Poor';

        // Determine status
        let status: 'Active' | 'Warning' | 'Inactive' = 'Active';
        if (completionRate < 80) status = 'Warning';
        if (avgRating < 2) status = 'Warning';
        if (contractor.status === 'inactive') status = 'Inactive';

        return {
          id: contractor.id,
          name: contractor.name,
          service_type: contractor.service_type,
          rating: avgRating,
          response_time: avgResponseTime,
          completion_rate: completionRate,
          quality_score: qualityScore,
          trend,
          status,
          total_jobs: totalJobs,
          completed_jobs: completedJobs.length,
          average_rating: avgRating,
          last_updated: new Date().toISOString()
        };
      });

      setContractorPerformance(performanceData);
    } catch (error) {
      console.error('Error fetching contractor performance:', error);
      toast.error('Failed to load contractor performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}.${mins} hrs` : `${hours} hrs`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRateClick = (contractor: ContractorPerformance) => {
    setSelectedContractor({ id: contractor.id, name: contractor.name });
    setIsRatingDialogOpen(true);
  };

  if (loading) {
    return (
      <BusinessDashboard
        switchRole={() => {}}
        userRole="business"
        handleLogout={() => {}}
        userMode="management"
      >
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4" />
            <p className="text-gray-600">Loading performance metrics...</p>
          </div>
        </div>
      </BusinessDashboard>
    );
  }

  return (
    <BusinessDashboard
      switchRole={() => {}}
      userRole="business"
      handleLogout={() => {}}
      userMode="management"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Contractor Performance Ratings</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Rankings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractorPerformance.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="font-medium">{contractor.name}</TableCell>
                        <TableCell>{contractor.service_type}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-semibold">{contractor.rating.toFixed(1)}</span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatResponseTime(contractor.response_time)}</TableCell>
                        <TableCell>{contractor.completion_rate.toFixed(1)}%</TableCell>
                        <TableCell>{contractor.quality_score}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contractor.status)}>
                            {contractor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRateClick(contractor)}
                            className="flex items-center gap-2"
                          >
                            <StarIcon className="h-4 w-4" />
                            Rate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rankings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Top Rated Contractors
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {[...contractorPerformance]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((contractor, index) => (
                        <div key={contractor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">#{index + 1}</span>
                            <span>{contractor.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold">{contractor.rating.toFixed(1)}</span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                        </div>
                      ))}
                  </div>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Best Completion Rate
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {[...contractorPerformance]
                      .sort((a, b) => b.completion_rate - a.completion_rate)
                      .slice(0, 5)
                      .map((contractor, index) => (
                        <div key={contractor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">#{index + 1}</span>
                            <span>{contractor.name}</span>
                          </div>
                          <span className="font-semibold">{contractor.completion_rate.toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Fastest Response Time
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {[...contractorPerformance]
                      .sort((a, b) => a.response_time - b.response_time)
                      .slice(0, 5)
                      .map((contractor, index) => (
                        <div key={contractor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">#{index + 1}</span>
                            <span>{contractor.name}</span>
                          </div>
                          <span className="font-semibold">{formatResponseTime(contractor.response_time)}</span>
                        </div>
                      ))}
                  </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>

        {selectedContractor && (
          <AddRatingDialog
            isOpen={isRatingDialogOpen}
            onClose={() => {
              setIsRatingDialogOpen(false);
              setSelectedContractor(null);
            }}
            contractorId={selectedContractor.id}
            contractorName={selectedContractor.name}
            onRatingAdded={fetchContractorPerformance}
          />
        )}
      </div>
    </BusinessDashboard>
  );
};

export default PerformanceRatings;
