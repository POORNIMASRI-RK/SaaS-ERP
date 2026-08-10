import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  IndianRupee,
  Building,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  Send,
  AlertTriangle,
  RefreshCw,
  X,
  TrendingUp,
  Boxes,
  PieChart,
  PhoneCall,
  Calendar,
  FileText,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Award,
  Layers,
  FileCheck,
  Zap,
  Mail,
  Phone,
  UserCheck,
  Package,
  Truck,
  Factory,
  Lock,
  Eye,
  ShoppingCart,
} from 'lucide-react';

const CRMHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = (user?.role || '').trim();
  const userDept = (user?.department || '').toLowerCase().trim();

  // Flexible & Robust Role Matching:
  const isSuperAdmin = userRole.toLowerCase().includes('super admin');
  const isCompanyAdmin = userRole.toLowerCase().includes('company admin') || userRole.toLowerCase() === 'admin';
  const isGeneralManager = userRole.toLowerCase().includes('general manager') || userRole.toLowerCase() === 'manager';
  const isSalesManager = userRole.toLowerCase().includes('sales manager') || userRole.toLowerCase().includes('sales lead');
  const isSalesExecutive = userRole.toLowerCase().includes('sales') || userRole.toLowerCase().includes('crm') || userDept.includes('sales') || userDept.includes('crm');

  const isProductionManager = userRole.toLowerCase().includes('production') || userDept.includes('production');
  const isFinanceManager = userRole.toLowerCase().includes('finance') || userDept.includes('finance') || userDept.includes('account');
  const isWarehouseManager = userRole.toLowerCase().includes('warehouse') || userDept.includes('warehouse') || userDept.includes('logistics');
  const isPurchaseManager = userRole.toLowerCase().includes('purchase') || userDept.includes('purchase') || userDept.includes('procurement');

  // Full CRM Viewers (Super Admin, Company Admin, General Manager, Sales Manager)
  const hasFullCrm = isSuperAdmin || isCompanyAdmin || isGeneralManager || isSalesManager;
  // Sales Team Access (Full CRM + Sales Executive)
  const isSalesStaff = hasFullCrm || isSalesExecutive;
  // Departmental Observers with Sales Order Action (Production, Finance, Warehouse, Purchase Managers)
  const isRestrictedDeptManager = (isProductionManager || isFinanceManager || isWarehouseManager || isPurchaseManager) && !isSalesStaff;

  // Total Authorized CRM Users
  const hasCrmAccess = isSalesStaff || isRestrictedDeptManager;

  // Active Tab State (Default to 'sales_orders' for restricted dept managers, 'dashboard' for sales)
  const [activeTab, setActiveTab] = useState(isRestrictedDeptManager ? 'sales_orders' : 'dashboard');

  // 10 Key Dashboard Metrics State
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    openOpportunities: 0,
    pendingQuotations: 0,
    activeSalesOrders: 0,
    monthlySalesRevenue: 0,
    ordersInProduction: 0,
    ordersReadyForDispatch: 0,
    pendingFollowUps: 0,
  });

  // Main Datasets
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [reports, setReports] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Printable Document Modals State
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  // Modals State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    source: 'Website',
    priority: 'Medium',
    industry: 'Automotive & Heavy Manufacturing',
    requirement: '',
    estimatedValue: 250000,
    state: 'Tamil Nadu',
    city: 'Chennai',
    notes: '',
  });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    billingAddress: { street: '', city: '', state: 'Tamil Nadu', zipCode: '' },
    industry: 'Automotive & Heavy Manufacturing',
    creditLimit: 500000,
  });

  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    opportunityName: '',
    dealValue: 500000,
    stage: 'Qualification',
    probabilityPercent: 60,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activities: '',
    notes: '',
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerId: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    termsAndConditions: '1. Price valid for 30 days. 2. Delivery within estimated timeframe from PO signoff. 3. 18% GST applicable.',
    items: [{ itemId: '', qty: 1, unitPrice: 0, discountPercent: 0 }],
  });

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followForm, setFollowForm] = useState({
    title: '',
    type: 'Call',
    customerId: '',
    leadId: '',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    priority: 'Medium',
    notes: '',
  });

  useEffect(() => {
    if (hasCrmAccess) {
      fetchCRMData();
    }
  }, [statusFilter, stageFilter, userRole]);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      if (isSalesStaff) {
        const metRes = await API.get('/crm/metrics');
        if (metRes.data.success) setMetrics(metRes.data.metrics);

        const custRes = await API.get('/crm/customers');
        if (custRes.data.success) {
          setCustomers(custRes.data.customers);
          if (custRes.data.customers.length > 0 && !quoteForm.customerId) {
            setQuoteForm((prev) => ({ ...prev, customerId: custRes.data.customers[0]._id }));
          }
        }

        const leadRes = await API.get('/crm/leads');
        if (leadRes.data.success) setLeads(leadRes.data.leads);

        const oppRes = await API.get('/crm/opportunities');
        if (oppRes.data.success) setOpportunities(oppRes.data.opportunities);

        const qtRes = await API.get('/crm/quotations');
        if (qtRes.data.success) setQuotations(qtRes.data.quotations);

        const fuRes = await API.get('/crm/followups');
        if (fuRes.data.success) setFollowUps(fuRes.data.followUps);

        if (hasFullCrm) {
          const repRes = await API.get('/crm/reports');
          if (repRes.data.success) setReports(repRes.data.analytics);
        }

        const itemRes = await API.get('/manufacturing/inventory/items');
        if (itemRes.data.success) setInventoryItems(itemRes.data.items);
      }

      // Sales Orders (Viewable by Sales, Production, Finance, Warehouse, Purchase)
      const soRes = await API.get('/crm/sales-orders');
      if (soRes.data.success) setSalesOrders(soRes.data.salesOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Actions & Handlers
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/crm/leads', leadForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowLeadModal(false);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register lead.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/crm/customers', customerForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowCustomerModal(false);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertLead = async (leadId) => {
    if (!window.confirm('Convert this Lead into a B2B Customer AND Sales Opportunity?')) return;
    setActionLoading(true);
    try {
      const res = await API.patch(`/crm/leads/${leadId}/convert`);
      if (res.data.success) {
        alert(res.data.message);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Conversion failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/crm/opportunities', oppForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowOppModal(false);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create opportunity.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddQuoteItem = () => {
    setQuoteForm((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: '', qty: 1, unitPrice: 0, discountPercent: 0 }],
    }));
  };

  const handleQuoteItemSelect = (idx, itemId) => {
    const found = inventoryItems.find((i) => i._id === itemId);
    const updated = [...quoteForm.items];
    updated[idx] = {
      ...updated[idx],
      itemId,
      unitPrice: found?.unitPrice || 0,
    };
    setQuoteForm((prev) => ({ ...prev, items: updated }));
  };

  const handleQuoteItemChange = (idx, field, val) => {
    const updated = [...quoteForm.items];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuoteForm((prev) => ({ ...prev, items: updated }));
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/crm/quotations', quoteForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowQuoteModal(false);
        if (res.data.quotation) {
          setSelectedQuoteForPrint(res.data.quotation);
        }
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertQuotation = async (quoteId) => {
    if (!window.confirm('Convert this accepted Quotation into a Confirmed Sales Order? Inventory stock will be checked & reserved automatically.')) return;
    setActionLoading(true);
    try {
      const res = await API.patch(`/crm/quotations/${quoteId}/convert`);
      if (res.data.success) {
        alert(res.data.message);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Conversion failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await API.patch(`/crm/sales-orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        alert(res.data.message);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/crm/followups', followForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowFollowUpModal(false);
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule follow-up.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFollowUp = async (id) => {
    try {
      const res = await API.patch(`/crm/followups/${id}/toggle`);
      if (res.data.success) {
        fetchCRMData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status toggle failed.');
    }
  };

  // If user role is NOT authorized for CRM (HR Manager, TL, Employee)
  if (!hasCrmAccess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Restricted: Sales Orders &amp; CRM</h2>
        <p className="text-sm text-slate-400">
          Your role (<span className="text-rose-400 font-bold">{userRole}</span>) does not have access permissions for Sales Orders or the CRM Portal.
        </p>
        <div className="bg-slate-950 p-4 rounded-xl text-xs text-slate-500 font-mono text-left space-y-1 border border-slate-800">
          <p className="font-bold text-slate-400">Sales Order Access Authorization Policy:</p>
          <p>• Sales Manager / Executive / General Manager / Admin: 🟢 Full / Assigned Sales Order Access</p>
          <p>• Production Manager: 🟡 View Confirmed Orders + Production Planning Action</p>
          <p>• Finance Manager: 🟡 View Confirmed Orders + GST Invoicing Action</p>
          <p>• Warehouse Manager: 🟡 View Orders + Picking/Dispatch Fulfillment Action</p>
          <p>• Purchase Manager: 🟡 View Material Shortage Requirements + Purchase Request Action</p>
          <p>• HR Manager / Team Leader / Employee: ❌ No Sales Order Access</p>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = l.companyName.toLowerCase().includes(search.toLowerCase()) || l.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Multi-Tenant Enterprise Sales Order &amp; Execution System</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {isRestrictedDeptManager ? 'Sales Orders & Operational Execution Portal' : 'Sales & Customer Relationship Management (CRM)'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isProductionManager && 'View confirmed sales orders and create/update manufacturing production orders.'}
              {isFinanceManager && 'View confirmed sales orders, billing amounts, GST tax breakdown, and issue invoices.'}
              {isWarehouseManager && 'View sales orders requiring picking, packing, and dispatch fulfillment.'}
              {isPurchaseManager && 'View confirmed sales orders and purchase material requirements when production requires them.'}
              {isSalesStaff && 'Lead Qualification → Opportunity → Stock-Aware Quotation → Sales Order → Production/Dispatch.'}
            </p>
          </div>

          {/* Action Buttons (Restricted View Indicator for Departmental Managers) */}
          {isSalesStaff ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Create Quotation</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
              <Eye className="w-4 h-4" />
              <span>Departmental Operational Access ({userRole})</span>
            </div>
          )}
        </div>
      </div>

      {/* CRM Navigation SubTabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {isSalesStaff && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>CRM Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Customer Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'leads' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Leads &amp; Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'opportunities' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Opportunities</span>
            </button>

            <button
              onClick={() => setActiveTab('quotations')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'quotations' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quotations (Stock-Aware)</span>
            </button>
          </>
        )}

        {/* Sales Orders Tab (Visible to Sales, Production, Finance, Warehouse, Purchase) */}
        <button
          onClick={() => setActiveTab('sales_orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sales_orders' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>
            {isProductionManager && 'Sales Orders & Production Requirements'}
            {isFinanceManager && 'Confirmed Orders & Invoicing Ledger'}
            {isWarehouseManager && 'Orders Requiring Dispatch'}
            {isPurchaseManager && 'Material Shortage & Purchase Requirements'}
            {isSalesStaff && 'Sales Orders & Dispatch'}
          </span>
        </button>

        {isSalesStaff && (
          <button
            onClick={() => setActiveTab('followups')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'followups' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Follow-ups &amp; Logs</span>
          </button>
        )}

        {hasFullCrm && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sales Analytics Reports</span>
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && isSalesStaff && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Total B2B Customers</span>
              <div className="text-2xl font-extrabold text-white font-mono">{metrics.totalCustomers}</div>
              <p className="text-[10px] text-emerald-400 font-mono">Active Accounts</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">New Leads</span>
              <div className="text-2xl font-extrabold text-blue-400 font-mono">{metrics.newLeads}</div>
              <p className="text-[10px] text-blue-400 font-mono">Fresh Inquiries</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Qualified Leads</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.qualifiedLeads}</div>
              <p className="text-[10px] text-emerald-400 font-mono">Ready for Proposal</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Open Opportunities</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">{metrics.openOpportunities}</div>
              <p className="text-[10px] text-purple-400 font-mono">Active Negotiation</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Pending Quotations</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{metrics.pendingQuotations}</div>
              <p className="text-[10px] text-amber-400 font-mono">Awaiting Signoff</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Active Sales Orders</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{metrics.activeSalesOrders}</div>
              <p className="text-[10px] text-slate-400 font-mono">In Execution</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Monthly Sales Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">₹{metrics.monthlySalesRevenue?.toLocaleString('en-IN')}</div>
              <p className="text-[10px] text-emerald-400 font-mono">Current Month</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Orders in Production</span>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">{metrics.ordersInProduction}</div>
              <p className="text-[10px] text-cyan-400 font-mono">Manufacturing Floor</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Ready for Dispatch</span>
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">{metrics.ordersReadyForDispatch}</div>
              <p className="text-[10px] text-indigo-400 font-mono">Warehouse Staging</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider block">Pending Follow-ups</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">{metrics.pendingFollowUps}</div>
              <p className="text-[10px] text-rose-400 font-mono">Scheduled Calls/Tasks</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER DIRECTORY */}
      {activeTab === 'customers' && isSalesStaff && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <span>B2B Customer Directory &amp; Credit Ledger</span>
            </h2>

            {isSalesStaff && (
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                + Add B2B Customer
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Credit Limit</th>
                  <th className="py-3 px-4 font-bold text-emerald-400">Total Purchases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{c.customerCode}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{c.companyName}</td>
                    <td className="py-3.5 px-4 font-sans">{c.contactPerson}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4">{c.gstin || 'URP'}</td>
                    <td className="py-3.5 px-4 font-sans">{c.billingAddress?.state}</td>
                    <td className="py-3.5 px-4">₹{c.creditLimit?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{c.totalPurchases?.toLocaleString('en-IN') || '₹0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEADS & PIPELINE */}
      {activeTab === 'leads' && isSalesStaff && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Leads Management &amp; Conversion Pipeline</span>
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Lead Company or Contact..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl"
              >
                <option value="">All Lead Stages</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Lead Code</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Industry / Location</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Est. Deal Value</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  {isSalesStaff && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{lead.leadCode}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{lead.companyName}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <div>{lead.contactPerson}</div>
                      <div className="text-[10px] text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div>{lead.industry || 'Manufacturing'}</div>
                      <div className="text-[10px] text-slate-400">{lead.city}, {lead.state}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">{lead.source}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{lead.estimatedValue?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lead.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          lead.status === 'won'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : lead.status === 'proposal'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    {isSalesStaff && (
                      <td className="py-3.5 px-4 text-right">
                        {!lead.convertedToCustomer && (
                          <button
                            type="button"
                            onClick={() => handleConvertLead(lead._id)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Convert to Customer &amp; Deal
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SALES OPPORTUNITIES */}
      {activeTab === 'opportunities' && isSalesStaff && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Sales Deal Opportunities Tracker</span>
            </h2>
            {isSalesStaff && (
              <button
                type="button"
                onClick={() => setShowOppModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                + New Opportunity
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Deal Name</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 font-bold text-white">Deal Value</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Expected Close Date</th>
                  <th className="py-3 px-4">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {opportunities.map((opp) => (
                  <tr key={opp._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{opp.opportunityName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {opp.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{opp.dealValue?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-blue-400 font-bold">{opp.probabilityPercent}%</td>
                    <td className="py-3.5 px-4">{new Date(opp.expectedCloseDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">{opp.activities || opp.notes || 'In progress'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: QUOTATIONS (STOCK-AWARE) */}
      {activeTab === 'quotations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Sales Quotations Engine (Inventory Stock-Aware)</span>
            </h2>
            {isSalesStaff && (
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                + Issue Quotation
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4 font-bold text-white">Grand Total (Incl. GST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{q.quoteNumber}</td>
                    <td className="py-3.5 px-4">{new Date(q.quoteDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">{q.customerId?.companyName}</td>
                    <td className="py-3.5 px-4">₹{q.subTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{q.grandTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteForPrint(q)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] inline-flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                        <span>Print Quote</span>
                      </button>

                      {isSalesStaff && q.status !== 'converted' && (
                        hasFullCrm ? (
                          <button
                            type="button"
                            onClick={() => handleConvertQuotation(q._id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            Convert to SO
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold border border-amber-500/20 px-2 py-1 rounded bg-amber-500/10 font-sans inline-block">
                            ⏳ Requires Signoff
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SALES ORDERS (ACCESSIBLE BY SALES, PRODUCTION, FINANCE, WAREHOUSE, PURCHASE) */}
      {activeTab === 'sales_orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <span>
                {isProductionManager && 'Active Sales Orders & Production Requirements (View + Production Action)'}
                {isFinanceManager && 'Confirmed Sales Orders & Invoicing Ledger (View + Finance Action)'}
                {isWarehouseManager && 'Sales Orders Ready for Dispatch (View + Warehouse Action)'}
                {isPurchaseManager && 'Sales Orders Material Shortage Requirements (View + Purchase Action)'}
                {isSalesStaff && 'Confirmed Sales Orders & Dispatch Progress'}
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Inventory Status</th>
                  <th className="py-3 px-4 font-bold text-white">Grand Total</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {salesOrders.map((so) => (
                  <tr key={so._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{so.orderNumber}</td>
                    <td className="py-3.5 px-4">{new Date(so.orderDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(so.deliveryDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{so.customerId?.companyName}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          so.inventoryStatus?.includes('Shortage')
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {so.inventoryStatus || 'Reserved'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{so.grandTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {so.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans space-x-2">
                      {/* Print Sales Order Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPrint(so)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] inline-flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                        <span>Print Order</span>
                      </button>

                      {/* Production Manager Action */}
                      {isProductionManager && (
                        <button
                          type="button"
                          onClick={() => navigate('/manufacturing/production')}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-cyan-600/20 cursor-pointer"
                        >
                          <Factory className="w-3.5 h-3.5" /> ⚡ Production Plan
                        </button>
                      )}

                      {/* Finance Manager Action */}
                      {isFinanceManager && (
                        <button
                          type="button"
                          onClick={() => navigate('/billing')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> 📄 Issue GST Invoice
                        </button>
                      )}

                      {/* Warehouse Manager Action */}
                      {isWarehouseManager && (
                        <select
                          value={so.status}
                          onChange={(e) => handleUpdateOrderStatus(so._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[11px] text-white px-2 py-1 rounded font-semibold cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ready for Dispatch">Ready for Dispatch</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}

                      {/* Purchase Manager Action */}
                      {isPurchaseManager && (
                        <button
                          type="button"
                          onClick={() => navigate('/manufacturing/purchase')}
                          className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-purple-600/20 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> 🛒 Purchase Material
                        </button>
                      )}

                      {/* Sales / Admin Control */}
                      {isSalesStaff && (
                        <select
                          value={so.status}
                          onChange={(e) => handleUpdateOrderStatus(so._id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[11px] text-white px-2 py-1 rounded font-semibold cursor-pointer"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Production">In Production</option>
                          <option value="Ready for Dispatch">Ready for Dispatch</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: FOLLOW-UPS & LOGS */}
      {activeTab === 'followups' && isSalesStaff && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-purple-400" />
              <span>Sales Activity Scheduler &amp; Customer Interaction Logs</span>
            </h2>
            {isSalesStaff && (
              <button
                type="button"
                onClick={() => setShowFollowUpModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer"
              >
                + Schedule Follow-up
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  {isSalesStaff && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {followUps.map((fu) => (
                  <tr key={fu._id}>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{fu.title}</td>
                    <td className="py-3.5 px-4 font-sans">{fu.type}</td>
                    <td className="py-3.5 px-4">{new Date(fu.scheduledDate).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fu.priority === 'High' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400'}`}>
                        {fu.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px]">{fu.status}</td>
                    {isSalesStaff && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleFollowUp(fu._id)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Toggle Complete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: CRM SALES REPORTS */}
      {activeTab === 'reports' && hasFullCrm && reports && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-blue-400" />
            <span>CRM Sales Performance &amp; Conversion Analytics</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-sans uppercase">Total Leads Inquired</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{reports.totalLeads}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-sans uppercase">Won Leads</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{reports.wonLeads}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-sans uppercase">Lead Conversion Rate</span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">{reports.leadConversionRate || reports.conversionRate}%</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-sans uppercase">Total Sales Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{reports.totalSalesOrderValue?.toLocaleString('en-IN') || reports.totalRevenue?.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE SALES QUOTATION DOCUMENT MODAL */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white text-slate-100 print:text-black">
            {/* Top Toolbar (Hidden during print) */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white text-sm">
                  Official Commercial Sales Quotation [{selectedQuoteForPrint.quoteNumber}]
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPrint(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 font-sans bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-6">
              {/* Header: Company & Tax ID */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 print:border-black/20 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 font-black text-xl text-blue-400 print:text-blue-700">
                    <Building2 className="w-7 h-7" />
                    <span>Manufacturing SaaS ERP Enterprises</span>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
                    GSTIN: 33AAACA9999A1Z5 | Regd Office: Plot 42, Industrial Estate, Guindy, Chennai
                  </p>
                  <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
                    Email: sales@saaserp.com | Tel: +91 44 2250 9900
                  </p>
                </div>

                <div className="text-right font-mono space-y-1">
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 print:bg-blue-100 print:text-blue-800 font-bold rounded-lg text-sm uppercase">
                    Commercial Sales Quotation
                  </span>
                  <p className="text-xs font-bold text-white print:text-black mt-2">
                    Quote #: {selectedQuoteForPrint.quoteNumber}
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-700">
                    Quote Date: {new Date(selectedQuoteForPrint.quoteDate || selectedQuoteForPrint.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-700">
                    Valid Until: {new Date(selectedQuoteForPrint.validUntil || Date.now() + 30*86400000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To Customer Section */}
              <div className="bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300">
                <p className="text-xs font-bold text-blue-400 print:text-blue-800 uppercase tracking-wider mb-1">
                  Bill To / Customer Details
                </p>
                <h3 className="text-base font-bold text-white print:text-black">
                  {selectedQuoteForPrint.customerId?.companyName || 'Valued B2B Customer'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 print:text-slate-700 mt-2 font-mono">
                  <p>Contact Person: {selectedQuoteForPrint.customerId?.contactPerson || 'N/A'}</p>
                  <p>Email: {selectedQuoteForPrint.customerId?.email || 'N/A'}</p>
                  <p>Phone: {selectedQuoteForPrint.customerId?.phone || 'N/A'}</p>
                  <p>GSTIN: {selectedQuoteForPrint.customerId?.gstin || 'URP'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-black uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300">Item Description</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-center">Qty</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">Taxable Amt</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-300 font-mono text-slate-300 print:text-slate-900">
                    {(selectedQuoteForPrint.items || []).map((it, idx) => {
                      const itemDoc = inventoryItems.find((i) => i._id === (it.itemId?._id || it.itemId));
                      const lineTaxable = (it.qty * it.unitPrice);
                      const lineGst = lineTaxable * 0.18;
                      const lineTotal = lineTaxable + lineGst;

                      return (
                        <tr key={idx}>
                          <td className="py-3 px-3 font-sans font-bold text-white print:text-black">
                            {itemDoc?.name || it.name || 'Industrial Component / Equipment'}
                          </td>
                          <td className="py-3 px-3 text-center">{it.qty}</td>
                          <td className="py-3 px-3 text-right">₹{it.unitPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right">₹{lineTaxable.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right text-slate-400 print:text-slate-700">₹{Math.round(lineGst).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-400 print:text-emerald-800">
                            ₹{Math.round(lineTotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals & Tax Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="w-full sm:w-1/2 space-y-2 text-xs">
                  <p className="font-bold text-slate-300 print:text-black uppercase tracking-wider">Terms &amp; Conditions:</p>
                  <div className="bg-slate-950/60 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300 text-[11px] text-slate-400 print:text-slate-700 font-mono space-y-1">
                    <p>1. Prices are valid for 30 days from quote issue date.</p>
                    <p>2. 18% GST included in final total computation.</p>
                    <p>3. Delivery timeline as per agreed PO schedule.</p>
                  </div>
                </div>

                <div className="w-full sm:w-80 bg-slate-950/80 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>Subtotal:</span>
                    <span>₹{selectedQuoteForPrint.subTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>GST (18% Total):</span>
                    <span>₹{selectedQuoteForPrint.taxTotal?.toLocaleString('en-IN') || Math.round(selectedQuoteForPrint.subTotal * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-emerald-400 print:text-emerald-900 border-t border-slate-800 print:border-slate-300 pt-2">
                    <span>Grand Total (Incl. Tax):</span>
                    <span>₹{selectedQuoteForPrint.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-8 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-400 print:text-slate-700 font-mono">
                <div>
                  <p>Customer Signoff &amp; Stamp</p>
                  <div className="h-10 border-b border-dashed border-slate-700 w-48 mt-2"></div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white print:text-black">For SaaS ERP Manufacturing Enterprises</p>
                  <div className="h-10 border-b border-dashed border-slate-700 w-48 mt-2 ml-auto"></div>
                  <p className="text-[10px] mt-1 text-slate-500">Authorized Sales Signatory</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions (Hidden during print) */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedQuoteForPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE SALES ORDER DOCUMENT MODAL */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white text-slate-100 print:text-black">
            {/* Top Toolbar (Hidden during print) */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-sm">
                  Official Commercial Sales Order [{selectedOrderForPrint.orderNumber}]
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 font-sans bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-6">
              {/* Header: Company & Tax ID */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 print:border-black/20 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 font-black text-xl text-amber-400 print:text-amber-700">
                    <Building2 className="w-7 h-7" />
                    <span>Manufacturing SaaS ERP Enterprises</span>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
                    GSTIN: 33AAACA9999A1Z5 | Regd Office: Plot 42, Industrial Estate, Guindy, Chennai
                  </p>
                  <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
                    Email: orders@saaserp.com | Tel: +91 44 2250 9900
                  </p>
                </div>

                <div className="text-right font-mono space-y-1">
                  <span className="inline-block px-3 py-1 bg-amber-600/20 text-amber-400 print:bg-amber-100 print:text-amber-800 font-bold rounded-lg text-sm uppercase">
                    Confirmed Sales Order
                  </span>
                  <p className="text-xs font-bold text-white print:text-black mt-2">
                    Order #: {selectedOrderForPrint.orderNumber}
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-700">
                    Order Date: {new Date(selectedOrderForPrint.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-700">
                    Delivery Date: {new Date(selectedOrderForPrint.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer & Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-1">
                  <p className="text-xs font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider">
                    Customer Account Details
                  </p>
                  <h3 className="text-base font-bold text-white print:text-black">
                    {selectedOrderForPrint.customerId?.companyName || 'Valued B2B Customer'}
                  </h3>
                  <p className="text-xs text-slate-300 print:text-slate-700 font-mono">
                    Contact: {selectedOrderForPrint.customerId?.contactPerson || 'N/A'} ({selectedOrderForPrint.customerId?.phone || 'N/A'})
                  </p>
                  <p className="text-xs text-slate-300 print:text-slate-700 font-mono">
                    GSTIN: {selectedOrderForPrint.customerId?.gstin || 'URP'}
                  </p>
                </div>

                <div className="bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-1 font-mono text-xs">
                  <p className="font-bold text-blue-400 print:text-blue-800 uppercase tracking-wider">
                    Order Operational Status
                  </p>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Inventory Status:</span>
                    <span className="font-bold text-emerald-400 print:text-emerald-800">{selectedOrderForPrint.inventoryStatus || 'Reserved'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Execution Status:</span>
                    <span className="font-bold text-amber-400 print:text-amber-800 uppercase">{selectedOrderForPrint.status}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 print:border-slate-300">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-black uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300">Item Description</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-center">Qty</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">Taxable Amt</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 border-b border-slate-800 print:border-slate-300 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-300 font-mono text-slate-300 print:text-slate-900">
                    {(selectedOrderForPrint.items || []).map((it, idx) => {
                      const itemDoc = inventoryItems.find((i) => i._id === (it.itemId?._id || it.itemId));
                      const lineTaxable = (it.qty * it.unitPrice);
                      const lineGst = lineTaxable * 0.18;
                      const lineTotal = lineTaxable + lineGst;

                      return (
                        <tr key={idx}>
                          <td className="py-3 px-3 font-sans font-bold text-white print:text-black">
                            {itemDoc?.name || it.name || 'Industrial Component / Equipment'}
                          </td>
                          <td className="py-3 px-3 text-center">{it.qty}</td>
                          <td className="py-3 px-3 text-right">₹{it.unitPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right">₹{lineTaxable.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right text-slate-400 print:text-slate-700">₹{Math.round(lineGst).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-400 print:text-emerald-800">
                            ₹{Math.round(lineTotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Total */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 bg-slate-950/80 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>Order Subtotal:</span>
                    <span>₹{selectedOrderForPrint.subTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 print:text-slate-700">
                    <span>GST (18% Total):</span>
                    <span>₹{selectedOrderForPrint.taxTotal?.toLocaleString('en-IN') || Math.round(selectedOrderForPrint.subTotal * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-emerald-400 print:text-emerald-900 border-t border-slate-800 print:border-slate-300 pt-2">
                    <span>Grand Total (Incl. Tax):</span>
                    <span>₹{selectedOrderForPrint.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-8 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-400 print:text-slate-700 font-mono">
                <div>
                  <p>Customer Receipt Signoff</p>
                  <div className="h-10 border-b border-dashed border-slate-700 w-48 mt-2"></div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white print:text-black">For SaaS ERP Order Dispatch Operations</p>
                  <div className="h-10 border-b border-dashed border-slate-700 w-48 mt-2 ml-auto"></div>
                  <p className="text-[10px] mt-1 text-slate-500">Authorized Operations Manager</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions (Hidden during print) */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS SECTION */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateLead} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Register New B2B Lead Inquiry</span>
              </h3>
              <button type="button" onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={leadForm.contactPerson}
                  onChange={(e) => setLeadForm({ ...leadForm, contactPerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Lead Source</label>
                <select
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Website">Website</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Est. Deal Value (₹)</label>
                <input
                  type="number"
                  value={leadForm.estimatedValue}
                  onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowLeadModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer">
                Register Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateCustomer} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <span>Register B2B Customer Account</span>
              </h3>
              <button type="button" onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={customerForm.contactPerson}
                  onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">GSTIN</label>
                <input
                  type="text"
                  placeholder="33AAACA9999A1Z5"
                  value={customerForm.gstin}
                  onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={customerForm.creditLimit}
                  onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCustomerModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer">
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {showOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateOpportunity} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Create Sales Opportunity</span>
              </h3>
              <button type="button" onClick={() => setShowOppModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Opportunity / Deal Name</label>
              <input
                type="text"
                required
                value={oppForm.opportunityName}
                onChange={(e) => setOppForm({ ...oppForm, opportunityName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Deal Value (₹)</label>
              <input
                type="number"
                value={oppForm.dealValue}
                onChange={(e) => setOppForm({ ...oppForm, dealValue: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pipeline Stage</label>
              <select
                value={oppForm.stage}
                onChange={(e) => setOppForm({ ...oppForm, stage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              >
                <option value="Qualification">Qualification</option>
                <option value="Value Proposition">Value Proposition</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowOppModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer">
                Create Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleCreateQuotation} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Issue Sales Quotation (Inventory Stock-Aware)</span>
                </h3>
              </div>
              <button type="button" onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Customer</label>
              <select
                value={quoteForm.customerId}
                onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Product Line Items</span>
                <button type="button" onClick={handleAddQuoteItem} className="text-xs text-blue-400 font-bold cursor-pointer">
                  + Add Item
                </button>
              </div>

              {quoteForm.items.map((it, idx) => {
                const itemDoc = inventoryItems.find((i) => i._id === it.itemId);
                const stockAvail = itemDoc ? itemDoc.totalStock : 0;
                const isShortage = Number(it.qty || 1) > stockAvail;

                return (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="col-span-2">
                        <select
                          value={it.itemId}
                          onChange={(e) => handleQuoteItemSelect(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-bold"
                        >
                          <option value="">Select Inventory Product...</option>
                          {inventoryItems.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} (Available Stock: {item.totalStock} {item.uom})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={it.qty}
                          onChange={(e) => handleQuoteItemChange(idx, 'qty', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Price"
                          value={it.unitPrice}
                          onChange={(e) => handleQuoteItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    {it.itemId && (
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className={`font-semibold ${isShortage ? 'text-rose-400' : 'text-emerald-400'}`}>
                          Stock Status: {stockAvail} Available {isShortage && `⚠️ Shortage of ${it.qty - stockAvail} Pcs (Production Auto-Required)`}
                        </span>
                        <span className="text-white font-bold">Total: ₹{(it.qty * it.unitPrice).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer">
                Issue Quotation
              </button>
            </div>
          </form>
        </div>
      )}

      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateFollowUp} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-purple-400" />
                <span>Schedule Sales Task / Follow-up</span>
              </h3>
              <button type="button" onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Call regarding drive shaft quotation"
                value={followForm.title}
                onChange={(e) => setFollowForm({ ...followForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Type</label>
                <select
                  value={followForm.type}
                  onChange={(e) => setFollowForm({ ...followForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="Task">Task</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Note">Note</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Site Visit">Site Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Priority</label>
                <select
                  value={followForm.priority}
                  onChange={(e) => setFollowForm({ ...followForm, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Scheduled Date &amp; Time</label>
              <input
                type="datetime-local"
                required
                value={followForm.scheduledDate}
                onChange={(e) => setFollowForm({ ...followForm, scheduledDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer">
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CRMHub;
