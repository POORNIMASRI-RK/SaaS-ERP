import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  IndianRupee,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  Lock,
  Check,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

const PayrollProcessing = () => {
  const { user } = useAuth();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await API.get('/payroll/batches');
      if (res.data.success) {
        setBatches(res.data.batches);
        if (res.data.batches.length > 0) {
          selectBatch(res.data.batches[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectBatch = async (batch) => {
    setSelectedBatch(batch);
    setRecordsLoading(true);
    try {
      const res = await API.get(`/payroll/batches/${batch._id}/records`);
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecordsLoading(false);
    }
  };

  // STEP 1: HR Process Payroll & Calculate Salaries
  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/payroll/batches/generate', { month: parseInt(month), year: parseInt(year) });
      if (res.data.success) {
        alert(res.data.message);
        fetchBatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payroll batch');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Company Admin Approve Payroll
  const handleApproveBatch = async () => {
    if (!selectedBatch) return;
    if (!window.confirm(`APPROVE PAYROLL BATCH for ${selectedBatch.batchName}? This sends the batch to Finance for salary payment.`)) return;

    try {
      const res = await API.patch(`/payroll/batches/${selectedBatch._id}/approve`);
      if (res.data.success) {
        alert(res.data.message);
        fetchBatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  // STEP 3: Finance Disburse Salary & Mark Paid
  const handleDisburseBatch = async () => {
    if (!selectedBatch) return;
    if (!window.confirm(`DISBURSE & PAY SALARIES for ${selectedBatch.batchName}? This credits all employee accounts and unlocks payslips.`)) return;

    try {
      const res = await API.patch(`/payroll/batches/${selectedBatch._id}/disburse`);
      if (res.data.success) {
        alert(res.data.message);
        fetchBatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment disbursement failed');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>3-Step Payroll Execution &amp; Approval Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            HR Processes &amp; Calculates Salaries $\rightarrow$ Company Admin Approves $\rightarrow$ Finance Disburses &amp; Marks Paid.
          </p>
        </div>

        {/* STEP 1: HR Month Picker & Process Button */}
        {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
          <form onSubmit={handleGenerateBatch} className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold p-2 rounded-lg border border-slate-800"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold p-2 rounded-lg border border-slate-800"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Processing...' : '1. HR Process Payroll'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Main Grid: Batches List Sidebar + Itemized Payroll Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Batches List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payroll Batches</h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {batches.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No batches found.</p>
            ) : (
              batches.map((b) => (
                <div
                  key={b._id}
                  onClick={() => selectBatch(b)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedBatch?._id === b._id
                      ? 'bg-blue-950/60 border-blue-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{b.batchName}</span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                        b.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : b.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {b.status === 'paid' ? 'PAID' : b.status === 'approved' ? 'APPROVED' : 'PROCESSED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-2">
                    <span className="text-slate-400">{b.totalEmployees} Employees</span>
                    <span className="text-emerald-400 font-extrabold">₹{b.totalNetSalary?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Itemized Payroll Records */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {selectedBatch ? (
            <>
              {/* Batch Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedBatch.batchName}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${
                        selectedBatch.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : selectedBatch.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {selectedBatch.status === 'paid'
                        ? '3. SALARIES PAID & DISBURSED'
                        : selectedBatch.status === 'approved'
                        ? '2. APPROVED BY ADMIN (READY FOR FINANCE PAYMENT)'
                        : '1. HR PROCESSED (AWAITING ADMIN APPROVAL)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Total Gross: <span className="text-white font-mono font-bold">₹{selectedBatch.totalGrossSalary?.toLocaleString('en-IN')}</span> | Total Deductions: <span className="text-rose-400 font-mono font-bold">₹{selectedBatch.totalDeductions?.toLocaleString('en-IN')}</span> | Total Net Pay: <span className="text-emerald-400 font-mono font-extrabold">₹{selectedBatch.totalNetSalary?.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* STEP 2: Company Admin Approve Button */}
                  {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && selectedBatch.status === 'processed' && (
                    <button
                      onClick={handleApproveBatch}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>2. Approve Payroll</span>
                    </button>
                  )}

                  {/* STEP 3: Finance / Accounts Disburse Salary Button */}
                  {['Super Admin', 'Company Admin', 'Finance'].includes(user?.role) && selectedBatch.status !== 'paid' && (
                    <button
                      onClick={handleDisburseBatch}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all border border-emerald-400/30 animate-pulse"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>3. Finance Pay Salary</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Employee</th>
                      <th className="py-3 px-3">Days / LOP</th>
                      <th className="py-3 px-3">OT Hrs</th>
                      <th className="py-3 px-3">Basic + HRA</th>
                      <th className="py-3 px-3">Gross Salary</th>
                      <th className="py-3 px-3">PF + ESI + Tax</th>
                      <th className="py-3 px-3">Loan EMI</th>
                      <th className="py-3 px-3 font-extrabold text-emerald-400">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                    {recordsLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          Loading itemized payslip records...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-500">
                          No payroll records found for this batch.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-3 font-sans font-semibold text-white">
                            {r.employeeId?.name}
                            <div className="text-[10px] text-slate-400 font-mono">
                              {r.employeeId?.employeeId} ({r.employeeId?.role})
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-white font-bold">{r.presentDays}d Present</span>
                            {r.unpaidLopDays > 0 && (
                              <div className="text-[10px] text-rose-400 font-bold">-{r.unpaidLopDays}d LOP</div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-amber-400 font-bold">
                            {r.overtimeHours} hrs
                            {r.overtimePay > 0 && (
                              <div className="text-[10px] text-emerald-400">+₹{r.overtimePay}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            ₹{(r.basicSalary + r.hra).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-white">
                            ₹{r.grossSalary?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-rose-300">
                            -₹{(r.pfDeduction + r.esiDeduction + r.professionalTax + r.tdsTax).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-amber-300">
                            {r.loanEmiDeduction > 0 ? `-₹${r.loanEmiDeduction}` : '₹0'}
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-emerald-400 text-sm">
                            ₹{r.netSalary?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select or process a payroll batch to view itemized employee salary calculations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessing;
