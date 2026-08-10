import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboardRoute } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building,
  Users,
  Factory,
  Clock,
  Briefcase,
  Activity,
  IndianRupee,
  TrendingUp,
  FileText,
  Boxes,
  Truck,
  FileCheck,
  Wrench,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PieChart,
  Shield,
  Layers,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const dashboardRoute = getRoleDashboardRoute(user?.role);
  const tenantPlan = user?.tenant?.subscriptionPlan || 'Basic';
  const isBasicTier = tenantPlan === 'Basic';

  // Category Collapse States (default open)
  const [openCategories, setOpenCategories] = useState({
    crm: true,
    finance: true,
    manufacturing: true,
    hrms: true,
  });

  const toggleCategory = (catKey) => {
    setOpenCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Menu items definition with explicit role/department authorization
  const crmItems = [
    { name: 'CRM Sales Portal', path: '/crm', icon: Briefcase, roles: ['', 'Company Admin', 'General Manager', 'Sales Manager', 'Sales Executive', 'Sales Employee', 'CRM Employee', 'Manager', 'Production Manager', 'Finance Manager', 'Finance', 'Warehouse Manager', 'Purchase Manager', 'Purchase Employee'] },
    { name: 'Inventory Master', path: '/manufacturing/inventory', icon: Boxes, roles: ['', 'Company Admin', 'General Manager', 'Sales Manager', 'Sales Executive', 'Sales Employee', 'CRM Employee', 'Manager'] },
    { name: 'AI Sales Prediction', path: '/ai-prediction', icon: Sparkles, roles: [ '','Company Admin', 'General Manager', 'Sales Manager', 'Sales Executive', 'Sales Employee', 'CRM Employee'] },
    { name: 'Real-Time Analytics', path: '/analytics', icon: Activity, roles: [ '','Company Admin', 'General Manager', 'Sales Manager', 'Sales Executive', 'Sales Employee', 'CRM Employee', 'Finance Manager', 'Finance', 'Manager'] },
  ];

  const financeItems = [
    { name: 'GST Billing & Invoices', path: '/billing', icon: FileText, roles: [ '','Company Admin', 'Finance', 'Finance Manager', 'Finance Employee'] },
    { name: 'Payroll Console', path: '/payroll', icon: IndianRupee, roles: ['', 'Company Admin', 'HR', 'Finance', 'Finance Manager'] },
    { name: 'My Monthly Payslips', path: '/payroll/payslips', icon: FileText, roles: ['', 'Company Admin', 'HR', 'Manager', 'Team Leader', 'Inventory Manager', 'Warehouse Manager', 'Purchase Manager', 'Production Manager', 'Maintenance Manager', 'Sales Manager', 'Finance Manager', 'Employee', 'Inventory Employee', 'Warehouse Employee', 'Purchase Employee', 'Production Employee', 'Maintenance Employee', 'CRM Employee', 'Finance Employee', 'Sales Executive'] },
    { name: 'Subscription & Plans', path: '/subscription', icon: Sparkles, roles: ['Super Admin', 'Company Admin'] },
  ];

  const manufacturingItems = [
    { name: 'Vendor Directory', path: '/manufacturing/vendors', icon: Truck, roles: [' ', 'Company Admin', 'Purchase Manager', 'Purchase Employee', 'Inventory Manager', 'Inventory Employee', 'Warehouse Manager', 'Warehouse Employee'] },
    { name: 'Inventory Master', path: '/manufacturing/inventory', icon: Boxes, roles: ['', 'Company Admin', 'Inventory Manager', 'Inventory Employee', 'Warehouse Manager', 'Warehouse Employee', 'Purchase Manager', 'Purchase Employee', 'Production Manager', 'Production Employee', 'Maintenance Manager', 'Maintenance Employee', 'Sales Manager', 'Sales Executive', 'Sales Employee', 'CRM Employee', 'Manager'] },
    { name: 'QR Inventory Scanner', path: '/qr-scanner', icon: Boxes, roles: ['', '', 'Inventory Manager', 'Inventory Employee', 'Warehouse Manager', 'Warehouse Employee', 'Purchase Manager', 'Production Manager', 'Maintenance Manager', 'Manager'] },
    { name: 'Warehouses', path: '/manufacturing/warehouses', icon: Building, roles: ['', 'Company Admin', 'Warehouse Manager', 'Warehouse Employee', 'Inventory Manager', 'Inventory Employee', 'Manager'] },
    { name: 'Purchase Workflow', path: '/manufacturing/purchase', icon: FileCheck, roles: ['', 'Company Admin', 'Purchase Manager', 'Purchase Employee', 'Inventory Manager', 'Manager'] },
    { name: 'Production Planning', path: '/manufacturing/production', icon: Factory, roles: ['', 'Company Admin', 'Production Manager', 'Production Employee', 'Manager', 'Team Leader'] },
    { name: 'Machine Maintenance', path: '/manufacturing/maintenance', icon: Wrench, roles: ['', 'Company Admin', 'Maintenance Manager', 'Maintenance Employee', 'Production Manager', 'Manager'] },
  ];

  const hrmsItems = [
    { name: 'HRMS Portal Hub', path: '/hrms', icon: Activity, roles: ['', 'Company Admin', 'HR', 'Manager', 'Team Leader', 'Inventory Manager', 'Warehouse Manager', 'Purchase Manager', 'Production Manager', 'Maintenance Manager', 'Sales Manager', 'Finance Manager', 'Employee', 'Inventory Employee', 'Warehouse Employee', 'Purchase Employee', 'Production Employee', 'Maintenance Employee', 'CRM Employee', 'Finance Employee'] },
    { name: 'User & Role Management', path: '/employees', icon: Users, roles: ['', 'Company Admin', 'HR'] },
  ];

  const isItemVisible = (item) => {
    if (!user) return false;
    const role = (user.role || '').trim();
    const dept = (user.department || '').toLowerCase().trim();

    // 1. Subscription Tier Filtering for Non-Super Admin:
    // Basic Tier (₹49,990/yr) enables: HRMS, Inventory, GST Billing, Payslips, Dashboard
    // All other department modules (CRM, Production, Maintenance, Purchase) are HIDDEN completely!
    if (isBasicTier && role !== 'Super Admin') {
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
      if (!basicAllowedPaths.some((p) => item.path.startsWith(p))) {
        return false; // HIDE completely from sidebar!
      }
    }

    // Universal ESS items are visible to ALL logged-in employees
    if (item.path === '/payroll/payslips' || item.path === '/hrms') return true;

    // Super Admin & Company Admin have full platform access (subject to subscription tier filter above)
    //if (role === 'Super Admin' || role === 'Company Admin') return true;

    // Check explicit roles list
    if (item.roles && item.roles.includes(role)) return true;

    // Department keyword matching fallback
    if (dept) {
      if ((dept.includes('inventory') || dept.includes('supply chain')) && (item.path.includes('inventory') || item.path.includes('qr-scanner') || item.path.includes('vendors') || item.path.includes('warehouses'))) return true;
      if ((dept.includes('warehouse') || dept.includes('logistics')) && (item.path.includes('warehouses') || item.path.includes('inventory') || item.path.includes('qr-scanner'))) return true;
      if ((dept.includes('purchase') || dept.includes('procurement')) && (item.path.includes('purchase') || item.path.includes('vendors') || item.path.includes('inventory'))) return true;
      if ((dept.includes('production') || dept.includes('assembly') || dept.includes('fabrication')) && (item.path.includes('production') || item.path.includes('maintenance') || item.path.includes('inventory'))) return true;
      if (dept.includes('maintenance') && (item.path.includes('maintenance') || item.path.includes('inventory'))) return true;
      if ((dept.includes('sales') || dept.includes('crm')) && (item.path.includes('crm') || item.path.includes('ai-prediction') || item.path.includes('analytics') || item.path.includes('inventory'))) return true;
      if ((dept.includes('finance') || dept.includes('accounts')) && (item.path.includes('billing') || item.path.includes('payroll'))) return true;
      if ((dept.includes('hr') || dept.includes('human')) && (item.path.includes('hrms') || item.path.includes('employees'))) return true;
    }

    return false;
  };

  const visibleCrm = crmItems.filter(isItemVisible);
  const visibleFinance = financeItems.filter(isItemVisible);
  const visibleManufacturing = manufacturingItems.filter(isItemVisible);
  const visibleHrms = hrmsItems.filter(isItemVisible);

  // Helper to render section
  const renderGroup = (title, categoryKey, items, icon) => {
    if (!items || items.length === 0) return null;
    const GroupIcon = icon;
    const isOpen = openCategories[categoryKey];
    const hasActiveChild = items.some((item) => location.pathname.startsWith(item.path));

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-all rounded-xl cursor-pointer ${
            hasActiveChild ? 'text-blue-400 bg-slate-800/40' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <GroupIcon className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {isOpen && (
          <div className="pl-3 space-y-1 border-l-2 border-slate-800/80 ml-2">
            {items.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Logged in User & Active Tier Card */}
        <div className="px-3.5 py-2.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Account &amp; Tier</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${isBasicTier ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {tenantPlan} Tier
            </span>
          </div>
          <p className="text-xs font-bold text-blue-400 truncate">{user?.role}</p>
          <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
        </div>

        {/* Dashboard Link */}
        <NavLink
          to={dashboardRoute}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Plant &amp; Role Dashboard</span>
        </NavLink>

        {/* Category Sections */}
        <nav className="space-y-4">
          {renderGroup('Sales & CRM Hub', 'crm', visibleCrm, Briefcase)}
          {renderGroup('Manufacturing & Ops', 'manufacturing', visibleManufacturing, Factory)}
          {renderGroup('HRMS & Administration', 'hrms', visibleHrms, Activity)}
          {renderGroup('Finance & Invoicing', 'finance', visibleFinance, IndianRupee)}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center">
        Enterprise Manufacturing SaaS ERP v4.2
      </div>
    </aside>
  );
};

export default Sidebar;
