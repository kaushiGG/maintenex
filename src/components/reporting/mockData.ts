// Mock data for different report sections
export const prebuiltTemplates = [
  { id: 1, name: "Monthly Compliance Summary", category: "Compliance", lastRun: "2023-10-15" },
  { id: 2, name: "Contractor Performance Analysis", category: "Performance", lastRun: "2023-10-10" },
  { id: 3, name: "Service Completion Report", category: "Services", lastRun: "2023-10-05" },
  { id: 4, name: "Site Safety Audit", category: "Compliance", lastRun: "2023-09-28" },
  { id: 5, name: "Equipment Maintenance Status", category: "Maintenance", lastRun: "2023-09-22" },
];
  
export const scheduledReports = [
  { id: 1, name: "Weekly Compliance Status", frequency: "Weekly", nextRun: "2023-10-22", recipients: 5 },
  { id: 2, name: "Monthly Executive Summary", frequency: "Monthly", nextRun: "2023-11-01", recipients: 3 },
  { id: 3, name: "Quarterly Contractor Review", frequency: "Quarterly", nextRun: "2023-12-31", recipients: 4 },
];
  
export const completionReports = [
  { id: "1", name: "RCD Testing - Brisbane Office", date: "2023-10-12", contractor: "ABC Electric", status: "complete" },
  { id: "2", name: "Emergency Lighting - Sydney HQ", date: "2023-10-08", contractor: "SafeLight Co", status: "pending" },
  { id: "3", name: "Air Conditioning Service - Melbourne", date: "2023-10-05", contractor: "Cool Air Inc", status: "complete" },
  { id: "4", name: "Test & Tag - Perth Office", date: "2023-09-30", contractor: "SafetyFirst", status: "complete" },
];
  
export const recentExports = [
  { id: 1, name: "Compliance Summary", format: "PDF", date: "2023-10-14" },
  { id: 2, name: "Contractor Hours", format: "Excel", date: "2023-10-10" },
  { id: 3, name: "Service Costs Q3", format: "CSV", date: "2023-10-05" },
];

// Analytics mock data
export const serviceCompletionTrends = [
  { month: "Jan", completed: 42, pending: 8 },
  { month: "Feb", completed: 38, pending: 12 },
  { month: "Mar", completed: 45, pending: 5 },
  { month: "Apr", completed: 40, pending: 10 },
  { month: "May", completed: 35, pending: 15 },
  { month: "Jun", completed: 48, pending: 7 },
  { month: "Jul", completed: 52, pending: 3 },
  { month: "Aug", completed: 49, pending: 6 },
  { month: "Sep", completed: 50, pending: 5 },
  { month: "Oct", completed: 47, pending: 8 },
  { month: "Nov", completed: 55, pending: 5 },
  { month: "Dec", completed: 60, pending: 5 },
];

export const costAnalysisByType = [
  { name: "HVAC", value: 35000 },
  { name: "Electrical", value: 28000 },
  { name: "Plumbing", value: 22000 },
  { name: "Fire Safety", value: 18000 },
  { name: "Security", value: 15000 },
  { name: "Cleaning", value: 12000 },
];

export const contractorPerformanceData = [
  { 
    name: "ABC Electric", 
    reliability: 92, 
    responseTime: 88, 
    qualityScore: 95,
    costEfficiency: 87
  },
  { 
    name: "SafeLight Co", 
    reliability: 85, 
    responseTime: 90, 
    qualityScore: 88,
    costEfficiency: 92
  },
  { 
    name: "Cool Air Inc", 
    reliability: 95, 
    responseTime: 87, 
    qualityScore: 90,
    costEfficiency: 85
  },
  { 
    name: "SafetyFirst", 
    reliability: 89, 
    responseTime: 92, 
    qualityScore: 93,
    costEfficiency: 88
  },
  { 
    name: "PlumbPro", 
    reliability: 91, 
    responseTime: 84, 
    qualityScore: 89,
    costEfficiency: 94
  },
];

export const complianceGapData = [
  { site: "Brisbane Office", compliant: 87, nonCompliant: 13 },
  { site: "Sydney HQ", compliant: 92, nonCompliant: 8 },
  { site: "Melbourne Branch", compliant: 78, nonCompliant: 22 },
  { site: "Perth Office", compliant: 95, nonCompliant: 5 },
  { site: "Adelaide Store", compliant: 82, nonCompliant: 18 },
];

export const sitePerformanceMetrics = [
  { 
    name: "Brisbane Office", 
    serviceEfficiency: 88, 
    complianceScore: 87, 
    maintenanceCost: 25000,
    incidentRate: 2.3 
  },
  { 
    name: "Sydney HQ", 
    serviceEfficiency: 92, 
    complianceScore: 92, 
    maintenanceCost: 35000,
    incidentRate: 1.5 
  },
  { 
    name: "Melbourne Branch", 
    serviceEfficiency: 81, 
    complianceScore: 78, 
    maintenanceCost: 22000,
    incidentRate: 3.1 
  },
  { 
    name: "Perth Office", 
    serviceEfficiency: 95, 
    complianceScore: 95, 
    maintenanceCost: 18000,
    incidentRate: 0.8 
  },
  { 
    name: "Adelaide Store", 
    serviceEfficiency: 85, 
    complianceScore: 82, 
    maintenanceCost: 15000,
    incidentRate: 2.5 
  },
];

export const predictiveMaintenanceData = [
  { 
    equipment: "HVAC System - Brisbane", 
    currentHealth: 75, 
    predictedFailure: "2024-02-15", 
    recommendedAction: "Schedule maintenance",
    riskLevel: "Medium" 
  },
  { 
    equipment: "Electrical Panel - Sydney", 
    currentHealth: 60, 
    predictedFailure: "2023-12-10", 
    recommendedAction: "Immediate inspection",
    riskLevel: "High" 
  },
  { 
    equipment: "Water Heater - Melbourne", 
    currentHealth: 85, 
    predictedFailure: "2024-06-20", 
    recommendedAction: "Routine check in Q1",
    riskLevel: "Low" 
  },
  { 
    equipment: "Fire Alarm System - Perth", 
    currentHealth: 90, 
    predictedFailure: "2024-08-30", 
    recommendedAction: "No action needed",
    riskLevel: "Low" 
  },
  { 
    equipment: "Elevator - Sydney", 
    currentHealth: 65, 
    predictedFailure: "2024-01-15", 
    recommendedAction: "Schedule inspection",
    riskLevel: "Medium" 
  },
];
