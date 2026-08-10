import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckSquare, ShieldCheck, UserCheck, Play, Square, Award } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [clockedIn, setClockedIn] = useState(true);
  const [clockTime, setClockTime] = useState('08:00 AM');

  const toggleClock = () => {
    if (clockedIn) {
      setClockedIn(false);
    } else {
      setClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-900 border border-slate-700/60 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Employee Personal Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Welcome, {user?.name || 'Technician'}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Role: <strong className="text-blue-300">{user?.role}</strong> | Department:{' '}
              <strong className="text-slate-300">{user?.department || 'Line-A Fabrication'}</strong>
            </p>
          </div>

          <button
            onClick={toggleClock}
            className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              clockedIn
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {clockedIn ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Clock Out of Shift</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Clock In to Workstation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Shift Attendance Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-3 h-3 rounded-full ${
                clockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <p className="text-sm font-bold text-white">
              {clockedIn ? `Clocked In at ${clockTime}` : 'Clocked Out'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Daily Completed Tasks</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">18 / 20 Operations</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Efficiency Rating</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">96.8% Score</p>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">My Station Work Assignments</h2>
        <div className="space-y-3">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Execute CNC Tooling Pass #14 - Chassis Bracket
                </p>
                <p className="text-[11px] text-slate-500">Workstation #3 | Target: 25 Pcs</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Completed
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Perform Quality &amp; Dimensional Audit (Micrometer)
                </p>
                <p className="text-[11px] text-slate-500">Workstation #3 | Due by 04:00 PM</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
