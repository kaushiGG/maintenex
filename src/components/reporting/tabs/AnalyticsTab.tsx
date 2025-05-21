import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, LineChart, PieChart, ComposedChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { 
  SlidersHorizontal, 
  Download, 
  BarChart2, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Gauge 
} from 'lucide-react';

import { 
  serviceCompletionTrends, 
  costAnalysisByType, 
  contractorPerformanceData, 
  complianceGapData, 
  sitePerformanceMetrics, 
  predictiveMaintenanceData 
} from '../mockData';

// Changed color palette to black and orange theme
const COLORS = ['#000000', '#FF8C00', '#1A1A1A', '#FFA500', '#333333', '#FFB347', '#4D4D4D'];

const AnalyticsTab: React.FC = () => {
  const [analyticsView, setAnalyticsView] = useState('serviceCompletion');
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Interactive Analytics Dashboard</CardTitle>
        <CardDescription className="text-gray-600">
          Visualize key metrics and performance indicators across your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Tabs 
            value={analyticsView} 
            onValueChange={setAnalyticsView} 
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="serviceCompletion" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Service Completion</span>
              </TabsTrigger>
              <TabsTrigger value="costAnalysis" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Cost Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="contractorPerformance" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Contractor Performance</span>
              </TabsTrigger>
              <TabsTrigger value="complianceGap" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Compliance Gap</span>
              </TabsTrigger>
              <TabsTrigger value="sitePerformance" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Gauge className="h-4 w-4" />
                <span className="hidden sm:inline">Site Performance</span>
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Predictive Insights</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            value={selectedSite}
            onValueChange={setSelectedSite}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="brisbane">Brisbane Office</SelectItem>
              <SelectItem value="sydney">Sydney HQ</SelectItem>
              <SelectItem value="melbourne">Melbourne Branch</SelectItem>
              <SelectItem value="perth">Perth Office</SelectItem>
              <SelectItem value="adelaide">Adelaide Store</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="ml-auto hover:bg-orange-100 hover:text-orange-700">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="hover:bg-orange-100 hover:text-orange-700">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-gray-50 p-1 rounded-md">
          {/* Service Completion Trends */}
          {analyticsView === 'serviceCompletion' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Service Completion Trends</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceCompletionTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="completed" name="Completed Services" stackId="a" fill="#FF8C00" />
                    <Bar dataKey="pending" name="Pending Services" stackId="a" fill="#E5E5E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This chart shows the monthly service completion rates across all sites, highlighting both completed and pending services.
              </p>
            </div>
          )}
          
          {/* Cost Analysis */}
          {analyticsView === 'costAnalysis' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Cost Analysis by Service Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costAnalysisByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {costAnalysisByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="flex flex-col justify-center">
                  <h4 className="text-md font-medium mb-4">Cost Breakdown</h4>
                  <div className="space-y-2">
                    {costAnalysisByType.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-sm mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        ${costAnalysisByType.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Contractor Performance */}
          {analyticsView === 'contractorPerformance' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Contractor Performance Comparison</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contractorPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={50} />
                    <Bar dataKey="reliability" name="Reliability" fill="#000000" />
                    <Bar dataKey="responseTime" name="Response Time" fill="#FF8C00" />
                    <Bar dataKey="qualityScore" name="Quality Score" fill="#1A1A1A" />
                    <Bar dataKey="costEfficiency" name="Cost Efficiency" fill="#FFA500" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This chart compares performance metrics across contractors, including reliability, response time, quality, and cost efficiency.
              </p>
            </div>
          )}
          
          {/* Compliance Gap Analysis */}
          {analyticsView === 'complianceGap' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Compliance Gap Analysis by Site</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={complianceGapData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="site" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="compliant" name="Compliant (%)" stackId="a" fill="#FF8C00" />
                    <Bar dataKey="nonCompliant" name="Non-Compliant (%)" stackId="a" fill="#333333" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {complianceGapData.map((site, index) => (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: site.compliant > 90 ? '#22c55e' : site.compliant > 80 ? '#FF8C00' : '#000000' }}>
                    <CardContent className="p-4">
                      <h4 className="font-medium">{site.site}</h4>
                      <div className="mt-2 flex justify-between items-center">
                        <span>Compliance Rate:</span>
                        <Badge variant={site.compliant > 90 ? 'default' : site.compliant > 80 ? 'outline' : 'destructive'} 
                               className={site.compliant > 90 ? 'bg-green-100 text-green-800' : site.compliant > 80 ? 'bg-orange-100 text-orange-800' : 'bg-black text-white'}>
                          {site.compliant}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Site Performance Metrics */}
          {analyticsView === 'sitePerformance' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Site Performance Metrics</h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Service Efficiency</TableHead>
                      <TableHead>Compliance Score</TableHead>
                      <TableHead>Maintenance Cost</TableHead>
                      <TableHead>Incident Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sitePerformanceMetrics.map((site, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${site.serviceEfficiency}%` }}
                              />
                            </div>
                            <span>{site.serviceEfficiency}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  site.complianceScore > 90 ? 'bg-green-500' : 
                                  site.complianceScore > 80 ? 'bg-orange-500' : 'bg-black'
                                }`}
                                style={{ width: `${site.complianceScore}%` }}
                              />
                            </div>
                            <span>{site.complianceScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>${site.maintenanceCost.toLocaleString()}</TableCell>
                        <TableCell>{site.incidentRate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              site.complianceScore > 90 && site.serviceEfficiency > 90 
                                ? 'bg-green-100 text-green-800 border-0' 
                                : site.complianceScore > 80 && site.serviceEfficiency > 80
                                ? 'bg-orange-100 text-orange-800 border-0'
                                : 'bg-black text-white border-0'
                            }
                          >
                            {site.complianceScore > 90 && site.serviceEfficiency > 90 
                              ? 'Excellent' 
                              : site.complianceScore > 80 && site.serviceEfficiency > 80
                              ? 'Good'
                              : 'Needs Attention'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This table provides a comprehensive view of performance metrics for each site, helping identify areas for improvement.
              </p>
            </div>
          )}
          
          {/* Predictive Maintenance Insights */}
          {analyticsView === 'predictive' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-6 text-black">Predictive Maintenance Insights</h3>
              <div className="rounded-md border overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Current Health</TableHead>
                      <TableHead>Predicted Failure</TableHead>
                      <TableHead>Recommended Action</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictiveMaintenanceData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.equipment}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item.currentHealth > 80 ? 'bg-green-500' : 
                                  item.currentHealth > 60 ? 'bg-orange-500' : 'bg-black'
                                }`}
                                style={{ width: `${item.currentHealth}%` }}
                              />
                            </div>
                            <span>{item.currentHealth}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.predictedFailure}</TableCell>
                        <TableCell>{item.recommendedAction}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              item.riskLevel === 'Low' 
                                ? 'bg-green-100 text-green-800 border-0' 
                                : item.riskLevel === 'Medium'
                                ? 'bg-orange-100 text-orange-800 border-0'
                                : 'bg-black text-white border-0'
                            }
                          >
                            {item.riskLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-black">Equipment Health Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'High Risk', value: predictiveMaintenanceData.filter(i => i.riskLevel === 'High').length },
                              { name: 'Medium Risk', value: predictiveMaintenanceData.filter(i => i.riskLevel === 'Medium').length },
                              { name: 'Low Risk', value: predictiveMaintenanceData.filter(i => i.riskLevel === 'Low').length },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            <Cell fill="#000000" />
                            <Cell fill="#FF8C00" />
                            <Cell fill="#22c55e" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-black">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {Array.from(new Set(predictiveMaintenanceData.map(i => i.recommendedAction))).map((action, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              action.includes('Immediate') ? 'bg-black' : 
                              action.includes('Schedule') ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`} />
                            <span>{action}</span>
                          </div>
                          <Badge variant="outline">
                            {predictiveMaintenanceData.filter(i => i.recommendedAction === action).length} items
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white p-3 border rounded-md shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: item.color }} 
          />
          <span>
            {item.name}: {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsTab;
