import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  IndianRupee,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Download,
  Send,
  AlertTriangle,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  TrendingUp,
  Boxes,
  PieChart,
  Settings,
  Layers,
  FileCheck,
  Zap,
} from 'lucide-react';

const GSTBillingHub = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [metrics, setMetrics] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalGstCollected: 0,
    totalSales: 0,
    totalOutstanding: 0,
  });
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [debitNotes, setDebitNotes] = useState([]);
  const [gstReports, setGstReports] = useState(null);
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ invoiceId: '', amountPaid: 0, paymentMethod: 'NEFT/RTGS', paymentRef: '', notes: '' });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    billingAddress: { street: '', city: '', state: 'Tamil Nadu', stateCode: '33', zipCode: '' },
  });

  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({ invoiceId: '', reason: 'Product Return', totalRefundAmount: 5000 });

  const [showDebitModal, setShowDebitModal] = useState(false);
  const [debitForm, setDebitForm] = useState({ invoiceId: '', reason: 'Price Correction', totalDebitAmount: 2500 });

  // Create Invoice Form State
  const [invForm, setInvForm] = useState({
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Thank you for your business!',
    items: [{ itemId: '', qty: 1, unitPrice: 0, discountPercent: 0, hsnCode: '8471', gstRate: 18 }],
  });

  useEffect(() => {
    fetchAllData();
  }, [statusFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Invoices
      const invRes = await API.get('/billing/invoices');
      if (invRes.data.success) {
        setInvoices(invRes.data.invoices);
        setMetrics(invRes.data.metrics);
      }

      // Customers
      const custRes = await API.get('/billing/customers');
      if (custRes.data.success) {
        setCustomers(custRes.data.customers);
        if (custRes.data.customers.length > 0 && !invForm.customerId) {
          setInvForm((prev) => ({ ...prev, customerId: custRes.data.customers[0]._id }));
        }
      }

      // Items from Inventory
      const itemRes = await API.get('/manufacturing/inventory/items');
      if (itemRes.data.success) {
        setItems(itemRes.data.items);
      }

      // Settings
      const setRes = await API.get('/billing/settings');
      if (setRes.data.success) setSettings(setRes.data.settings);

      // Reports
      const repRes = await API.get('/billing/reports');
      if (repRes.data.success) setGstReports(repRes.data);

      // Credit Notes
      const cnRes = await API.get('/billing/credit-notes');
      if (cnRes.data.success) setCreditNotes(cnRes.data.creditNotes);

      // Debit Notes
      const dnRes = await API.get('/billing/debit-notes');
      if (dnRes.data.success) setDebitNotes(dnRes.data.debitNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for live GST calculation on Create Invoice Form
  const selectedCustomer = customers.find((c) => c._id === invForm.customerId);
  const sellerState = settings?.state || 'Tamil Nadu';
  const customerState = selectedCustomer?.billingAddress?.state || 'Tamil Nadu';
  const isInterState = sellerState.trim().toLowerCase() !== customerState.trim().toLowerCase();

  const calculateLiveInvTotals = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    invForm.items.forEach((it) => {
      const qty = Number(it.qty || 0);
      const price = Number(it.unitPrice || 0);
      const disc = Number(it.discountPercent || 0);
      const rate = Number(it.gstRate || 18);

      const gross = qty * price;
      const discountVal = (gross * disc) / 100;
      const taxable = gross - discountVal;

      subTotal += gross;
      totalDiscount += discountVal;
      totalTaxable += taxable;

      if (isInterState) {
        igstTotal += (taxable * rate) / 100;
      } else {
        cgstTotal += (taxable * (rate / 2)) / 100;
        sgstTotal += (taxable * (rate / 2)) / 100;
      }
    });

    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = totalTaxable + totalTax;

    return {
      subTotal: Math.round(subTotal),
      totalDiscount: Math.round(totalDiscount),
      totalTaxable: Math.round(totalTaxable),
      cgstTotal: Math.round(cgstTotal),
      sgstTotal: Math.round(sgstTotal),
      igstTotal: Math.round(igstTotal),
      totalTax: Math.round(totalTax),
      grandTotal: Math.round(grandTotal),
    };
  };

  const liveTotals = calculateLiveInvTotals();

  const handleAddItemRow = () => {
    setInvForm((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: '', qty: 1, unitPrice: 0, discountPercent: 0, hsnCode: '8471', gstRate: 18 }],
    }));
  };

  const handleRemoveItemRow = (idx) => {
    setInvForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleItemSelect = (idx, itemId) => {
    const foundItem = items.find((i) => i._id === itemId);
    const updated = [...invForm.items];
    updated[idx] = {
      ...updated[idx],
      itemId,
      unitPrice: foundItem?.unitPrice || 0,
      hsnCode: foundItem?.itemCode || '8471',
    };
    setInvForm((prev) => ({ ...prev, items: updated }));
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...invForm.items];
    updated[idx] = { ...updated[idx], [field]: val };
    setInvForm((prev) => ({ ...prev, items: updated }));
  };

  // Submit Invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/billing/invoices', invForm);
      if (res.data.success) {
        alert(res.data.message);
        setActiveTab('history');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/billing/customers', customerForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowCustomerModal(false);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.patch(`/billing/invoices/${payForm.invoiceId}/pay`, payForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowPayModal(false);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Invoice
  const handleCancelInvoice = async (id) => {
    if (!window.confirm('Cancel this invoice? This will restore raw material stock to Inventory.')) return;
    try {
      const res = await API.patch(`/billing/invoices/${id}/cancel`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel invoice.');
    }
  };

  // Submit Credit Note
  const handleCreateCreditNote = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/billing/credit-notes', creditForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowCreditModal(false);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Credit note failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Debit Note
  const handleCreateDebitNote = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/billing/debit-notes', debitForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowDebitModal(false);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Debit note failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerId?.companyName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Multi-Tenant Enterprise Financial Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">GST Billing &amp; Invoicing Module</h1>
            <p className="text-xs text-slate-400 mt-1">
              Auto CGST/SGST vs IGST engine, CRM integration, Inventory stock auto-deduction &amp; GSTR-1/3B filing reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create GST Invoice</span>
            </button>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer (CRM)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Billing Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'create' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoice History</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'payments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Credit &amp; Debit Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>GST Reports &amp; Filing</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>GST Config Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Sales Invoiced</span>
              <div className="text-2xl font-extrabold text-white font-mono">₹{metrics.totalSales?.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-500 font-mono">Total Invoices: {metrics.totalInvoices}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total GST Tax Collected</span>
              <div className="text-2xl font-extrabold text-blue-400 font-mono">₹{metrics.totalGstCollected?.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-500 font-mono">CGST + SGST + IGST</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Paid / Settled</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.paidInvoices} Invoices</div>
              <p className="text-[11px] text-slate-500 font-mono">100% Payment Cleared</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Outstanding Due</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">₹{metrics.totalOutstanding?.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-500 font-mono">Pending: {metrics.pendingInvoices} Invoices</p>
            </div>
          </div>

          {/* Quick Action Bar + Recent Invoices */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Recent Invoices &amp; Real-Time Ledger</span>
              </h2>
              <button onClick={() => setActiveTab('history')} className="text-xs text-blue-400 font-semibold hover:underline">
                View All Invoices →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Taxable Amt</th>
                    <th className="py-3 px-4">GST Tax</th>
                    <th className="py-3 px-4 font-bold text-white">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-blue-400">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{inv.customerId?.companyName}</td>
                      <td className="py-3.5 px-4">₹{inv.totalTaxableAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-blue-300">₹{inv.totalTaxAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : inv.paymentStatus === 'partially_paid'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : inv.paymentStatus === 'cancelled'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE INVOICE */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateInvoice} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Issue New GST Sales Invoice</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-determines CGST+SGST (Intra-state) vs IGST (Inter-state) &amp; deducts Inventory stock upon submission.
              </p>
            </div>

            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono uppercase">Tax Mode:</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  isInterState ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isInterState ? 'INTER-STATE (IGST 18%)' : 'INTRA-STATE (CGST 9% + SGST 9%)'}
              </span>
            </div>
          </div>

          {/* Form Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Customer (CRM)</label>
              <select
                value={invForm.customerId}
                onChange={(e) => setInvForm({ ...invForm, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.billingAddress?.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Invoice Date</label>
              <input
                type="date"
                value={invForm.invoiceDate}
                onChange={(e) => setInvForm({ ...invForm, invoiceDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Due Date</label>
              <input
                type="date"
                value={invForm.dueDate}
                onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Line Items (Linked to Inventory Master)</h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
              >
                + Add Item Line
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Inventory Product</th>
                    <th className="py-2.5 px-3">HSN Code</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Unit Price (₹)</th>
                    <th className="py-2.5 px-3">Discount %</th>
                    <th className="py-2.5 px-3">GST %</th>
                    <th className="py-2.5 px-3 font-bold text-white">Line Taxable</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {invForm.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3">
                        <select
                          value={it.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-semibold text-xs"
                        >
                          <option value="">Select Item from Inventory...</option>
                          {items.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} (Stock: {item.totalStock} {item.uom})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={it.hsnCode}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white text-xs font-bold"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white text-xs font-bold"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.discountPercent}
                          onChange={(e) => handleItemChange(idx, 'discountPercent', e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <select
                          value={it.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs"
                        >
                          <option value={18}>18%</option>
                          <option value={12}>12%</option>
                          <option value={5}>5%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        ₹{(it.qty * it.unitPrice * (1 - (it.discountPercent || 0) / 100)).toFixed(0)}
                      </td>

                      <td className="py-2.5 px-3">
                        {invForm.items.length > 1 && (
                          <button type="button" onClick={() => handleRemoveItemRow(idx)} className="text-rose-400 hover:text-rose-300">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Invoice Notes &amp; Payment Instructions</label>
              <textarea
                rows="3"
                value={invForm.notes}
                onChange={(e) => setInvForm({ ...invForm, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              ></textarea>
            </div>

            <div className="w-full md:w-80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Gross):</span>
                <span>₹{liveTotals.subTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Discount:</span>
                <span className="text-rose-400">-₹{liveTotals.totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800 pt-1">
                <span>Taxable Amount:</span>
                <span>₹{liveTotals.totalTaxable.toLocaleString('en-IN')}</span>
              </div>

              {isInterState ? (
                <div className="flex justify-between text-purple-400 font-bold">
                  <span>IGST (18%):</span>
                  <span>+₹{liveTotals.igstTotal.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>CGST (9%):</span>
                    <span>+₹{liveTotals.cgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>SGST (9%):</span>
                    <span>+₹{liveTotals.sgstTotal.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-base font-extrabold text-emerald-400 border-t border-slate-800 pt-2 font-sans">
                <span>Grand Total (₹):</span>
                <span>₹{liveTotals.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{actionLoading ? 'Issuing Invoice...' : 'Generate &amp; Issue GST Invoice'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: INVOICE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Issued Invoices &amp; Tax Ledgers</span>
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Invoice # or Customer..."
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
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Tax Type</th>
                  <th className="py-3 px-4">Taxable Value</th>
                  <th className="py-3 px-4">GST Tax</th>
                  <th className="py-3 px-4 font-bold text-white">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-500">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-blue-400">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">{inv.customerId?.companyName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 font-semibold text-slate-300">
                          {inv.isInterState ? 'IGST' : 'CGST+SGST'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">₹{inv.totalTaxableAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-blue-300">₹{inv.totalTaxAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : inv.paymentStatus === 'partially_paid'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : inv.paymentStatus === 'cancelled'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowPrintModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Printable GST PDF
                        </button>

                        {inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled' && (
                          <button
                            onClick={() => {
                              setPayForm({ invoiceId: inv._id, amountPaid: inv.balanceDue, paymentMethod: 'NEFT/RTGS', paymentRef: '', notes: '' });
                              setShowPayModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" /> Record Payment
                          </button>
                        )}

                        {inv.paymentStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelInvoice(inv._id)}
                            className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[11px]"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT TRACKING */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Accounts Receivable &amp; Payment Settlement Log</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4 font-bold text-rose-400">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">{inv.customerId?.companyName}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">₹{inv.paidAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">₹{inv.balanceDue?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : inv.paymentStatus === 'partially_paid'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setPayForm({ invoiceId: inv._id, amountPaid: inv.balanceDue, paymentMethod: 'NEFT/RTGS', paymentRef: '', notes: '' });
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CREDIT & DEBIT NOTES */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Credit Notes (Returns) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-400" />
                <span>Credit Notes (Goods Return / Refund)</span>
              </h2>
              <button
                onClick={() => setShowCreditModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                + Issue Credit Note
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">CN Number</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Refund Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {creditNotes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-500">
                        No credit notes issued.
                      </td>
                    </tr>
                  ) : (
                    creditNotes.map((cn) => (
                      <tr key={cn._id}>
                        <td className="py-3 px-3 font-bold text-rose-400">{cn.creditNoteNumber}</td>
                        <td className="py-3 px-3 text-blue-400">{cn.invoiceId?.invoiceNumber}</td>
                        <td className="py-3 px-3 font-sans">{cn.reason}</td>
                        <td className="py-3 px-3 font-extrabold text-emerald-400 text-right">₹{cn.totalRefundAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debit Notes (Corrections) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Debit Notes (Price Corrections / Extra Charges)</span>
              </h2>
              <button
                onClick={() => setShowDebitModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                + Issue Debit Note
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">DN Number</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Debit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {debitNotes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-500">
                        No debit notes issued.
                      </td>
                    </tr>
                  ) : (
                    debitNotes.map((dn) => (
                      <tr key={dn._id}>
                        <td className="py-3 px-3 font-bold text-amber-400">{dn.debitNoteNumber}</td>
                        <td className="py-3 px-3 text-blue-400">{dn.invoiceId?.invoiceNumber}</td>
                        <td className="py-3 px-3 font-sans">{dn.reason}</td>
                        <td className="py-3 px-3 font-extrabold text-amber-400 text-right">₹{dn.totalDebitAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GST REPORTS (GSTR-1 & GSTR-3B) */}
      {activeTab === 'reports' && gstReports && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <span>GST Tax Return Filing Summary (GSTR-1 &amp; GSTR-3B)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                B2B Sales breakdown, CGST, SGST, IGST tax liabilities for statutory monthly filing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Tax Report
              </button>
            </div>
          </div>

          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Total CGST Collected</span>
              <div className="text-xl font-bold text-blue-400 mt-1">₹{gstReports.summary?.totalCgst?.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Total SGST Collected</span>
              <div className="text-xl font-bold text-blue-400 mt-1">₹{gstReports.summary?.totalSgst?.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Total IGST Collected</span>
              <div className="text-xl font-bold text-purple-400 mt-1">₹{gstReports.summary?.totalIgst?.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-sans">Total Tax Liability</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">₹{gstReports.summary?.totalTaxLiability?.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* GSTR-1 B2B Sales Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">GSTR-1 B2B Sales Invoices Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer GSTIN</th>
                    <th className="py-2.5 px-3">Place of Supply</th>
                    <th className="py-2.5 px-3">Taxable Value</th>
                    <th className="py-2.5 px-3 text-blue-400">CGST</th>
                    <th className="py-2.5 px-3 text-blue-400">SGST</th>
                    <th className="py-2.5 px-3 text-purple-400">IGST</th>
                    <th className="py-2.5 px-3 font-bold text-white">Invoice Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {gstReports.gstr1Sales?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-blue-400">{row.invoiceNumber}</td>
                      <td className="py-3 px-3">{new Date(row.invoiceDate).toLocaleDateString()}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white">{row.customerGstin}</td>
                      <td className="py-3 px-3">{row.placeOfSupply}</td>
                      <td className="py-3 px-3">₹{row.taxableAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-blue-300">₹{row.cgst?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-blue-300">₹{row.sgst?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-purple-300">₹{row.igst?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-400">₹{row.invoiceValue?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: GST SETTINGS */}
      {activeTab === 'settings' && settings && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await API.put('/billing/settings', settings);
              if (res.data.success) alert(res.data.message);
            } catch (err) {
              alert('Failed to update settings');
            }
          }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl"
        >
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Company GST Identification &amp; Invoice Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-400">
            <div>
              <label className="block uppercase mb-1">Company GSTIN</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase font-mono font-extrabold"
              />
            </div>

            <div>
              <label className="block uppercase mb-1">State &amp; State Code</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
              />
            </div>

            <div>
              <label className="block uppercase mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block uppercase mb-1">Default GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.defaultGstRate}
                onChange={(e) => setSettings({ ...settings, defaultGstRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20">
              Save GST Settings
            </button>
          </div>
        </form>
      )}

      {/* MODAL: PRINTABLE GST TAX INVOICE */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 space-y-6 shadow-2xl font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                <p className="text-xs font-mono font-bold text-slate-600 mt-1">Invoice #: {selectedInvoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500 font-mono">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right text-xs text-slate-700">
                <h2 className="font-extrabold text-sm text-slate-900">{settings?.bankDetails?.accountName || 'Apex Manufacturing Pvt Ltd'}</h2>
                <p>GSTIN: <span className="font-mono font-bold text-slate-900">{settings?.gstin}</span></p>
                <p>State: {selectedInvoice.sellerState}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold uppercase text-slate-500 text-[10px] block mb-1">Billed To (Customer):</span>
                <p className="font-extrabold text-sm text-slate-900">{selectedInvoice.customerId?.companyName}</p>
                <p>{selectedInvoice.customerId?.billingAddress?.street}, {selectedInvoice.customerId?.billingAddress?.city}</p>
                <p>State: <span className="font-bold text-slate-900">{selectedInvoice.customerId?.billingAddress?.state}</span></p>
                <p>GSTIN: <span className="font-mono font-bold text-slate-900">{selectedInvoice.customerId?.gstin || 'URP'}</span></p>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase text-slate-500 text-[10px] block mb-1">Place of Supply:</span>
                <p className="font-bold text-slate-900">{selectedInvoice.placeOfSupply}</p>
                <p className="mt-2 font-bold uppercase text-slate-500 text-[10px]">Payment Terms:</p>
                <p className="font-semibold text-slate-800">Net 30 Days</p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <th className="p-2">Item Description</th>
                  <th className="p-2">HSN</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Rate</th>
                  <th className="p-2">Taxable Value</th>
                  {selectedInvoice.isInterState ? (
                    <th className="p-2">IGST</th>
                  ) : (
                    <>
                      <th className="p-2">CGST</th>
                      <th className="p-2">SGST</th>
                    </>
                  )}
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {selectedInvoice.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-sans font-bold text-slate-900">{it.name}</td>
                    <td className="p-2">{it.hsnCode}</td>
                    <td className="p-2">{it.qty} {it.uom}</td>
                    <td className="p-2">₹{it.unitPrice}</td>
                    <td className="p-2">₹{it.taxableAmount}</td>
                    {selectedInvoice.isInterState ? (
                      <td className="p-2">₹{it.igstAmount} ({it.igstRate}%)</td>
                    ) : (
                      <>
                        <td className="p-2">₹{it.cgstAmount} ({it.cgstRate}%)</td>
                        <td className="p-2">₹{it.sgstAmount} ({it.sgstRate}%)</td>
                      </>
                    )}
                    <td className="p-2 text-right font-extrabold text-slate-900">₹{it.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Bank Payment Details:</p>
                <p className="font-mono">Bank: {settings?.bankDetails?.bankName}</p>
                <p className="font-mono">A/C: {settings?.bankDetails?.accountNumber}</p>
                <p className="font-mono">IFSC: {settings?.bankDetails?.ifscCode}</p>
              </div>

              <div className="w-64 space-y-1 text-right font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.totalTaxableAmount?.toLocaleString('en-IN')}</span>
                </div>
                {selectedInvoice.isInterState ? (
                  <div className="flex justify-between text-purple-700 font-bold">
                    <span>IGST Total:</span>
                    <span>₹{selectedInvoice.igstTotal?.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>CGST Total:</span>
                      <span>₹{selectedInvoice.cgstTotal?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>SGST Total:</span>
                      <span>₹{selectedInvoice.sgstTotal?.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-900 pt-1 font-sans">
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoice.grandTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleRecordPayment} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Record Invoice Payment</span>
              </h3>
              <button type="button" onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                min="1"
                value={payForm.amountPaid}
                onChange={(e) => setPayForm({ ...payForm, amountPaid: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-extrabold text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs"
              >
                <option value="NEFT/RTGS">NEFT / RTGS / Bank Transfer</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cheque">Cheque / Demand Draft</option>
                <option value="Cash">Cash Settlement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Transaction Reference #</label>
              <input
                type="text"
                placeholder="e.g. TXN-HDFC-998877"
                value={payForm.paymentRef}
                onChange={(e) => setPayForm({ ...payForm, paymentRef: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20">
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateCustomer} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <span>Add Customer to CRM Directory</span>
              </h3>
              <button type="button" onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white">
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
                  placeholder="33AAACA1001A1Z5"
                  value={customerForm.gstin}
                  onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Billing State</label>
                <select
                  value={customerForm.billingAddress.state}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      billingAddress: { ...customerForm.billingAddress, state: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value="Tamil Nadu">Tamil Nadu (State Code 33)</option>
                  <option value="Maharashtra">Maharashtra (State Code 27)</option>
                  <option value="Karnataka">Karnataka (State Code 29)</option>
                  <option value="Gujarat">Gujarat (State Code 24)</option>
                  <option value="Delhi">Delhi (State Code 07)</option>
                  <option value="Haryana">Haryana (State Code 06)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCustomerModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20">
                Register Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ISSUE CREDIT NOTE */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateCreditNote} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-400" />
                <span>Issue Credit Note (Refund)</span>
              </h3>
              <button type="button" onClick={() => setShowCreditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Reference Invoice</label>
              <select
                value={creditForm.invoiceId}
                onChange={(e) => setCreditForm({ ...creditForm, invoiceId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="">Select Invoice...</option>
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} - {inv.customerId?.companyName} (₹{inv.grandTotal})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Return</label>
              <select
                value={creditForm.reason}
                onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="Product Return">Product Return (Stock Return)</option>
                <option value="Damaged Goods">Damaged Goods on Delivery</option>
                <option value="Pricing Error">Pricing Overcharge Error</option>
                <option value="Discount Adjustment">Post-Sales Discount</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Refund Amount (₹)</label>
              <input
                type="number"
                value={creditForm.totalRefundAmount}
                onChange={(e) => setCreditForm({ ...creditForm, totalRefundAmount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreditModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20">
                Issue Credit Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ISSUE DEBIT NOTE */}
      {showDebitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateDebitNote} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Issue Debit Note (Extra Charge)</span>
              </h3>
              <button type="button" onClick={() => setShowDebitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Reference Invoice</label>
              <select
                value={debitForm.invoiceId}
                onChange={(e) => setDebitForm({ ...debitForm, invoiceId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="">Select Invoice...</option>
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} - {inv.customerId?.companyName} (₹{inv.grandTotal})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Debit Note</label>
              <select
                value={debitForm.reason}
                onChange={(e) => setDebitForm({ ...debitForm, reason: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value="Price Correction">Price Undercharge Correction</option>
                <option value="Additional Freight Charges">Additional Freight / Logistics</option>
                <option value="Late Payment Penalty">Overdue Interest Penalty</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Additional Debit (₹)</label>
              <input
                type="number"
                value={debitForm.totalDebitAmount}
                onChange={(e) => setDebitForm({ ...debitForm, totalDebitAmount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDebitModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20">
                Issue Debit Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GSTBillingHub;
