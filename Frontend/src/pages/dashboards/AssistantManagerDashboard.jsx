import React from 'react';
import { Layers, Activity, CheckSquare, Clock, Users } from 'lucide-react';

const AssistantManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-900/30 via-slate-900 to-slate-900 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Operational Execution Portal</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Assistant Operations Manager Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Shift monitoring, line supervisor logs, attendance validation &amp; task verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Shift Completion Status</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">87.5%</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Pending Task Approvals</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">4 Worksheets</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Active Assembly Stations</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">12 Operational</p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-3">Daily Operations Logs</h2>
        <div className="space-y-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-300">CNC Milling Line 3 Calibration Approved</span>
            <span className="text-slate-500 font-mono">08:30 AM</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-300">Shift-A Material Dispatch Verified</span>
            <span className="text-slate-500 font-mono">07:15 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantManagerDashboard;
