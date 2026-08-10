import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getRoleDashboardRoute } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleLockGuard from './components/ModuleLockGuard';

const PlanProtectedWrapper = ({ children, moduleName, requiredPlan = 'Professional Tier', path }) => {
  const { user } = useAuth();
  if (user?.role === 'Super Admin') return children; // Super Admin has global access to all modules across all tenant companies

  const tenantPlan = user?.tenant?.subscriptionPlan || 'Basic';

  // Basic tier includes: HRMS, Inventory, GST Billing, Payslips, Dashboard
  const isBasic = tenantPlan === 'Basic';
  const basicAllowedPaths = [
    '/dashboard',
    '/hrms',
    '/employees',
    '/manufacturing/inventory',
    '/qr-scanner',
    '/billing',
    '/payroll/payslips',
    '/subscription',
  ];

  const isLocked = isBasic && !basicAllowedPaths.some((p) => path.startsWith(p));

  if (isLocked) {
    return <ModuleLockGuard moduleName={moduleName} requiredPlan={requiredPlan} />;
  }

  return children;
};

import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';
import EmployeeManagement from './pages/EmployeeManagement';
import Notifications from './pages/Notifications';

import HrmsDashboard from './pages/hrms/HrmsDashboard';
import LeaveManagement from './pages/hrms/LeaveManagement';
import AttendanceManagement from './pages/hrms/AttendanceManagement';
import ShiftManagement from './pages/hrms/ShiftManagement';
import CompOffManagement from './pages/hrms/CompOffManagement';

import PayrollDashboard from './pages/payroll/PayrollDashboard';
import PayrollProcessing from './pages/payroll/PayrollProcessing';
import SalaryStructures from './pages/payroll/SalaryStructures';
import LoansAndReimbursements from './pages/payroll/LoansAndReimbursements';
import PayslipViewer from './pages/payroll/PayslipViewer';
import PayrollReports from './pages/payroll/PayrollReports';

import InventoryManagement from './pages/manufacturing/InventoryManagement';
import WarehouseManagement from './pages/manufacturing/WarehouseManagement';
import VendorManagement from './pages/manufacturing/VendorManagement';
import PurchaseWorkflow from './pages/manufacturing/PurchaseWorkflow';
import ProductionPlanning from './pages/manufacturing/ProductionPlanning';
import MachineMaintenance from './pages/manufacturing/MachineMaintenance';
import GSTBillingHub from './pages/billing/GSTBillingHub';
import CRMHub from './pages/crm/CRMHub';
import AIPredictionHub from './pages/ai/AIPredictionHub';
import SubscriptionBillingHub from './pages/billing/SubscriptionBillingHub';
import QRInventoryScannerHub from './pages/manufacturing/QRInventoryScannerHub';
import RealTimeAnalyticsHub from './pages/analytics/RealTimeAnalyticsHub';

import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import CompanyAdminDashboard from './pages/dashboards/CompanyAdminDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import ProductionManagerDashboard from './pages/dashboards/ProductionManagerDashboard';
import TeamLeaderDashboard from './pages/dashboards/TeamLeaderDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardRoute(user.role)} replace />;
};

function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Protected Core & HRMS Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/notifications"
          element={
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          }
        />
        <Route
          path="/hrms"
          element={
            <DashboardLayout>
              <HrmsDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/hrms/leaves"
          element={
            <DashboardLayout>
              <LeaveManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/hrms/attendance"
          element={
            <DashboardLayout>
              <AttendanceManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/hrms/shifts"
          element={
            <DashboardLayout>
              <ShiftManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/hrms/compoff"
          element={
            <DashboardLayout>
              <CompOffManagement />
            </DashboardLayout>
          }
        />

        {/* Manufacturing Module Routes */}
        <Route
          path="/manufacturing/inventory"
          element={
            <DashboardLayout>
              <InventoryManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/manufacturing/warehouses"
          element={
            <DashboardLayout>
              <WarehouseManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/manufacturing/vendors"
          element={
            <DashboardLayout>
              <VendorManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/manufacturing/purchase"
          element={
            <DashboardLayout>
              <PurchaseWorkflow />
            </DashboardLayout>
          }
        />
        <Route
          path="/manufacturing/production"
          element={
            <DashboardLayout>
              <ProductionPlanning />
            </DashboardLayout>
          }
        />
        <Route
          path="/manufacturing/maintenance"
          element={
            <DashboardLayout>
              <MachineMaintenance />
            </DashboardLayout>
          }
        />

      </Route>

      {/* Multi-Tenant CRM Sales Module */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Super Admin',
              'Company Admin',
              'General Manager',
              'Manager',
              'Sales Manager',
              'Sales Executive',
              'Sales Employee',
              'CRM Employee',
              'Production Manager',
              'Production Employee',
              'Finance Manager',
              'Finance',
              'Finance Employee',
              'Warehouse Manager',
              'Warehouse Employee',
              'Purchase Manager',
              'Purchase Employee',
            ]}
          />
        }
      >
        <Route
          path="/crm"
          element={
            <DashboardLayout>
              <PlanProtectedWrapper moduleName="CRM Sales Portal" requiredPlan="Professional Tier" path="/crm">
                <CRMHub />
              </PlanProtectedWrapper>
            </DashboardLayout>
          }
        />
      </Route>

      {/* AI Sales & Demand Prediction Engine */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Super Admin',
              'Company Admin',
              'General Manager',
              'Manager',
              'Assistant Manager',
              'Sales Manager',
              'Sales Executive',
              'Sales Employee',
              'CRM Employee',
              'Production Manager',
              'Purchase Manager',
              'Inventory Manager',
              'Finance',
            ]}
          />
        }
      >
        <Route
          path="/ai-prediction"
          element={
            <DashboardLayout>
              <AIPredictionHub />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Subscription Billing Engine */}
      <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Finance']} />}>
        <Route
          path="/subscription"
          element={
            <DashboardLayout>
              <SubscriptionBillingHub />
            </DashboardLayout>
          }
        />
      </Route>

      {/* QR Inventory Tracker */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Super Admin',
              'Company Admin',
              'Inventory Manager',
              'Warehouse Manager',
              'Production Manager',
              'Purchase Manager',
              'Manager',
            ]}
          />
        }
      >
        <Route
          path="/qr-scanner"
          element={
            <DashboardLayout>
              <QRInventoryScannerHub />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Real-Time Business Analytics */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Super Admin',
              'Company Admin',
              'General Manager',
              'Manager',
              'Sales Manager',
              'Sales Executive',
              'Sales Employee',
              'CRM Employee',
              'Production Manager',
              'Purchase Manager',
              'Inventory Manager',
              'Warehouse Manager',
              'Finance',
              'HR',
            ]}
          />
        }
      >
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <RealTimeAnalyticsHub />
            </DashboardLayout>
          }
        />
      </Route>

      {/* GST Billing & Invoicing Module */}
      <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Finance']} />}>
        <Route
          path="/billing"
          element={
            <DashboardLayout>
              <GSTBillingHub />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Company-Wide Payroll Management */}
      <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'HR', 'Finance']} />}>
        <Route
          path="/payroll"
          element={
            <DashboardLayout>
              <PayrollDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/payroll/processing"
          element={
            <DashboardLayout>
              <PayrollProcessing />
            </DashboardLayout>
          }
        />
        <Route
          path="/payroll/structures"
          element={
            <DashboardLayout>
              <SalaryStructures />
            </DashboardLayout>
          }
        />
        <Route
          path="/payroll/reports"
          element={
            <DashboardLayout>
              <PayrollReports />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Personal Payslips & Loans */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/payroll/payslips"
          element={
            <DashboardLayout>
              <PayslipViewer />
            </DashboardLayout>
          }
        />
        <Route
          path="/payroll/loans"
          element={
            <DashboardLayout>
              <LoansAndReimbursements />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Protected User Management */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Super Admin',
              'Company Admin',
              'HR',
              'Manager',
              'Assistant Manager',
              'Production Manager',
              'Purchase Manager',
              'Inventory Manager',
              'Warehouse Manager',
              'Maintenance Manager',
              'Team Leader',
            ]}
          />
        }
      >
        <Route
          path="/employees"
          element={
            <DashboardLayout>
              <EmployeeManagement />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Protected Role Dashboards */}
      <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
        <Route
          path="/dashboard/super-admin"
          element={
            <DashboardLayout>
              <SuperAdminDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Company Admin']} />}>
        <Route
          path="/dashboard/company-admin"
          element={
            <DashboardLayout>
              <CompanyAdminDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
        <Route
          path="/dashboard/hr"
          element={
            <DashboardLayout>
              <HRDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Manager']} />}>
        <Route
          path="/dashboard/manager"
          element={
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Production Manager']} />}>
        <Route
          path="/dashboard/production-manager"
          element={
            <DashboardLayout>
              <ProductionManagerDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Team Leader']} />}>
        <Route
          path="/dashboard/team-leader"
          element={
            <DashboardLayout>
              <TeamLeaderDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              'Employee',
              'Inventory Employee',
              'Warehouse Employee',
              'Purchase Employee',
              'Production Employee',
              'Maintenance Employee',
              'CRM Employee',
              'Finance Employee',
            ]}
          />
        }
      >
        <Route
          path="/dashboard/employee"
          element={
            <DashboardLayout>
              <EmployeeDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
