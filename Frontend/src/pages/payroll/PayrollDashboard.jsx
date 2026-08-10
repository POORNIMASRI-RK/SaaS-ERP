import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PieChart,
  Award,
} from 'lucide-react';

const PayrollDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [config, setConfig] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      const [batchRes, configRes, salRes] = await Promise.all([
        API.get('/payroll/batches'),
        API.get('/payroll/config'),
        API.get('/payroll/salaries'),
      ]);

      if (batchRes.data.success) setBatches(batchRes.data.batches);
      if (configRes.data.success) setConfig(configRes.data.config);
      if (salRes.data.success) setSalaries(salRes.data.salaries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const latestBatch = batches[0];
  const totalSalaryExpense = batches.reduce((sum, b) => sum + (b.totalNetSalary || 0), 0);
  const totalOvertimeCost = batches.reduce((sum, b) => sum + (b.totalOvertimeCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <IndianRupee className="w-4 h-4" />
              <span>Plant Financials &amp; Compensation</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Payroll Management Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated attendance-integrated payroll, statutory PF/ESI/PT tax calculations, loans, and payslip generation.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/payroll/processing')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Run Monthly Payroll</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Salary Expense</span>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ₹{totalSalaryExpense.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Across all processed batches</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Overtime Costs</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            ₹{totalOvertimeCost.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">1.5x hourly rate calculation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Payroll Batches Run</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{batches.length}</p>
          <span className="text-[10px] text-blue-400 font-semibold">
            {latestBatch ? `Latest: ${latestBatch.batchName}` : 'No batches yet'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Configured Salary Records</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{salaries.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Assigned employee CTCs</span>
        </div>
      </div>

      {/* Recent Batches & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Batches Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Recent Payroll Runs &amp; Status</span>
            </h2>

            <button
              onClick={() => navigate('/payroll/processing')}
              className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Processing Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Batch Period</th>
                  <th className="py-3.5 px-4">Employees</th>
                  <th className="py-3.5 px-4">Total Net Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No payroll batches generated yet. Click "Run Monthly Payroll" to calculate!
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {b.batchName}
                        <div className="text-[10px] text-slate-400 font-mono">
                          Created: {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                        {b.totalEmployees} Employees
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                        ₹{b.totalNetSalary?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                            b.status === 'approved' || b.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}
                        >
                          {b.status === 'paid' ? 'DISBURSED & PAID' : b.status === 'approved' ? 'AUTHORIZED & APPROVED' : 'UNDER HR REVIEW'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate('/payroll/processing')}
                          className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold text-[11px]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Payroll Modules Navigation */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Payroll Management Quick Hub</h2>

            <div className="space-y-3 text-xs">
              <button
                onClick={() => navigate('/payroll/structures')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-all"
              >
                <div>
                  <p className="font-bold text-white">Salary Structures &amp; CTC</p>
                  <p className="text-[11px] text-slate-400">Manage Basic, HRA, DA &amp; employee revisions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() => navigate('/payroll/loans')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-all"
              >
                <div>
                  <p className="font-bold text-white">Loans &amp; Reimbursements</p>
                  <p className="text-[11px] text-slate-400">EMI deductions, travel &amp; medical claims</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() => navigate('/payroll/payslips')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-all"
              >
                <div>
                  <p className="font-bold text-white">ESS Payslip Portal</p>
                  <p className="text-[11px] text-slate-400">Download printable PDF-style monthly payslips</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() => navigate('/payroll/reports')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-all"
              >
                <div>
                  <p className="font-bold text-white">Financial &amp; Statutory Reports</p>
                  <p className="text-[11px] text-slate-400">Salary Register, Bank Transfer CSV, PF &amp; ESI</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
