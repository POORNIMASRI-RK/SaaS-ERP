import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, IndianRupee, Plus, Check, X, FileText, AlertCircle, Award } from 'lucide-react';

const LoansAndReimbursements = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans');

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const [loanForm, setLoanForm] = useState({
    type: 'Loan',
    principalAmount: 20000,
    emiAmount: 5000,
    tenureMonths: 4,
    reason: 'Emergency medical expenses or home appliance purchase',
  });

  const [claimForm, setClaimForm] = useState({
    claimType: 'Travel',
    amount: 1500,
    description: 'Client meeting travel & fuel expense',
    receiptUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loanRes, claimRes] = await Promise.all([
        API.get('/payroll/loans'),
        API.get('/payroll/reimbursements'),
      ]);

      if (loanRes.data.success) setLoans(loanRes.data.loans);
      if (claimRes.data.success) setClaims(claimRes.data.claims);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/payroll/loans', loanForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowLoanModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/payroll/reimbursements', claimForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowClaimModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleLoanStatusUpdate = async (id, status) => {
    try {
      const res = await API.patch(`/payroll/loans/${id}/status`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update loan status');
    }
  };

  const handleClaimStatusUpdate = async (id, status) => {
    try {
      const res = await API.patch(`/payroll/reimbursements/${id}/status`, { status });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Loans, Salary Advances &amp; Reimbursement Claims</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apply for employee loans with monthly payroll EMI recovery and submit travel/medical reimbursement claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLoanModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Loan / Advance</span>
          </button>

          <button
            onClick={() => setShowClaimModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'loans' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Employee Loans &amp; Salary Advances ({loans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'claims' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Travel &amp; Medical Expense Claims ({claims.length})</span>
        </button>
      </div>

      {/* Tab 1: Loans & Advances */}
      {activeTab === 'loans' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Loans Ledger &amp; EMI Recovery Status</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Principal Amount</th>
                  <th className="py-3.5 px-4">Monthly EMI</th>
                  <th className="py-3.5 px-4">Remaining Balance</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-slate-500 font-sans">
                      No loan applications found.
                    </td>
                  </tr>
                ) : (
                  loans.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        {l.employeeId?.name}
                        <div className="text-[10px] text-slate-400 font-mono">{l.employeeId?.employeeId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-amber-400">{l.type}</td>
                      <td className="py-3.5 px-4 font-bold text-white">₹{l.principalAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">₹{l.emiAmount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-300">₹{l.remainingBalance?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate">{l.reason}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            l.status === 'active' || l.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : l.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <td className="py-3.5 px-4 text-right font-sans space-x-1">
                          {l.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleLoanStatusUpdate(l._id, 'active')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleLoanStatusUpdate(l._id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reimbursement Claims */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Reimbursement Claims Queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Claim Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-500 font-sans">
                      No reimbursement claims submitted yet.
                    </td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        {c.employeeId?.name}
                        <div className="text-[10px] text-slate-400 font-mono">{c.employeeId?.employeeId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-blue-400">{c.claimType}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">₹{c.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-slate-300">{new Date(c.claimDate).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate">{c.description}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            c.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : c.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <td className="py-3.5 px-4 text-right font-sans space-x-1">
                          {c.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleClaimStatusUpdate(c._id, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleClaimStatusUpdate(c._id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Apply for Loan */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Apply for Employee Loan / Advance</h3>

            <form onSubmit={handleLoanSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Type</label>
                <select
                  value={loanForm.type}
                  onChange={(e) => setLoanForm({ ...loanForm, type: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="Loan">Employee Loan</option>
                  <option value="Salary Advance">Salary Advance</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Principal Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={loanForm.principalAmount}
                  onChange={(e) => setLoanForm({ ...loanForm, principalAmount: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    required
                    value={loanForm.emiAmount}
                    onChange={(e) => setLoanForm({ ...loanForm, emiAmount: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold">Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={loanForm.tenureMonths}
                    onChange={(e) => setLoanForm({ ...loanForm, tenureMonths: parseInt(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Reason *</label>
                <input
                  type="text"
                  required
                  value={loanForm.reason}
                  onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Submit Reimbursement */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Submit Reimbursement Claim</h3>

            <form onSubmit={handleClaimSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Claim Type</label>
                <select
                  value={claimForm.claimType}
                  onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="Travel">Travel &amp; Fuel</option>
                  <option value="Medical">Medical Expenses</option>
                  <option value="Food">Food &amp; Client Entertainment</option>
                  <option value="Internet & Mobile">Internet &amp; Mobile Bill</option>
                  <option value="Production Tools">Production Tools &amp; Hardware</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Claim Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: parseFloat(e.target.value) })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Description *</label>
                <input
                  type="text"
                  required
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansAndReimbursements;
