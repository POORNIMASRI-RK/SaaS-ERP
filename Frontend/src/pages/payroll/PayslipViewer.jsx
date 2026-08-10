import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Printer, Building, ShieldCheck, CheckCircle2, User, Calendar, Lock } from 'lucide-react';

const PayslipViewer = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    try {
      const res = await API.get('/payroll/my-payslips');
      if (res.data.success) {
        setPayslips(res.data.records);
        if (res.data.records.length > 0) {
          setSelectedPayslip(res.data.records[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Employee Self-Service (ESS) Payslip Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View, inspect itemized earnings &amp; statutory tax deductions, and print/download official monthly payslips.
          </p>
        </div>

        {selectedPayslip && (
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download PDF Payslip</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Payslip Months Selection List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 print:hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Pay Period</h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading payslips...</p>
            ) : payslips.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-2">
                <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs font-bold text-amber-400">No Authorized Payslips Available Yet</p>
                <p className="text-[11px] text-slate-400">
                  Monthly payslips will appear here automatically once the Company Admin authorizes and disburses the payroll.
                </p>
              </div>
            ) : (
              payslips.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedPayslip(p)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedPayslip?._id === p._id
                      ? 'bg-blue-950/60 border-blue-500/50 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {monthNames[p.month - 1]} {p.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20">
                      CREDITED
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-2">
                    <span className="text-slate-400">{p.presentDays} Days Work</span>
                    <span className="text-emerald-400 font-extrabold">₹{p.netSalary?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Printable Official Itemized Payslip Document */}
        <div className="lg:col-span-3">
          {selectedPayslip ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 print:bg-white print:text-black print:p-0 print:border-0 print:shadow-none text-slate-200">
              {/* Payslip Header */}
              <div className="flex justify-between items-start border-b border-slate-800 print:border-gray-300 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xl font-black text-white print:text-black">
                    <Building className="w-6 h-6 text-blue-400 print:text-black" />
                    <span>{user?.tenant?.name || 'Manufacturing Plant Corp'}</span>
                  </div>
                  <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                    Plant Branch: Detroit Main Plant | Statutory Reg #: MFG-987654
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 print:bg-gray-100 print:text-black font-extrabold text-xs uppercase border border-emerald-500/20">
                    Official Salary Slip (Credited)
                  </span>
                  <p className="text-sm font-mono font-bold text-white print:text-black mt-2">
                    Pay Period: {monthNames[selectedPayslip.month - 1]} {selectedPayslip.year}
                  </p>
                </div>
              </div>

              {/* Employee & Bank Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 print:bg-gray-50 border border-slate-800 print:border-gray-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase font-semibold">Employee Name</span>
                  <p className="font-bold text-white print:text-black mt-0.5">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600 font-mono">{user?.employeeId}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase font-semibold">Role / Designation</span>
                  <p className="font-semibold text-slate-300 print:text-black mt-0.5">{user?.designation || user?.role}</p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600">{user?.department}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase font-semibold">Attendance Summary</span>
                  <p className="font-mono font-bold text-emerald-400 print:text-black mt-0.5">
                    {selectedPayslip.presentDays} Days Present
                  </p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                    LOP: {selectedPayslip.unpaidLopDays}d | OT: {selectedPayslip.overtimeHours}h
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase font-semibold">Payment Details</span>
                  <p className="font-bold text-white print:text-black mt-0.5">Bank Direct Credit</p>
                  <p className="text-[10px] text-slate-400 print:text-gray-600 font-mono">Status: Disbursed</p>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Earnings Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 print:border-gray-300 pb-2">
                    Earnings Breakdown
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Basic Salary</span>
                      <span className="font-bold text-white print:text-black">₹{selectedPayslip.basicSalary?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">House Rent Allowance (HRA)</span>
                      <span className="font-bold text-white print:text-black">₹{selectedPayslip.hra?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Dearness Allowance (DA)</span>
                      <span className="font-bold text-white print:text-black">₹{selectedPayslip.da?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Conveyance &amp; Medical</span>
                      <span className="font-bold text-white print:text-black">₹{(selectedPayslip.conveyance + selectedPayslip.medicalAllowance)?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Special Allowance</span>
                      <span className="font-bold text-white print:text-black">₹{selectedPayslip.specialAllowance?.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedPayslip.overtimePay > 0 && (
                      <div className="flex justify-between text-amber-400 print:text-black">
                        <span className="font-sans">Overtime Pay ({selectedPayslip.overtimeHours} hrs)</span>
                        <span className="font-bold">+₹{selectedPayslip.overtimePay?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedPayslip.reimbursements > 0 && (
                      <div className="flex justify-between text-blue-400 print:text-black">
                        <span className="font-sans">Approved Reimbursements</span>
                        <span className="font-bold">+₹{selectedPayslip.reimbursements?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-800 print:border-gray-300 pt-2 text-sm font-extrabold">
                      <span className="font-sans text-white print:text-black">Gross Earnings</span>
                      <span className="text-emerald-400 print:text-black">₹{selectedPayslip.grossSalary?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 print:border-gray-300 pb-2">
                    Deductions Breakdown
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Provident Fund (PF 12%)</span>
                      <span className="font-bold text-rose-300 print:text-black">-₹{selectedPayslip.pfDeduction?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Employee State Insurance (ESI)</span>
                      <span className="font-bold text-rose-300 print:text-black">-₹{selectedPayslip.esiDeduction?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Professional Tax (PT)</span>
                      <span className="font-bold text-rose-300 print:text-black">-₹{selectedPayslip.professionalTax?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-gray-600 font-sans">Income Tax (TDS)</span>
                      <span className="font-bold text-rose-300 print:text-black">-₹{selectedPayslip.tdsTax?.toLocaleString('en-IN')}</span>
                    </div>
                    {selectedPayslip.lopDeduction > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 print:text-gray-600 font-sans">Leave Without Pay (LOP)</span>
                        <span className="font-bold text-rose-300 print:text-black">-₹{selectedPayslip.lopDeduction?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedPayslip.loanEmiDeduction > 0 && (
                      <div className="flex justify-between text-amber-300 print:text-black">
                        <span className="font-sans">Loan EMI Recovery</span>
                        <span className="font-bold">-₹{selectedPayslip.loanEmiDeduction?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-800 print:border-gray-300 pt-2 text-sm font-extrabold">
                      <span className="font-sans text-white print:text-black">Total Deductions</span>
                      <span className="text-rose-400 print:text-black">-₹{selectedPayslip.totalDeductions?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/30 print:bg-gray-100 print:border-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 print:text-black uppercase">Net Salary Take-Home</span>
                  <p className="text-xs text-slate-400 print:text-gray-600">Gross Earnings minus Total Statutory &amp; Loan Deductions</p>
                </div>
                <div className="text-3xl font-black text-emerald-400 print:text-black font-mono">
                  ₹{selectedPayslip.netSalary?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500 text-xs">
              Select an authorized payslip to view or print.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;
