import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Sites from './pages/Sites';
import SiteManagement from './pages/SiteManagement';
import SiteServices from './pages/SiteServices';
import SiteLocationPage from './components/sites/SiteLocationPage';
import Contractors from './pages/Contractors';
import ContractorsManagement from './components/contractors/ContractorsManagement';
import MaintenanceSystem from './pages/MaintenanceSystem';
import ClientManagement from './pages/ClientManagement';
import ClientDirectory from './pages/ClientDirectory';
import AssetManagement from './pages/AssetManagement';
import TestATagService from './components/services/test-a-tag/TestATagService';
import RCDTestingService from './components/services/rcd-testing/RCDTestingService';
import EmergencyExitLightingService from './components/services/emergency-exit/EmergencyExitLightingService';
import ThermalImagingService from './components/services/thermal-imaging/ThermalImagingService';
import PlumbingService from './components/services/plumbing/PlumbingService';
import PlumbingLandingPage from './components/services/plumbing/PlumbingLandingPage';
import AirConditioningService from './components/services/air-conditioning/AirConditioningService';
import AirConditioningLandingPage from './components/services/air-conditioning/AirConditioningLandingPage';
import SafetyChecksService from './components/services/safety-checks/SafetyChecksService';
import ServicesLandingPage from './components/services/ServicesLandingPage';
import EquipmentManagement from './pages/EquipmentManagement';
import JobsPages from './pages/Jobs';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import Invoices from './pages/Invoices';
import InvoicesAndPayments from './pages/InvoicesAndPayments';
import ReportingModule from './components/reporting/ReportingModule';
import Analytics from './pages/Analytics';
import ContractorDashboardPage from './pages/ContractorDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import EquipmentSafetyCheck from './components/employee/safety/EquipmentSafetyCheck';
import ContractorReportsPage from './pages/ContractorReportsPage';
import ThermalImagingReportsPage from './components/contractor/reporting/ThermalImagingReportsPage';
import ServiceAreas from './pages/ServiceAreas';
import ServiceDirectory from './pages/ServiceDirectory';
import ContractorManagement from './pages/ContractorManagement';
import PerformanceRatings from './pages/PerformanceRatings';
import CertificationTracking from './pages/CertificationTracking';
import InsuranceTracking from './pages/InsuranceTracking';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import UserApprovalPage from './pages/UserApprovalPage';
import AddEquipmentPage from './pages/equipment/AddEquipmentPage';
import CompletedJobReports from './pages/CompletedJobReports';
import ContractorCompletedJobReports from './pages/ContractorCompletedJobReports';
import ContractorCompletedJobs from './pages/ContractorCompletedJobs';
import SupabaseDebug from './pages/SupabaseDebug';
import ServiceFormAccess from './components/contractor/dashboard/ServiceFormAccess';
import SiteLocations from './pages/SiteLocations';
import DbConnectionTest from './pages/DbConnectionTest';
import EmployeesPage from './pages/employees/EmployeesPage';
import SafetyOfficersPage from './pages/employees/SafetyOfficersPage';
import EmployeeInvitesPage from './pages/employees/EmployeeInvitesPage';
import RegisterEmployee from './pages/RegisterEmployee';
import NotificationPreferences from './pages/NotificationPreferences';
import MyJobsPage from './components/contractor/jobs/MyJobsPage';
import ProviderAssignedJobsPage from './components/client/jobs/ProviderAssignedJobsPage';
import JobsDebugPage from './pages/JobsDebugPage';
import BusinessJobDetailsPage from './components/client/jobs/BusinessJobDetailsPage';
import EnhancedFloorPlans from './pages/EnhancedFloorPlans';

// Business provider jobs page with logout
const BusinessProviderJobsPage = () => {
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };
  return <ProviderAssignedJobsPage userRole="business" userMode="provider" handleLogout={handleLogout} />;
};

// Business provider job details page with logout
const BusinessProviderJobDetailsPage = () => {
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Add debug log
  console.log('Rendering BusinessProviderJobDetailsPage component');
  
  return <BusinessJobDetailsPage userRole="business" userMode="provider" handleLogout={handleLogout} />;
};

function App() {
  console.log('App component loaded successfully!');
  
  // Add this to check Supabase config
  console.log('Supabase config check: ', {
    url: 'https://opgqrdltnngkhjymgmmy.supabase.co',
    anon_key_length: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'.length
  });
  
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-employee" element={<RegisterEmployee />} />
            <Route path="/debug-supabase" element={<SupabaseDebug />} />
            <Route path="/debug-database" element={<DbConnectionTest />} />
            <Route path="/debug/jobs" element={<ProtectedRoute><JobsDebugPage /></ProtectedRoute>} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/contractor-dashboard" element={<ProtectedRoute><ContractorDashboardPage /></ProtectedRoute>} />
            <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboardPage /></ProtectedRoute>} />
            <Route path="/employee/safety-checks/:equipmentId" element={<ProtectedRoute><EquipmentSafetyCheck /></ProtectedRoute>} />
            <Route path="/sites" element={<ProtectedRoute><Sites /></ProtectedRoute>} />
            <Route path="/sites/management" element={<ProtectedRoute><SiteManagement /></ProtectedRoute>} />
            <Route path="/sites/locations" element={<ProtectedRoute><SiteLocations /></ProtectedRoute>} />
            <Route path="/site-locations" element={<ProtectedRoute><SiteLocations /></ProtectedRoute>} />
            <Route path="/sites/services" element={<ProtectedRoute><SiteServices /></ProtectedRoute>} />
            <Route path="/sites/:siteId" element={<ProtectedRoute><SiteLocationPage /></ProtectedRoute>} />
            <Route path="/sites/:siteId/:serviceType" element={<ProtectedRoute><SiteLocationPage /></ProtectedRoute>} />
            <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
            <Route path="/contractors/*" element={<ProtectedRoute><ContractorsManagement /></ProtectedRoute>} />
            <Route path="/contractor-management" element={<ProtectedRoute><ContractorManagement /></ProtectedRoute>} />
            <Route path="/performance-ratings" element={<ProtectedRoute><PerformanceRatings /></ProtectedRoute>} />
            <Route path="/license-tracking" element={<ProtectedRoute><CertificationTracking /></ProtectedRoute>} />
            <Route path="/insurance-tracking" element={<ProtectedRoute><InsuranceTracking /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><MaintenanceSystem /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />
            <Route path="/client-directory" element={<ProtectedRoute><ClientDirectory /></ProtectedRoute>} />
            <Route path="/settings/user-approval" element={<ProtectedRoute><UserApprovalPage /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationPreferences /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportingModule /></ProtectedRoute>} />
            <Route path="/reports/performance" element={<ProtectedRoute><ContractorReportsPage /></ProtectedRoute>} />
            <Route path="/reports/timesheet" element={<ProtectedRoute><ContractorReportsPage /></ProtectedRoute>} />
            <Route path="/reports/completed" element={<ProtectedRoute><ContractorReportsPage /></ProtectedRoute>} />
            <Route path="/reports/thermal-imaging" element={<ProtectedRoute><ThermalImagingReportsPage switchRole={() => {}} userRole="contractor" handleLogout={() => {}} /></ProtectedRoute>} />
            <Route path="/reports/completed-jobs" element={<ProtectedRoute><CompletedJobReports /></ProtectedRoute>} />
            <Route path="/contractor/reports/completed-jobs" element={<ProtectedRoute><ContractorCompletedJobReports /></ProtectedRoute>} />
            <Route path="/jobs/completed" element={<ProtectedRoute><ContractorCompletedJobs /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            {/* Business provider routes - keep these before the general jobs routes */}
            <Route path="/business/provider/jobs" element={<ProtectedRoute><BusinessProviderJobsPage /></ProtectedRoute>} />
            <Route path="/business/provider/jobs/:jobId" element={<ProtectedRoute><BusinessProviderJobDetailsPage /></ProtectedRoute>} />
            
            {/* General job routes */}
            <Route path="/jobs" element={<ProtectedRoute><JobsPages switchRole={() => {}} userRole="business" handleLogout={() => {}} /></ProtectedRoute>} />
            <Route path="/jobs/*" element={<ProtectedRoute><JobsPages switchRole={() => {}} userRole="contractor" handleLogout={() => {}} /></ProtectedRoute>} />
            
            <Route path="/schedule/*" element={<ProtectedRoute><Schedule switchRole={() => {}} userRole="contractor" handleLogout={() => {}} /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/financial/invoices" element={<ProtectedRoute><InvoicesAndPayments /></ProtectedRoute>} />
            <Route path="/assets" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/assets/dashboard" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
            <Route path="/equipment/dashboard" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
            <Route path="/equipment/management" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
            <Route path="/dashboard/equipment/add" element={<ProtectedRoute><AddEquipmentPage /></ProtectedRoute>} />
            <Route path="/contractor/equipment" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
            <Route path="/contractor/equipment/dashboard" element={<ProtectedRoute><EquipmentManagement /></ProtectedRoute>} />
            <Route path="/contractor/assets" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/contractor/assets/dashboard" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/services/plumbing" element={<ProtectedRoute><PlumbingService /></ProtectedRoute>} />
            <Route path="/services/landing/plumbing" element={<ProtectedRoute><PlumbingLandingPage /></ProtectedRoute>} />
            <Route path="/services/air-conditioning" element={<ProtectedRoute><AirConditioningService /></ProtectedRoute>} />
            <Route path="/services/landing/air-conditioning" element={<ProtectedRoute><AirConditioningLandingPage /></ProtectedRoute>} />
            <Route path="/services/landing/:serviceType" element={<ProtectedRoute><ServicesLandingPage /></ProtectedRoute>} />
            <Route path="/services/test-tag" element={<ProtectedRoute><TestATagService /></ProtectedRoute>} />
            <Route path="/services/rcd-testing" element={<ProtectedRoute><RCDTestingService /></ProtectedRoute>} />
            <Route path="/services/emergency-exit-lighting" element={<ProtectedRoute><EmergencyExitLightingService /></ProtectedRoute>} />
            <Route path="/services/thermal-imaging" element={<ProtectedRoute><ThermalImagingService /></ProtectedRoute>} />
            <Route path="/services/safety-checks" element={<ProtectedRoute><SafetyChecksService /></ProtectedRoute>} />
            <Route path="/services/directory" element={<ProtectedRoute><ServiceDirectory /></ProtectedRoute>} />
            <Route path="/service-form-access" element={<ProtectedRoute><ServiceFormAccess /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><ServiceAreas /></ProtectedRoute>} />
            <Route path="/sites/floor-plans" element={<ProtectedRoute><EnhancedFloorPlans /></ProtectedRoute>} />
            <Route path="/sites/enhanced-floor-plans" element={<ProtectedRoute><EnhancedFloorPlans /></ProtectedRoute>} />
            <Route path="/sites/maps/add-floor-plans" element={<ProtectedRoute><EnhancedFloorPlans /></ProtectedRoute>} />
            <Route path="/sites/maps/view-floor-plans" element={<ProtectedRoute><EnhancedFloorPlans /></ProtectedRoute>} />
            <Route path="/services/landing/safety-checks" element={<ProtectedRoute><ServicesLandingPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/employees/safety-officers" element={<ProtectedRoute><SafetyOfficersPage /></ProtectedRoute>} />
            <Route path="/employees/invitations" element={<ProtectedRoute><EmployeeInvitesPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
