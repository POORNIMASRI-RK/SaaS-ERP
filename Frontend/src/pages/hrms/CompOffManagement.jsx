import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Award, Plus, Calendar, CheckCircle, Users } from 'lucide-react';

const CompOffManagement = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Allocation Modal
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    workDate: new Date().toISOString().split('T')[0],
    creditDays: 1.0,
    reason: 'Worked on weekend / plant emergency shift',
  });

  useEffect(() => {
    fetchCredits();
    if (['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(user?.role)) {
      fetchEmployees();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const res = await API.get('/compoff');
      if (res.data.success) {
        setCredits(res.data.credits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/users?limit=100');
      if (res.data.success) {
        setEmployees(res.data.users);
        if (res.data.users.length > 0) {
          setForm((prev) => ({ ...prev, employeeId: res.data.users[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/compoff/allocate', form);
      if (res.data.success) {
        alert(res.data.message);
        setShowModal(false);
        fetchCredits();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Compensatory Off (Comp Off) Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rules and credit allocations for employees working on Saturdays, Sundays, or Public Holidays.
          </p>
        </div>

        {['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(user?.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Comp Off Credit</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Comp Off Earned Credit Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Weekend/Holiday Date</th>
                <th className="py-3.5 px-4">Credits Earned</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">Loading ledger...</td>
                </tr>
              ) : credits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">No Comp Off credits allocated yet.</td>
                </tr>
              ) : (
                credits.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {c.employeeId?.name}
                      <div className="text-[10px] text-slate-400 font-mono">{c.employeeId?.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {new Date(c.workDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                      +{c.creditDays} Day(s)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {new Date(c.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{c.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Allocate Comp Off Credit</h3>
            <form onSubmit={handleAllocate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Select Employee *</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Worked Weekend/Holiday Date *</span>
                  <span className="text-[10px] text-blue-400 font-normal">Click to pick</span>
                </label>
                <input
                  type="date"
                  required
                  style={{ colorScheme: 'dark' }}
                  onClick={(e) => e.target.showPicker?.()}
                  value={form.workDate}
                  onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Credit Days</label>
                <select
                  value={form.creditDays}
                  onChange={(e) => setForm({ ...form, creditDays: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value={1.0}>1.0 Full Day</option>
                  <option value={0.5}>0.5 Half Day</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Reason *</label>
                <input
                  type="text"
                  required
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                >
                  Allocate Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompOffManagement;
