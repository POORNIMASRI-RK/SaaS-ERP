import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  Boxes,
  Layers,
  User,
  MapPin,
  CheckCircle2,
  RefreshCw,
  X,
  PieChart,
} from 'lucide-react';

const WarehouseManagement = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    code: '',
    name: '',
    location: '',
    capacitySqFt: 10000,
    status: 'active',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/manufacturing/warehouses');
      if (res.data.success) {
        setWarehouses(res.data.warehouses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/warehouses', form);
      if (res.data.success) {
        alert(res.data.message);
        setShowModal(false);
        fetchWarehouses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save warehouse.');
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
              <Building2 className="w-4 h-4" />
              <span>Multi-Facility Storage Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Warehouse Management System</h1>
            <p className="text-xs text-slate-400 mt-1">
              Rack &amp; bin capacity tracking, warehouse locations, and inter-facility stock transfers.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'Warehouse Manager'].includes(user?.role) && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Warehouse</span>
            </button>
          )}
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-blue-400">
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No warehouses registered yet. Click "Add New Warehouse" to set up your primary facility.
          </div>
        ) : (
          warehouses.map((wh) => (
            <div
              key={wh._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px] uppercase font-mono">
                    {wh.code}
                  </span>
                  <h2 className="text-lg font-extrabold text-white mt-1">{wh.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{wh.location || 'Main Storage Hub'}</span>
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Floor Area</span>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">
                    {wh.capacitySqFt.toLocaleString()} Sq. Ft.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Manager</span>
                  <p className="text-xs font-bold text-blue-400 mt-1 truncate">
                    {wh.managerId?.name || 'Plant Supervisor'}
                  </p>
                </div>
              </div>

              {/* Racks & Bins Visualizer */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Rack &amp; Bin Capacity Distribution</span>
                </span>

                <div className="space-y-2">
                  {wh.racks?.map((rack, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-semibold">
                        <span>{rack.rackNo}</span>
                        <span className="font-mono text-[11px]">
                          {rack.occupied} / {rack.capacity} Units
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-amber-400 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (rack.occupied / (rack.capacity || 1)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Warehouse */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Add Warehouse Facility</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Warehouse Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. WH-DETROIT-01"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Detroit Metals Storage"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Location / Address</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Building 4, Detroit Plant"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Floor Capacity (Sq. Ft.)</label>
                <input
                  type="number"
                  value={form.capacitySqFt}
                  onChange={(e) => setForm({ ...form, capacitySqFt: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
