import React from 'react';
import { Users, CheckSquare, Clock, Factory, Award } from 'lucide-react';

const TeamLeaderDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-900/30 via-slate-900 to-slate-900 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Shop Floor Direct Supervision</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Team Leader (TL) Control Station</h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct station management, daily target tracking, shift attendance &amp; worker guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Shift Target Progress</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">320 / 400 Units</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Station Technicians Present</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">6 / 6 Technicians</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Station Safety Score</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">100% Zero Incident</p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-3">Workstation Assignments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">Carlos Mendez</p>
              <p className="text-[11px] text-slate-400">Station #3 - CNC Milling</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">David Miller</p>
              <p className="text-[11px] text-slate-400">Station #4 - Quality Audit</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;
