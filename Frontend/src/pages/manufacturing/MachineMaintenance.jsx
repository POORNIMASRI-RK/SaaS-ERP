import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Cpu,
  ShieldCheck,
  Calendar,
  X,
  UserCheck,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

const MachineMaintenance = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('machines');

  const [machines, setMachines] = useState([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [showMachineModal, setShowMachineModal] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // Machine Form
  const [machineForm, setMachineForm] = useState({
    machineCode: '',
    name: '',
    category: 'CNC Machining',
    model: 'Haas VMC-850',
    serialNumber: '',
    location: 'Shopfloor Line 1',
    status: 'operational',
  });

  // Log Form
  const [logForm, setLogForm] = useState({
    machineId: '',
    type: 'preventive',
    problemDescription: '',
    maintenanceCost: 250,
  });

  useEffect(() => {
    fetchMachines();
    fetchLogs();
  }, []);

  const fetchMachines = async () => {
    setLoadingMachines(true);
    try {
      const res = await API.get('/manufacturing/machines');
      if (res.data.success) {
        setMachines(res.data.machines);
        if (res.data.machines.length > 0) {
          setLogForm((prev) => ({ ...prev, machineId: res.data.machines[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMachines(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await API.get('/manufacturing/maintenance/logs');
      if (res.data.success) setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveMachine = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/machines', machineForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowMachineModal(false);
        fetchMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save machine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/maintenance/logs', logForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowLogModal(false);
        fetchLogs();
        fetchMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log maintenance.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMaintenance = async (id) => {
    if (!window.confirm('Complete maintenance service? Machine will be restored to OPERATIONAL status.')) return;
    try {
      const res = await API.patch(`/manufacturing/maintenance/logs/${id}/complete`);
      if (res.data.success) {
        alert(res.data.message);
        fetchLogs();
        fetchMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Service completion failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Plant Equipment &amp; Asset Health Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Machine Maintenance &amp; Breakdown Tracking</h1>
            <p className="text-xs text-slate-400 mt-1">
              Preventive/corrective service logs, machine health status, breakdown ticket dispatcher &amp; production alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {['Super Admin', 'Company Admin', 'Maintenance Manager', 'Production Manager', 'Team Leader'].includes(user?.role) && (
              <button
                onClick={() => setShowLogModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Log Maintenance / Breakdown</span>
              </button>
            )}

            {['Super Admin', 'Company Admin', 'Maintenance Manager'].includes(user?.role) && (
              <button
                onClick={() => setShowMachineModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Machine</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('machines')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'machines'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Machine Master Directory</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'logs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance Service &amp; Breakdown Tickets</span>
        </button>
      </div>

      {/* SubTab 1: Machines */}
      {activeSubTab === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMachines ? (
            <div className="col-span-3 py-12 text-center text-blue-400">
              Loading machine equipment master...
            </div>
          ) : machines.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              No machines registered. Click "Add Machine" to register plant machinery.
            </div>
          ) : (
            machines.map((m) => (
              <div
                key={m._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px] uppercase font-mono">
                      {m.machineCode}
                    </span>
                    <h2 className="text-base font-extrabold text-white mt-1">{m.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{m.location}</p>
                  </div>

                  {m.status === 'operational' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> OPERATIONAL
                    </span>
                  ) : m.status === 'breakdown' ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px] animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> BREAKDOWN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 text-[10px]">
                      MAINTENANCE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Category / Model</span>
                    <p className="text-xs font-bold text-white mt-0.5 truncate">{m.model || m.category}</p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Next Service</span>
                    <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                      {m.nextServiceDate ? new Date(m.nextServiceDate).toLocaleDateString() : 'Scheduled'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SubTab 2: Maintenance Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Maintenance &amp; Breakdown Tickets Queue</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total Tickets: {logs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Problem Description</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingLogs ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-blue-400">
                      Loading maintenance tickets...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500">
                      No maintenance tickets logged.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{log.logNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{log.machineId?.name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                            log.type === 'breakdown'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {log.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{log.problemDescription}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{log.maintenanceCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {log.status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20 animate-pulse flex items-center gap-1 w-max">
                            <Clock className="w-3.5 h-3.5" /> IN PROGRESS
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {log.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteMaintenance(log._id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Service
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

      {/* Modal 1: Add Machine */}
      {showMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>Register Machine Equipment</span>
              </h3>
              <button onClick={() => setShowMachineModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Machine Code *</label>
                  <input
                    type="text"
                    required
                    value={machineForm.machineCode}
                    onChange={(e) => setMachineForm({ ...machineForm, machineCode: e.target.value })}
                    placeholder="e.g. CNC-VMC-850"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Machine Name *</label>
                  <input
                    type="text"
                    required
                    value={machineForm.name}
                    onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                    placeholder="e.g. 5-Axis Milling Center"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Location / Shopfloor Line</label>
                <input
                  type="text"
                  value={machineForm.location}
                  onChange={(e) => setMachineForm({ ...machineForm, location: e.target.value })}
                  placeholder="e.g. Shopfloor Line 1"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMachineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Registering...' : 'Register Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Maintenance */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Log Maintenance Service / Breakdown</span>
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Select Machine Equipment *</label>
                <select
                  value={logForm.machineId}
                  onChange={(e) => setLogForm({ ...logForm, machineId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {machines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.machineCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Maintenance Type *</label>
                <select
                  value={logForm.type}
                  onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  <option value="preventive">Preventive Maintenance (Scheduled)</option>
                  <option value="corrective">Corrective Maintenance</option>
                  <option value="breakdown">Breakdown (Immediate Production Alert)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Problem / Service Description *</label>
                <textarea
                  required
                  rows="3"
                  value={logForm.problemDescription}
                  onChange={(e) => setLogForm({ ...logForm, problemDescription: e.target.value })}
                  placeholder="e.g. Spindle overheating, hydraulic seal replacement..."
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
                >
                  {actionLoading ? 'Logging...' : 'Dispatch Maintenance Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineMaintenance;
