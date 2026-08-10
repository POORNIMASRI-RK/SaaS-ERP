import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Layers, Plus, Clock, Users, Shield, CheckCircle } from 'lucide-react';

const ShiftManagement = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for New Shift
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '17:30',
    gracePeriodMinutes: 15,
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await API.get('/shifts');
      if (res.data.success) {
        setShifts(res.data.shifts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/shifts', form);
      if (res.data.success) {
        setShowModal(false);
        fetchShifts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create shift');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Plant Shift Management &amp; Rotations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Morning, Evening, Night, General, Rotational, and Custom plant shifts.
          </p>
        </div>

        {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Shift</span>
          </button>
        )}
      </div>

      {/* Shifts Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <p className="text-xs text-slate-400">Loading plant shifts...</p>
        ) : (
          shifts.map((s) => (
            <div key={s._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px]">
                  {s.code}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Grace: {s.gracePeriodMinutes} mins</span>
              </div>

              <h3 className="text-base font-bold text-white">{s.name}</h3>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                <span>{s.startTime}</span>
                <span className="text-slate-500">to</span>
                <span>{s.endTime}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Custom Plant Shift</h3>
            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Shift Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Night Overtime Shift"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Shift Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. NIGHT_OT"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">End Time *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
