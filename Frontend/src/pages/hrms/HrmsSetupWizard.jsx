import React, { useState } from 'react';
import API from '../../services/api';
import {
  Sparkles,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
} from 'lucide-react';

const HrmsSetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [wizardData, setWizardData] = useState({
    organizationName: 'Apex Precision Manufacturing Corp',
    branchLocations: [{ name: 'Detroit Main Plant', address: '100 Industrial Parkway', city: 'Detroit' }],
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { startTime: '09:00', endTime: '17:30' },
    weeklyOffs: ['Sunday'],
    lateGracePeriodMinutes: 15,
    overtimeThresholdHours: 8,
    requireMedicalAttachmentDays: 2,
    compOffRules: { enableAutoCredit: true, validityDays: 90, workThresholdHours: 4 },
    approvalWorkflow: { requireManagerApproval: true, requireHrApproval: true },
    holidayCalendar: [
      { name: 'New Year Day', date: '2026-01-01', isOptional: false },
      { name: 'Independence Day', date: '2026-07-04', isOptional: false },
      { name: 'Labor Day', date: '2026-09-07', isOptional: false },
      { name: 'Diwali / Festival', date: '2026-11-08', isOptional: false },
      { name: 'Christmas Day', date: '2026-12-25', isOptional: false },
    ],
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await API.post('/hrms/config', wizardData);
      if (res.data.success) {
        if (onComplete) onComplete();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete HRMS setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 text-center mb-6 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">HRMS First-Time Setup Wizard</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
          This wizard appears because HRMS is being accessed for the first time for your company. You can review settings or click <strong className="text-emerald-400">Quick Auto-Setup</strong> to instantly activate HRMS with default plant policies.
        </p>

        {/* Quick Setup 1-Click Button */}
        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Activating HRMS...' : '1-Click Quick Setup & Open HRMS Console'}</span>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                step === s
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : step > s
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span>Step {s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building className="w-5 h-5 text-blue-400" />
              <span>Step 1: Plant Organization &amp; Branch Locations</span>
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300">Organization Name</label>
              <input
                type="text"
                value={wizardData.organizationName}
                onChange={(e) => setWizardData({ ...wizardData, organizationName: e.target.value })}
                className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Main Plant Branch</label>
              <input
                type="text"
                value={wizardData.branchLocations[0]?.name || ''}
                onChange={(e) =>
                  setWizardData({
                    ...wizardData,
                    branchLocations: [{ name: e.target.value, city: 'Detroit' }],
                  })
                }
                className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Step 2: Working Days, Hours &amp; Late Grace Period</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Shift Start Time</label>
                <input
                  type="time"
                  value={wizardData.workingHours.startTime}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      workingHours: { ...wizardData.workingHours, startTime: e.target.value },
                    })
                  }
                  className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Shift End Time</label>
                <input
                  type="time"
                  value={wizardData.workingHours.endTime}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      workingHours: { ...wizardData.workingHours, endTime: e.target.value },
                    })
                  }
                  className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Late Arrival Grace Period (Minutes)</label>
                <input
                  type="number"
                  value={wizardData.lateGracePeriodMinutes}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      lateGracePeriodMinutes: parseInt(e.target.value) || 15,
                    })
                  }
                  className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Overtime Threshold (Hours / Day)</label>
                <input
                  type="number"
                  value={wizardData.overtimeThresholdHours}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      overtimeThresholdHours: parseInt(e.target.value) || 8,
                    })
                  }
                  className="w-full mt-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Step 3: Company Holiday Calendar</span>
            </h2>

            <div className="space-y-2">
              {wizardData.holidayCalendar.map((h, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{h.name}</span>
                  <span className="font-mono text-emerald-400">{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Step 4: Leave Policy &amp; Dual-Level Approval Workflow</span>
            </h2>

            <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 space-y-2 text-xs text-slate-300">
              <p className="font-bold text-purple-300">Configured Leave Policies (Default Entitlements):</p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div>• Casual Leave (CL): 12 days/yr</div>
                <div>• Sick Leave (SL): 12 days/yr</div>
                <div>• Annual Leave (AL): 15 days/yr</div>
                <div>• Maternity Leave: 180 days</div>
                <div>• Paternity Leave: 15 days</div>
                <div>• Emergency Leave: 5 days</div>
                <div>• Compensatory Off (Comp Off)</div>
                <div>• Loss of Pay (LOP Unpaid)</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-white">Multi-Level Approval Flow Enabled:</p>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>1. Manager Approval Step (Status: Pending HR)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>2. HR Final Sign-off (Deducts Leave Balance &amp; Sets Attendance to On Leave)</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {loading ? 'Finalizing Setup...' : 'Complete HRMS Setup & Open Module'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrmsSetupWizard;
