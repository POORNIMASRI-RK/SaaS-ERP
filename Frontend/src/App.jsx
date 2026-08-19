import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getRoleDashboardRoute } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleLockGuard from './components/ModuleLockGuard';

const PlanProtectedWrapper = ({ children, moduleName, requiredPlan = 'Professional Tier', path }) => {
  const { user } = useAuth();
  if (user?.role === 'Super Admin') return children;

  const tenantPlan = user?.tenant?.subscriptionPlan || 'Basic';
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

// Immediate Auth Imports (Fast Initial Paint)
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';

// Lazy-Loaded ERP Module Routes (Code Splitting)
const EmployeeManagement = React.lazy(() => import('./pages/EmployeeManagement'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

const HrmsDashboard = React.lazy(() => import('./pages/hrms/HrmsDashboard'));
const LeaveManagement = React.lazy(() => import('./pages/hrms/LeaveManagement'));
const AttendanceManagement = React.lazy(() => import('./pages/hrms/AttendanceManagement'));
const ShiftManagement = React.lazy(() => import('./pages/hrms/ShiftManagement'));
const CompOffManagement = React.lazy(() => import('./pages/hrms/CompOffManagement'));

const PayrollDashboard = React.lazy(() => import('./pages/payroll/PayrollDashboard'));
const PayrollProcessing = React.lazy(() => import('./pages/payroll/PayrollProcessing'));
const SalaryStructures = React.lazy(() => import('./pages/payroll/SalaryStructures'));
const LoansAndReimbursements = React.lazy(() => import('./pages/payroll/LoansAndReimbursements'));
const PayslipViewer = React.lazy(() => import('./pages/payroll/PayslipViewer'));
const PayrollReports = React.lazy(() => import('./pages/payroll/PayrollReports'));

const InventoryManagement = React.lazy(() => import('./pages/manufacturing/InventoryManagement'));
const WarehouseManagement = React.lazy(() => import('./pages/manufacturing/WarehouseManagement'));
const VendorManagement = React.lazy(() => import('./pages/manufacturing/VendorManagement'));
const PurchaseWorkflow = React.lazy(() => import('./pages/manufacturing/PurchaseWorkflow'));
const ProductionPlanning = React.lazy(() => import('./pages/manufacturing/ProductionPlanning'));
const MachineMaintenance = React.lazy(() => import('./pages/manufacturing/MachineMaintenance'));
const GSTBillingHub = React.lazy(() => import('./pages/billing/GSTBillingHub'));
const CRMHub = React.lazy(() => import('./pages/crm/CRMHub'));
const AIPredictionHub = React.lazy(() => import('./pages/ai/AIPredictionHub'));
const SubscriptionBillingHub = React.lazy(() => import('./pages/billing/SubscriptionBillingHub'));
const QRInventoryScannerHub = React.lazy(() => import('./pages/manufacturing/QRInventoryScannerHub'));
const RealTimeAnalyticsHub = React.lazy(() => import('./pages/analytics/RealTimeAnalyticsHub'));

const SuperAdminDashboard = React.lazy(() => import('./pages/dashboards/SuperAdminDashboard'));
const CompanyAdminDashboard = React.lazy(() => import('./pages/dashboards/CompanyAdminDashboard'));
const HRDashboard = React.lazy(() => import('./pages/dashboards/HRDashboard'));
const ManagerDashboard = React.lazy(() => import('./pages/dashboards/ManagerDashboard'));
const ProductionManagerDashboard = React.lazy(() => import('./pages/dashboards/ProductionManagerDashboard'));
const TeamLeaderDashboard = React.lazy(() => import('./pages/dashboards/TeamLeaderDashboard'));
const EmployeeDashboard = React.lazy(() => import('./pages/dashboards/EmployeeDashboard'));

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

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-blue-400">
    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    <span className="mt-3 text-xs font-mono text-slate-400">Loading Module...</span>
  </div>
);

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardRoute(user.role)} replace />;
};

function App() {
  return (
    <React.Suspense fallback={<PageLoadingFallback />}>
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
              <PlanProtectedWrapper moduleName="Purchase Workflow" requiredPlan="Professional Tier" path="/manufacturing/purchase">
                <DashboardLayout>
                  <PurchaseWorkflow />
                </DashboardLayout>
              </PlanProtectedWrapper>
            }
          />
          <Route
            path="/manufacturing/production"
            element={
              <PlanProtectedWrapper moduleName="Production Planning" requiredPlan="Professional Tier" path="/manufacturing/production">
                <DashboardLayout>
                  <ProductionPlanning />
                </DashboardLayout>
              </PlanProtectedWrapper>
            }
          />
          <Route
            path="/manufacturing/maintenance"
            element={
              <PlanProtectedWrapper moduleName="Machine Maintenance" requiredPlan="Enterprise Tier" path="/manufacturing/maintenance">
                <DashboardLayout>
                  <MachineMaintenance />
                </DashboardLayout>
              </PlanProtectedWrapper>
            }
          />
        </Route>

        {/* CRM Module Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'Super Admin',
                'Company Admin',
                'General Manager',
                'Sales Manager',
                'Sales Executive',
                'Sales Employee',
                'CRM Employee',
                'Manager',
                'Production Manager',
                'Finance Manager',
                'Finance',
                'Warehouse Manager',
                'Purchase Manager',
                'Purchase Employee',
              ]}
            />
          }
        >
          <Route
            path="/crm"
            element={
              <PlanProtectedWrapper moduleName="CRM Sales Portal" requiredPlan="Professional Tier" path="/crm">
                <DashboardLayout>
                  <CRMHub />
                </DashboardLayout>
              </PlanProtectedWrapper>
            }
          />
        </Route>

        {/* AI Sales Prediction Module Route */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'Super Admin',
                'Company Admin',
                'General Manager',
                'Sales Manager',
                'Sales Executive',
                'Sales Employee',
                'CRM Employee',
              ]}
            />
          }
        >
          <Route
            path="/ai-prediction"
            element={
              <PlanProtectedWrapper moduleName="AI Sales Prediction" requiredPlan="Enterprise Tier" path="/ai-prediction">
                <DashboardLayout>
                  <AIPredictionHub />
                </DashboardLayout>
              </PlanProtectedWrapper>
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
                'Purchase Manager',
                'Production Manager',
                'Maintenance Manager',
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

        {/* Real-Time Analytics Module */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'Super Admin',
                'Company Admin',
                'General Manager',
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
    </React.Suspense>
  );
}

export default App;
