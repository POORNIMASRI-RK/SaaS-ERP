import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Barcode,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Layers,
  IndianRupee,
  Boxes,
  X,
  CheckCircle2,
} from 'lucide-react';

const InventoryManagement = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [totalValuation, setTotalValuation] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Warehouses list for stock movement
  const [warehouses, setWarehouses] = useState([]);

  // Item Form
  const [itemForm, setItemForm] = useState({
    itemCode: '',
    name: '',
    category: 'Metals & Alloys',
    itemGroup: 'Raw Materials',
    itemType: 'Raw Material',
    uom: 'Kg',
    minStockLevel: 10,
    reorderLevel: 25,
    reorderQty: 100,
    unitPrice: 50,
    totalStock: 100,
  });

  // Stock Form
  const [stockForm, setStockForm] = useState({
    transactionType: 'Stock In',
    warehouseId: '',
    quantity: 10,
    batchNo: '',
    unitCost: 0,
    notes: '',
  });

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
  }, [typeFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = '/manufacturing/inventory/items?';
      if (search) url += `search=${search}&`;
      if (typeFilter) url += `itemType=${typeFilter}&`;

      const res = await API.get(url);
      if (res.data.success) {
        setItems(res.data.items);
        setTotalValuation(res.data.totalValuation);
        setLowStockCount(res.data.lowStockCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await API.get('/manufacturing/warehouses');
      if (res.data.success) {
        setWarehouses(res.data.warehouses);
        if (res.data.warehouses.length > 0) {
          setStockForm((prev) => ({ ...prev, warehouseId: res.data.warehouses[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/inventory/items', itemForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowItemModal(false);
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenStockModal = (item) => {
    setSelectedItemForStock(item);
    setStockForm((prev) => ({
      ...prev,
      unitCost: item.unitPrice,
    }));
    setShowStockModal(true);
  };

  const handleStockTransaction = async (e) => {
    e.preventDefault();
    if (!selectedItemForStock) return;
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/inventory/transactions', {
        ...stockForm,
        itemId: selectedItemForStock._id,
      });
      if (res.data.success) {
        alert(res.data.message);
        setShowStockModal(false);
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Stock transaction failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Boxes className="w-4 h-4" />
              <span>Plant Stock &amp; Valuation Suite</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Inventory Management System</h1>
            <p className="text-xs text-slate-400 mt-1">
              Item Master, Batch &amp; Lot tracking, Barcode/QR Code generation, low-stock alerts, valuation (FIFO/WAVG).
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'Inventory Manager'].includes(user?.role) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowItemModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Item Master</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Inventory Items</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{items.length}</span>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Stock Valuation</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              ₹{totalValuation.toLocaleString()}
            </span>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Low Stock Alerts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{lowStockCount}</span>
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Item Name, Code, Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none"
          >
            <option value="">All Item Types</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Semi-Finished">Semi-Finished</option>
            <option value="Finished Goods">Finished Goods</option>
            <option value="Consumable">Consumable</option>
            <option value="Spare Part">Spare Part</option>
          </select>

          <button
            onClick={fetchItems}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Type &amp; Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-blue-400">
                    Loading inventory item master...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No inventory items found. Click "Create Item Master" to add raw materials or finished goods.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        <div>
                          {item.name}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.itemCode} | Barcode: {item.barcode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px]">
                        {item.itemType}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.category}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={item.totalStock <= item.reorderLevel ? 'text-rose-400 flex items-center gap-1' : 'text-emerald-400'}>
                        {item.totalStock <= item.reorderLevel && <AlertTriangle className="w-3 h-3" />}
                        {item.totalStock} {item.uom}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {item.reorderLevel} {item.uom}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{item.unitPrice} / {item.uom}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₹{(item.totalStock * item.unitPrice).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenStockModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md shadow-blue-600/20"
                      >
                        <RefreshCw className="w-3 h-3" /> Stock In/Out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Item Master */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>Create Item Master</span>
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.itemCode}
                    onChange={(e) => setItemForm({ ...itemForm, itemCode: e.target.value })}
                    placeholder="e.g. RAW-STL-001"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Alloy Steel Rod"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Item Type *</label>
                  <select
                    value={itemForm.itemType}
                    onChange={(e) => setItemForm({ ...itemForm, itemType: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Semi-Finished">Semi-Finished</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Spare Part">Spare Part</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">UOM *</label>
                  <select
                    value={itemForm.uom}
                    onChange={(e) => setItemForm({ ...itemForm, uom: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Meters">Meters</option>
                    <option value="Liters">Liters</option>
                    <option value="Boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Opening Stock</label>
                  <input
                    type="number"
                    value={itemForm.totalStock}
                    onChange={(e) => setItemForm({ ...itemForm, totalStock: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Reorder Level</label>
                  <input
                    type="number"
                    value={itemForm.reorderLevel}
                    onChange={(e) => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Saving...' : 'Save Item Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock In / Stock Out Transaction */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span>Stock Transaction ({selectedItemForStock?.name})</span>
              </h3>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockTransaction} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Transaction Type *</label>
                <select
                  value={stockForm.transactionType}
                  onChange={(e) => setStockForm({ ...stockForm, transactionType: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  <option value="Stock In">Stock In (Receipt)</option>
                  <option value="Stock Out">Stock Out (Issue)</option>
                  <option value="Adjustment">Stock Adjustment (Audit Count)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Target Warehouse *</label>
                <select
                  value={stockForm.warehouseId}
                  onChange={(e) => setStockForm({ ...stockForm, warehouseId: e.target.value })}
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
                  <label className="text-slate-300 font-semibold">Quantity * ({selectedItemForStock?.uom})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={stockForm.unitCost}
                    onChange={(e) => setStockForm({ ...stockForm, unitCost: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Notes / Purpose</label>
                <input
                  type="text"
                  value={stockForm.notes}
                  onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                  placeholder="e.g. Regular production restock"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Recording...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
