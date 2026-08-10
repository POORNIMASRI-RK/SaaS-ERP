import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Factory,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Users,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Boxes,
} from 'lucide-react';

const ProductionPlanning = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('orders');

  // BOMs State
  const [boms, setBoms] = useState([]);
  const [loadingBoms, setLoadingBoms] = useState(true);
  const [showBomModal, setShowBomModal] = useState(false);

  // Production Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [items, setItems] = useState([]);
  const [machines, setMachines] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // BOM Form
  const [bomForm, setBomForm] = useState({
    finishedItemId: '',
    finishedQty: 1,
    rawItemId: '',
    quantityRequired: 2,
    wastagePercent: 2,
  });

  // Order Form
  const [orderForm, setOrderForm] = useState({
    bomId: '',
    finishedItemId: '',
    plannedQty: 10,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    machineId: '',
  });

  useEffect(() => {
    fetchItemsAndMachines();
    fetchBOMs();
    fetchProductionOrders();
  }, []);

  const fetchItemsAndMachines = async () => {
    try {
      const itemRes = await API.get('/manufacturing/inventory/items');
      if (itemRes.data.success) {
        setItems(itemRes.data.items);
        if (itemRes.data.items.length > 0) {
          setBomForm((prev) => ({
            ...prev,
            finishedItemId: itemRes.data.items[0]._id,
            rawItemId: itemRes.data.items[0]._id,
          }));
        }
      }

      const machineRes = await API.get('/manufacturing/machines');
      if (machineRes.data.success) {
        setMachines(machineRes.data.machines);
        if (machineRes.data.machines.length > 0) {
          setOrderForm((prev) => ({ ...prev, machineId: machineRes.data.machines[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBOMs = async () => {
    setLoadingBoms(true);
    try {
      const res = await API.get('/manufacturing/production/boms');
      if (res.data.success) {
        setBoms(res.data.boms);
        if (res.data.boms.length > 0) {
          setOrderForm((prev) => ({
            ...prev,
            bomId: res.data.boms[0]._id,
            finishedItemId: res.data.boms[0].finishedItemId?._id || prev.finishedItemId,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBoms(false);
    }
  };

  const fetchProductionOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await API.get('/manufacturing/production/orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCreateBOM = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/production/boms', {
        finishedItemId: bomForm.finishedItemId,
        finishedQty: bomForm.finishedQty,
        components: [
          {
            rawItemId: bomForm.rawItemId,
            quantityRequired: bomForm.quantityRequired,
            wastagePercent: bomForm.wastagePercent,
          },
        ],
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowBomModal(false);
        fetchBOMs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create BOM.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProductionOrder = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/production/orders', {
        bomId: orderForm.bomId,
        finishedItemId: orderForm.finishedItemId,
        plannedQty: orderForm.plannedQty,
        startDate: orderForm.startDate,
        dueDate: orderForm.dueDate,
        assignedMachines: orderForm.machineId ? [orderForm.machineId] : [],
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowOrderModal(false);
        fetchProductionOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create Production Order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, plannedQty) => {
    const confirmMsg =
      status === 'in_progress'
        ? 'Start Production Order? Raw materials will automatically be deducted from inventory.'
        : 'Complete Production Order? Finished Goods inventory will automatically be incremented.';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.patch(`/manufacturing/production/orders/${id}/status`, {
        status,
        producedQty: status === 'completed' ? plannedQty : 0,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchProductionOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Factory className="w-4 h-4" />
              <span>Plant Production Execution Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Production Planning &amp; Work Orders</h1>
            <p className="text-xs text-slate-400 mt-1">
              BOM definition, Work Order scheduling, automatic raw material deduction &amp; finished goods stock auto-increment.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'Production Manager'].includes(user?.role) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOrderModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Work Order</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Work Orders Scheduling &amp; Execution</span>
        </button>

        <button
          onClick={() => setActiveSubTab('boms')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'boms'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bill of Materials (BOM) Master</span>
        </button>
      </div>

      {/* SubTab 1: Work Orders */}
      {activeSubTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-400" />
              <span>Active Work Orders &amp; Material Deduction Engine</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total Work Orders: {orders.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Finished Product</th>
                  <th className="py-3 px-4">Planned Qty</th>
                  <th className="py-3 px-4">Machine Line</th>
                  <th className="py-3 px-4">Cost Est.</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Execution Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingOrders ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-blue-400">
                      Loading production orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500">
                      No Work Orders scheduled yet. Click "Schedule Work Order" to start manufacturing.
                    </td>
                  </tr>
                ) : (
                  orders.map((po) => (
                    <tr key={po._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{po.orderNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{po.finishedItemId?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {po.producedQty} / {po.plannedQty} {po.finishedItemId?.uom}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {po.assignedMachines[0]?.name || 'Line 1 Milling'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{(po.costCalculation?.totalProductionCost || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {po.status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                          </span>
                        ) : po.status === 'in_progress' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20 animate-pulse flex items-center gap-1 w-max">
                            <Play className="w-3.5 h-3.5" /> IN PROGRESS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20 flex items-center gap-1 w-max">
                            <Clock className="w-3.5 h-3.5" /> SCHEDULED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {po.status === 'scheduled' ? (
                          <button
                            onClick={() => handleUpdateStatus(po._id, 'in_progress', po.plannedQty)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-amber-600/20"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Production
                          </button>
                        ) : po.status === 'in_progress' ? (
                          <button
                            onClick={() => handleUpdateStatus(po._id, 'completed', po.plannedQty)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Work Order
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Finished Goods Added
                          </span>
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

      {/* SubTab 2: BOMs */}
      {activeSubTab === 'boms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Bill of Materials (BOM) Multi-Level Definition</span>
            </h2>
            {['Super Admin', 'Company Admin', 'Production Manager'].includes(user?.role) && (
              <button
                onClick={() => setShowBomModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                + Create New BOM
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">BOM Number</th>
                  <th className="py-3 px-4">Finished Product</th>
                  <th className="py-3 px-4">Raw Material Breakdown</th>
                  <th className="py-3 px-4">Est. Material Cost</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingBoms ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-blue-400">
                      Loading BOM definitions...
                    </td>
                  </tr>
                ) : boms.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No BOM definitions created yet. Click "Create New BOM" to define component ratios.
                    </td>
                  </tr>
                ) : (
                  boms.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{b.bomNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{b.finishedItemId?.name}</td>
                      <td className="py-3.5 px-4">
                        {b.components?.map((c, idx) => (
                          <div key={idx} className="font-medium text-slate-300">
                            {c.rawItemId?.name} ({c.quantityRequired} {c.rawItemId?.uom}) + {c.wastagePercent}% waste
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{b.estimatedMaterialCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 uppercase font-mono">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Create Work Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-400" />
                <span>Schedule Work Order</span>
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductionOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Select BOM Definition *</label>
                <select
                  value={orderForm.bomId}
                  onChange={(e) => {
                    const selected = boms.find((b) => b._id === e.target.value);
                    setOrderForm({
                      ...orderForm,
                      bomId: e.target.value,
                      finishedItemId: selected ? selected.finishedItemId?._id : orderForm.finishedItemId,
                    });
                  }}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {boms.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bomNumber} - {b.finishedItemId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Assign Machine Line *</label>
                <select
                  value={orderForm.machineId}
                  onChange={(e) => setOrderForm({ ...orderForm, machineId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {machines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.machineCode}) - {m.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Planned Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={orderForm.plannedQty}
                    onChange={(e) => setOrderForm({ ...orderForm, plannedQty: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Target Due Date</label>
                  <input
                    type="date"
                    value={orderForm.dueDate}
                    onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Scheduling...' : 'Schedule Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create BOM */}
      {showBomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Create Bill of Materials (BOM)</span>
              </h3>
              <button onClick={() => setShowBomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBOM} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Finished Product *</label>
                <select
                  value={bomForm.finishedItemId}
                  onChange={(e) => setBomForm({ ...bomForm, finishedItemId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name} ({i.itemCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Raw Material Component *</label>
                <select
                  value={bomForm.rawItemId}
                  onChange={(e) => setBomForm({ ...bomForm, rawItemId: e.target.value })}
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
                  <label className="text-slate-300 font-semibold">Qty Needed per Product Unit</label>
                  <input
                    type="number"
                    value={bomForm.quantityRequired}
                    onChange={(e) => setBomForm({ ...bomForm, quantityRequired: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Wastage %</label>
                  <input
                    type="number"
                    value={bomForm.wastagePercent}
                    onChange={(e) => setBomForm({ ...bomForm, wastagePercent: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Saving...' : 'Save BOM Definition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;
