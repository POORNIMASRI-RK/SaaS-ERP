import React from 'react';
import { Factory, Layers, ShieldCheck, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';

const ProductionManagerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900/30 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
          <Factory className="w-4 h-4" />
          <span>Manufacturing &amp; Plant Floor Control</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Production Line &amp; Tooling Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Work order dispatch, assembly line metrics, downtime tracking &amp; quality assurance.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Line Throughput</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">340 Pcs / Hr</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Work Orders</p>
            <p className="text-xl font-bold text-white mt-0.5">WO-9904 Active</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Equipment Downtime</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">12 mins (Line B)</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Quality Defect Rate</p>
            <p className="text-xl font-bold text-purple-400 mt-0.5">0.14% PPM</p>
          </div>
        </div>
      </div>

      {/* Active Manufacturing Work Orders */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">Shop Floor Work Orders Execution</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Part / Component</th>
                <th className="py-3 px-4">Assembly Line</th>
                <th className="py-3 px-4">Target Qty</th>
                <th className="py-3 px-4">Completed Qty</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono text-blue-400 font-bold">WO-2026-8801</td>
                <td className="py-3 px-4 font-semibold text-white">Chassis Structural Bracket</td>
                <td className="py-3 px-4 text-slate-300">Robotic Line-A</td>
                <td className="py-3 px-4 font-mono">1,000</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">845</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    In Production
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono text-blue-400 font-bold">WO-2026-8802</td>
                <td className="py-3 px-4 font-semibold text-white">Transmission Gear Casing</td>
                <td className="py-3 px-4 text-slate-300">CNC Milling Line-B</td>
                <td className="py-3 px-4 font-mono">500</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">500</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                    Quality Inspection
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionManagerDashboard;
