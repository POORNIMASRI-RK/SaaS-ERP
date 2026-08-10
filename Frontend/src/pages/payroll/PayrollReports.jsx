import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Building, IndianRupee, Users, ShieldCheck, Printer, CheckCircle } from 'lucide-react';

const PayrollReports = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await API.get('/payroll/batches');
      if (res.data.success && res.data.batches.length > 0) {
        setBatches(res.data.batches);
        setSelectedBatchId(res.data.batches[0]._id);
        fetchRecords(res.data.batches[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (bId) => {
    setLoading(true);
    try {
      const res = await API.get(`/payroll/batches/${bId}/records`);
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const id = e.target.value;
    setSelectedBatchId(id);
    fetchRecords(id);
  };

  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  const totalBasic = records.reduce((sum, r) => sum + r.basicSalary, 0);
  const totalGross = records.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalPf = records.reduce((sum, r) => sum + r.pfDeduction, 0);
  const totalEsi = records.reduce((sum, r) => sum + r.esiDeduction, 0);
  const totalPt = records.reduce((sum, r) => sum + r.professionalTax, 0);
  const totalTds = records.reduce((sum, r) => sum + r.tdsTax, 0);
  const totalNet = records.reduce((sum, r) => sum + r.netSalary, 0);

  const downloadBankCsv = () => {
    if (records.length === 0) return;
    let csv = 'Employee ID,Employee Name,Bank Name,Account Number,IFSC Code,Net Salary (INR)\n';
    records.forEach((r) => {
      csv += `"${r.employeeId?.employeeId || ''}","${r.employeeId?.name || ''}","HDFC Bank","987654${r._id.substr(-4)}","HDFC00123",${r.netSalary}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Transfer_Report_${selectedBatch?.batchName || 'Payroll'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Payroll Financial &amp; Statutory Reports Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Export Salary Register, Bank Transfer CSVs, PF Returns, ESI Statutory Reports, and Tax Registers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBatchId}
            onChange={handleBatchChange}
            className="bg-slate-950 text-white text-xs font-bold p-2.5 rounded-xl border border-slate-800"
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName} ({b.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={downloadBankCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Bank Transfer CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Total Gross Payroll</span>
          <p className="text-xl font-black text-white">₹{totalGross.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Total Statutory PF</span>
          <p className="text-xl font-black text-blue-400">₹{totalPf.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Total ESI + PT Tax</span>
          <p className="text-xl font-black text-purple-400">₹{(totalEsi + totalPt).toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Net Salary Disbursed</span>
          <p className="text-xl font-black text-emerald-400">₹{totalNet.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Master Salary Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Master Salary Register &amp; Statutory Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Basic</th>
                <th className="py-3 px-3">HRA + Allowances</th>
                <th className="py-3 px-3">Gross Salary</th>
                <th className="py-3 px-3">PF (12%)</th>
                <th className="py-3 px-3">ESI (0.75%)</th>
                <th className="py-3 px-3">PT / TDS</th>
                <th className="py-3 px-3 font-extrabold text-emerald-400">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-400 font-sans">
                    Loading salary register...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-500 font-sans">
                    No records found for selected batch.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      {r.employeeId?.name}
                      <div className="text-[10px] text-slate-400 font-mono">{r.employeeId?.employeeId}</div>
                    </td>
                    <td className="py-3 px-3 text-white">₹{r.basicSalary?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-300">₹{(r.hra + r.da + r.conveyance + r.specialAllowance)?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-white">₹{r.grossSalary?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-blue-400">₹{r.pfDeduction?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-purple-400">₹{r.esiDeduction?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-rose-300">₹{(r.professionalTax + r.tdsTax)?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-400 text-sm">₹{r.netSalary?.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollReports;
