import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, CheckCircle, XCircle, Calendar, Clock, 
  Star, Building, ShieldCheck 
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BusinessDashboardOverview = () => {
  // Analytics data
  const complianceData = [
    { site: "Brisbane Office", status: "compliant", score: 98, lastAudit: "2023-09-15" },
    { site: "Sydney HQ", status: "warning", score: 82, lastAudit: "2023-08-22" },
    { site: "Melbourne Branch", status: "non-compliant", score: 65, lastAudit: "2023-07-30" },
    { site: "Perth Office", status: "compliant", score: 95, lastAudit: "2023-09-10" },
  ];

  const certificationExpiry = [
    { name: "Electrical License", contractor: "ABC Electric", expires: "2023-11-12", status: "expiring-soon" },
    { name: "Plumbing Certification", contractor: "XYZ Plumbing", expires: "2023-12-05", status: "valid" },
    { name: "HVAC Maintenance", contractor: "Cool Air Co", expires: "2024-01-20", status: "valid" },
    { name: "Fire Safety Cert", contractor: "FireGuard Ltd", expires: "2023-10-30", status: "critical" },
  ];

  const contractorPerformance = [
    { name: "ABC Electric", reliability: 4.8, onTimeCompletion: 95, qualityScore: 4.7, certStatus: "valid" },
    { name: "XYZ Plumbing", reliability: 4.2, onTimeCompletion: 88, qualityScore: 4.5, certStatus: "expiring" },
    { name: "Cool Air Co", reliability: 4.9, onTimeCompletion: 98, qualityScore: 4.8, certStatus: "valid" },
    { name: "FireGuard Ltd", reliability: 3.7, onTimeCompletion: 75, qualityScore: 3.9, certStatus: "expired" },
  ];

  const siteComplianceData = [
    { name: 'Brisbane', value: 85 },
    { name: 'Sydney', value: 75 },
    { name: 'Melbourne', value: 62 },
    { name: 'Perth', value: 90 },
  ];

  const monthlyComplianceData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 70 },
    { name: 'Mar', value: 75 },
    { name: 'Apr', value: 72 },
    { name: 'May', value: 78 },
    { name: 'Jun', value: 82 },
    { name: 'Jul', value: 85 },
    { name: 'Aug', value: 88 },
    { name: 'Sep', value: 86 },
  ];

  const COLORS = ['#7851CA', '#8BBEB2', '#9b87f5', '#E09F7D'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getExpiryStatusClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compliance Status Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <ShieldCheck className="mr-2 h-5 w-5 text-pretance-purple" />
              Compliance Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceData.map((site, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{site.site}</div>
                    <div className={`px-2 py-1 rounded-full flex items-center space-x-1 text-xs ${getStatusColor(site.status)}`}>
                      {getStatusIcon(site.status)}
                      <span className="capitalize">{site.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={site.score} 
                      className="h-2" 
                    />
                    <span className="text-sm font-medium">{site.score}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last audit: {new Date(site.lastAudit).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Certification Expiry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Calendar className="mr-2 h-5 w-5 text-pretance-purple" />
              Certification Expiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificationExpiry.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500">{cert.contractor}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getExpiryStatusClass(cert.status)}>
                      {new Date(cert.expires).toLocaleDateString()}
                    </Badge>
                    <span className="text-xs mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {Math.ceil((new Date(cert.expires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contractor Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Star className="mr-2 h-5 w-5 text-pretance-purple" />
              Contractor Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Contractor</th>
                    <th className="text-left py-2 px-2">Reliability</th>
                    <th className="text-left py-2 px-2">On-Time</th>
                    <th className="text-left py-2 px-2">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorPerformance.map((contractor, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{contractor.name}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          {renderStars(contractor.reliability)}
                          <span className="ml-2 text-xs">{contractor.reliability}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span>{contractor.onTimeCompletion}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          {renderStars(contractor.qualityScore)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Site Compliance Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Building className="mr-2 h-5 w-5 text-pretance-purple" />
              Site Compliance Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ChartContainer
                config={{
                  health: { color: "#7851CA" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={siteComplianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {siteComplianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartLegend
                payload={siteComplianceData.map((item, index) => ({
                  value: `${item.name}: ${item.value}%`,
                  color: COLORS[index % COLORS.length],
                }))}
              >
                <ChartLegendContent />
              </ChartLegend>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <ShieldCheck className="mr-2 h-5 w-5 text-pretance-purple" />
            Compliance Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                compliance: { color: "#7851CA" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComplianceData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Bar
                    dataKey="value"
                    name="compliance"
                    fill="var(--color-compliance, #7851CA)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessDashboardOverview;
