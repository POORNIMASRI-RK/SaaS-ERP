import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Layers, Plus, IndianRupee, Edit2, Users, Check, AlertCircle, TrendingUp } from 'lucide-react';

const SalaryStructures = () => {
  const { user } = useAuth();
  const [structures, setStructures] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    annualCtc: 600000,
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    panNumber: '',
    pfUanNumber: '',
    esiNumber: '',
    revisionReason: 'Annual CTC Assignment / Increment',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [structRes, salRes, userRes] = await Promise.all([
        API.get('/payroll/structures'),
        API.get('/payroll/salaries'),
        API.get('/users?limit=100'),
      ]);

      if (structRes.data.success) setStructures(structRes.data.structures);
      if (salRes.data.success) setSalaries(salRes.data.salaries);
      if (userRes.data.success) {
        setUsers(userRes.data.users);
        if (userRes.data.users.length > 0) {
          setAssignForm((prev) => ({ ...prev, employeeId: userRes.data.users[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/payroll/salaries/assign', assignForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowAssignModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Salary Structures &amp; CTC Component Breakups</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define basic, HRA, DA percentage rules and assign annual CTCs to manufacturing plant employees.
          </p>
        </div>

        {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Assign / Revise Employee CTC</span>
          </button>
        )}
      </div>

      {/* Reusable Salary Structure Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Active Salary Component Templates</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {structures.map((st) => (
            <div key={st._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">{st.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {st.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">{st.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-sans font-bold">Basic %</span>
                  <p className="text-sm font-bold text-blue-400">{st.basicPercent}%</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-sans font-bold">HRA %</span>
                  <p className="text-sm font-bold text-emerald-400">{st.hraPercent}%</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-sans font-bold">DA %</span>
                  <p className="text-sm font-bold text-amber-400">{st.daPercent}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee CTC Assignment Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Employee Assigned Salary Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Annual CTC</th>
                <th className="py-3.5 px-4">Monthly Basic</th>
                <th className="py-3.5 px-4">HRA + DA</th>
                <th className="py-3.5 px-4">Bank Details</th>
                <th className="py-3.5 px-4">PF UAN / ESI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">
                    No assigned employee salaries found. Click "Assign / Revise Employee CTC" to add one!
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors font-mono">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {s.employeeId?.name}
                      <div className="text-[10px] text-slate-400 font-mono">
                        {s.employeeId?.employeeId} ({s.employeeId?.role})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-sm">
                      ₹{s.annualCtc?.toLocaleString('en-IN')} /yr
                      <div className="text-[10px] text-slate-400">(₹{s.monthlyCtc?.toLocaleString('en-IN')}/mo)</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{s.basicSalary?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      ₹{(s.hra + s.da).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans">
                      {s.bankName ? (
                        <>
                          <span className="text-white font-semibold">{s.bankName}</span>
                          <div className="text-[10px] font-mono">{s.bankAccountNumber}</div>
                        </>
                      ) : (
                        'Not Configured'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      UAN: {s.pfUanNumber || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign / Revise CTC */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Assign or Revise Employee CTC</h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Select Employee *</label>
                <select
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.employeeId} - {u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Annual CTC (₹) *</label>
                <input
                  type="number"
                  required
                  value={assignForm.annualCtc}
                  onChange={(e) => setAssignForm({ ...assignForm, annualCtc: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Bank Name</label>
                  <input
                    type="text"
                    value={assignForm.bankName}
                    onChange={(e) => setAssignForm({ ...assignForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC or SBI"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Account Number</label>
                  <input
                    type="text"
                    value={assignForm.bankAccountNumber}
                    onChange={(e) => setAssignForm({ ...assignForm, bankAccountNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Revision Reason / Note</label>
                <input
                  type="text"
                  value={assignForm.revisionReason}
                  onChange={(e) => setAssignForm({ ...assignForm, revisionReason: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save Salary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructures;
