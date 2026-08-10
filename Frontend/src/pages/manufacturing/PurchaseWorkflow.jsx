import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  Building,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  IndianRupee,
  Layers,
} from 'lucide-react';

const PurchaseWorkflow = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('prs');

  // Purchase Requests state
  const [prs, setPrs] = useState([]);
  const [loadingPrs, setLoadingPrs] = useState(true);
  const [showPrModal, setShowPrModal] = useState(false);

  // Purchase Orders state
  const [pos, setPos] = useState([]);
  const [loadingPos, setLoadingPos] = useState(true);
  const [showPoModal, setShowPoModal] = useState(false);

  // GRN state
  const [grns, setGrns] = useState([]);
  const [loadingGrns, setLoadingGrns] = useState(true);
  const [showGrnModal, setShowGrnModal] = useState(false);

  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // PR Form
  const [prForm, setPrForm] = useState({
    itemId: '',
    requestedQty: 50,
    estimatedUnitPrice: 45,
    department: 'Production Floor',
  });

  // PO Form
  const [poForm, setPoForm] = useState({
    prId: '',
    vendorId: '',
    itemId: '',
    quantity: 50,
    unitPrice: 45,
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // GRN Form
  const [grnForm, setGrnForm] = useState({
    poId: '',
    vendorId: '',
    warehouseId: '',
    itemId: '',
    qtyReceived: 50,
    qtyAccepted: 50,
    qtyRejected: 0,
    batchNo: `BATCH-${Date.now().toString().slice(-4)}`,
    qcNotes: 'All components passed tensile & dimension quality checks.',
  });

  useEffect(() => {
    fetchItemsAndVendors();
    fetchPRs();
    fetchPOs();
    fetchGRNs();
  }, []);

  const fetchItemsAndVendors = async () => {
    try {
      const itemRes = await API.get('/manufacturing/inventory/items');
      if (itemRes.data.success) {
        setItems(itemRes.data.items);
        if (itemRes.data.items.length > 0) {
          setPrForm((prev) => ({ ...prev, itemId: itemRes.data.items[0]._id }));
          setPoForm((prev) => ({ ...prev, itemId: itemRes.data.items[0]._id, unitPrice: itemRes.data.items[0].unitPrice }));
          setGrnForm((prev) => ({ ...prev, itemId: itemRes.data.items[0]._id }));
        }
      }

      const vendorRes = await API.get('/manufacturing/vendors');
      if (vendorRes.data.success) {
        setVendors(vendorRes.data.vendors);
        if (vendorRes.data.vendors.length > 0) {
          setPoForm((prev) => ({ ...prev, vendorId: vendorRes.data.vendors[0]._id }));
          setGrnForm((prev) => ({ ...prev, vendorId: vendorRes.data.vendors[0]._id }));
        }
      }

      const whRes = await API.get('/manufacturing/warehouses');
      if (whRes.data.success) {
        setWarehouses(whRes.data.warehouses);
        if (whRes.data.warehouses.length > 0) {
          setGrnForm((prev) => ({ ...prev, warehouseId: whRes.data.warehouses[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPRs = async () => {
    setLoadingPrs(true);
    try {
      const res = await API.get('/manufacturing/purchase/requests');
      if (res.data.success) setPrs(res.data.prs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrs(false);
    }
  };

  const fetchPOs = async () => {
    setLoadingPos(true);
    try {
      const res = await API.get('/manufacturing/purchase/orders');
      if (res.data.success) setPos(res.data.pos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPos(false);
    }
  };

  const fetchGRNs = async () => {
    setLoadingGrns(true);
    try {
      const res = await API.get('/manufacturing/purchase/grn');
      if (res.data.success) setGrns(res.data.grns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGrns(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/purchase/requests', {
        department: prForm.department,
        items: [
          {
            itemId: prForm.itemId,
            requestedQty: prForm.requestedQty,
            estimatedUnitPrice: prForm.estimatedUnitPrice,
          },
        ],
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowPrModal(false);
        fetchPRs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PR.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePR = async (id, action) => {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this Purchase Request?`)) return;
    try {
      const res = await API.patch(`/manufacturing/purchase/requests/${id}/approve`, { action });
      if (res.data.success) {
        alert(res.data.message);
        fetchPRs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/purchase/orders', {
        prId: poForm.prId || undefined,
        vendorId: poForm.vendorId,
        items: [
          {
            itemId: poForm.itemId,
            quantity: poForm.quantity,
            unitPrice: poForm.unitPrice,
            taxRate: 18,
          },
        ],
        expectedDeliveryDate: poForm.expectedDeliveryDate,
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowPoModal(false);
        fetchPOs();
        fetchPRs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create PO.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (poId) => {
    if (!window.confirm('Verify vendor invoice and process payment disbursement?')) return;
    setActionLoading(true);
    try {
      const res = await API.patch(`/manufacturing/purchase/orders/${poId}/payment`, {
        paymentRef: `PAY-${Date.now().toString().slice(-6)}`,
        notes: 'Vendor invoice verified and paid by Finance Accounts.',
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchPOs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/purchase/grn', {
        poId: grnForm.poId,
        vendorId: grnForm.vendorId,
        warehouseId: grnForm.warehouseId,
        qcNotes: grnForm.qcNotes,
        receivedItems: [
          {
            itemId: grnForm.itemId,
            qtyReceived: grnForm.qtyReceived,
            qtyAccepted: grnForm.qtyAccepted,
            qtyRejected: grnForm.qtyRejected,
            batchNo: grnForm.batchNo,
          },
        ],
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowGrnModal(false);
        fetchGRNs();
        fetchPOs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'GRN Quality Inspection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <FileCheck className="w-4 h-4" />
              <span>5-Stage Procurement Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Purchase Workflow &amp; Quality Inspection</h1>
            <p className="text-xs text-slate-400 mt-1">
              PR approval $\rightarrow$ PO issuance $\rightarrow$ Vendor GRN receiving $\rightarrow$ Quality check $\rightarrow$ Automatic inventory increment.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'Purchase Manager'].includes(user?.role) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPrModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Purchase Request (PR)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('prs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'prs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Purchase Requests (PR)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'pos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>2. Purchase Orders (PO)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grns')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'grns'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. GRN &amp; Quality Inspection</span>
        </button>
      </div>

      {/* SubTab 1: PRs */}
      {activeSubTab === 'prs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Purchase Requisitions &amp; Manager Approval Queue</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total PRs: {prs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PR Number</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Items &amp; Quantity</th>
                  <th className="py-3 px-4">Est. Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingPrs ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-blue-400">
                      Loading purchase requests...
                    </td>
                  </tr>
                ) : prs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No Purchase Requests created yet. Click "Create Purchase Request" to request materials.
                    </td>
                  </tr>
                ) : (
                  prs.map((pr) => (
                    <tr key={pr._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{pr.prNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{pr.requestedBy?.name}</div>
                        <div className="text-[10px] text-slate-400">{pr.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {pr.items?.map((it, idx) => (
                          <div key={idx} className="font-medium text-slate-300">
                            {it.itemId?.name} ({it.requestedQty} {it.itemId?.uom})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{pr.totalEstimatedCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {pr.status === 'approved' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                          </span>
                        ) : pr.status === 'po_generated' ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20 flex items-center gap-1 w-max">
                            <Truck className="w-3.5 h-3.5" /> PO GENERATED
                          </span>
                        ) : pr.status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold text-[10px] border border-rose-500/20 flex items-center gap-1 w-max">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20 animate-pulse flex items-center gap-1 w-max">
                            <Clock className="w-3.5 h-3.5" /> PENDING MANAGER
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {pr.status === 'pending_approval' ? (
                          <>
                            <button
                              onClick={() => handleApprovePR(pr._id, 'approve')}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-600/20"
                            >
                              Approve PR
                            </button>
                            <button
                              onClick={() => handleApprovePR(pr._id, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        ) : pr.status === 'approved' ? (
                          <button
                            onClick={() => {
                              setPoForm((prev) => ({
                                ...prev,
                                prId: pr._id,
                                itemId: pr.items[0]?.itemId?._id || prev.itemId,
                                quantity: pr.items[0]?.requestedQty || 50,
                              }));
                              setShowPoModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" /> Issue PO
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Processed</span>
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

      {/* SubTab 2: POs */}
      {activeSubTab === 'pos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              <span>Issued Purchase Orders (PO)</span>
            </h2>
            {['Super Admin', 'Company Admin', 'Purchase Manager'].includes(user?.role) && (
              <button
                onClick={() => setShowPoModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                + Issue Direct PO
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingPos ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-blue-400">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : pos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No Purchase Orders issued yet.
                    </td>
                  </tr>
                ) : (
                  pos.map((po) => (
                    <tr key={po._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{po.poNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{po.vendorId?.companyName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{po.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20 uppercase font-mono">
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {['Super Admin', 'Company Admin', 'Finance'].includes(user?.role) && po.status !== 'paid' && (
                          <button
                            onClick={() => handleRecordPayment(po._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md"
                          >
                            <IndianRupee className="w-3.5 h-3.5" /> Verify &amp; Pay Invoice
                          </button>
                        )}

                        {po.status !== 'received' && po.status !== 'paid' && ['Super Admin', 'Company Admin', 'Purchase Manager', 'Warehouse Manager'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              setGrnForm((prev) => ({
                                ...prev,
                                poId: po._id,
                                vendorId: po.vendorId?._id || prev.vendorId,
                                itemId: po.items[0]?.itemId?._id || prev.itemId,
                                qtyReceived: po.items[0]?.quantity || 50,
                                qtyAccepted: po.items[0]?.quantity || 50,
                              }));
                              setShowGrnModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Perform GRN &amp; QC
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

      {/* SubTab 3: GRNs */}
      {activeSubTab === 'grns' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Goods Received Notes (GRN) &amp; Quality Checks</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">GRN Number</th>
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Quality Status</th>
                  <th className="py-3 px-4">Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingGrns ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-blue-400">
                      Loading GRNs...
                    </td>
                  </tr>
                ) : grns.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No GRN inspections logged yet.
                    </td>
                  </tr>
                ) : (
                  grns.map((g) => (
                    <tr key={g._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{g.grnNumber}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-400">{g.poId?.poNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{g.vendorId?.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{g.warehouseId?.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 uppercase font-mono flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {g.qualityStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{g.inspectedBy?.name || 'QC Lead'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Create PR */}
      {showPrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Create Purchase Requisition (PR)</span>
              </h3>
              <button onClick={() => setShowPrModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Target Raw Material / Component *</label>
                <select
                  value={prForm.itemId}
                  onChange={(e) => {
                    const selected = items.find((i) => i._id === e.target.value);
                    setPrForm({
                      ...prForm,
                      itemId: e.target.value,
                      estimatedUnitPrice: selected ? selected.unitPrice : 45,
                    });
                  }}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.itemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Requested Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prForm.requestedQty}
                    onChange={(e) => setPrForm({ ...prForm, requestedQty: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Est. Unit Price (₹)</label>
                  <input
                    type="number"
                    value={prForm.estimatedUnitPrice}
                    onChange={(e) => setPrForm({ ...prForm, estimatedUnitPrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Submitting...' : 'Submit PR for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create PO */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Issue Purchase Order (PO)</span>
              </h3>
              <button onClick={() => setShowPoModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Select Vendor Supplier *</label>
                <select
                  value={poForm.vendorId}
                  onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.companyName} ({v.vendorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Select Item *</label>
                <select
                  value={poForm.itemId}
                  onChange={(e) => setPoForm({ ...poForm, itemId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.itemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Quantity</label>
                  <input
                    type="number"
                    value={poForm.quantity}
                    onChange={(e) => setPoForm({ ...poForm, quantity: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Agreed Unit Price (₹)</label>
                  <input
                    type="number"
                    value={poForm.unitPrice}
                    onChange={(e) => setPoForm({ ...poForm, unitPrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Issuing PO...' : 'Issue PO & Dispatch to Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Perform GRN & QC */}
      {showGrnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Perform GRN Receiving &amp; Quality Check (QC)</span>
              </h3>
              <button onClick={() => setShowGrnModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGRN} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Receiving Warehouse *</label>
                <select
                  value={grnForm.warehouseId}
                  onChange={(e) => setGrnForm({ ...grnForm, warehouseId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold text-emerald-400">Qty Accepted (Stock In)</label>
                  <input
                    type="number"
                    required
                    value={grnForm.qtyAccepted}
                    onChange={(e) => setGrnForm({ ...grnForm, qtyAccepted: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold text-rose-400">Qty Rejected (Scrap/Return)</label>
                  <input
                    type="number"
                    value={grnForm.qtyRejected}
                    onChange={(e) => setGrnForm({ ...grnForm, qtyRejected: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Quality Inspection Notes</label>
                <textarea
                  rows="2"
                  value={grnForm.qcNotes}
                  onChange={(e) => setGrnForm({ ...grnForm, qcNotes: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGrnModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
                >
                  {actionLoading ? 'Processing QC...' : 'Complete QC Pass & Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseWorkflow;
