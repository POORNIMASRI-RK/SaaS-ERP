import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Building } from 'lucide-react';

const ModuleLockGuard = ({ moduleName, requiredPlan = 'Professional Tier' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tenantPlan = user?.tenant?.subscriptionPlan || 'Basic';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto my-8 shadow-2xl space-y-6 text-slate-200">
      {/* Lock Icon Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Module Access Locked: {moduleName}
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Your company <span className="font-bold text-white">[{user?.tenant?.name || 'Active Tenant'}]</span> is currently subscribed to the <span className="text-blue-400 font-bold">{tenantPlan} Tier</span> (₹49,990 / year).
        </p>
      </div>

      {/* Enabled vs Locked Modules Comparison Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Active Basic Tier Modules */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active Modules in Your {tenantPlan} Tier:</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 pl-6 list-disc">
            <li>HRMS &amp; Workforce Portal</li>
            <li>Inventory &amp; Stock Master</li>
            <li>GST Billing &amp; Invoicing</li>
            <li>Employee Payslips &amp; ESS</li>
          </ul>
        </div>

        {/* Locked Higher Tier Module */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-sans">
            <ShieldAlert className="w-4 h-4" />
            <span>Locked Module ({moduleName}):</span>
          </div>
          <p className="text-slate-400 font-sans text-[11px]">
            This module requires upgrading your company subscription to the <span className="text-amber-400 font-bold">{requiredPlan}</span> or <span className="text-purple-400 font-bold">Enterprise Tier</span>.
          </p>
          <div className="pt-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold">
              Upgrade Required
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Call to Action */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          <p className="font-bold text-white">Need access to {moduleName}?</p>
          <p className="text-[11px]">Contact your Company Admin or Super Admin to upgrade your tier.</p>
        </div>

        {(user?.role === 'Company Admin' || user?.role === 'Super Admin') && (
          <button
            onClick={() => navigate('/subscription')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Upgrade Subscription Tier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleLockGuard;
