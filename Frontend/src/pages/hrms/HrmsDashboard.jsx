import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import HrmsSetupWizard from './HrmsSetupWizard';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Building,
  FileText,
  Plus,
  Shield,
  Eye,
  Edit2,
  Check,
  X,
  Upload,
  Activity,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
  Paperclip,
} from 'lucide-react';

const HrmsDashboard = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState(null);

  // Leave Balances & Applications state
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  // Modals state
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    halfDaySession: 'First Half',
    reason: '',
    description: '',
    attachmentUrl: '',
    attachmentName: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config?.isConfigured) {
      refreshAllData();
    }
  }, [config, user]);

  const refreshAllData = () => {
    fetchLeaveBalances();
    fetchTodayAttendance();
    fetchMyLeaveRequests();
    if (['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(user?.role)) {
      fetchPendingApprovals();
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await API.get('/hrms/config');
      if (res.data.success) {
        setConfig(res.data.config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const res = await API.get('/leaves/balances');
      if (res.data.success) {
        setLeaveBalances(res.data.balances);
        if (res.data.balances.length > 0 && !leaveForm.leaveTypeId) {
          setLeaveForm((prev) => ({ ...prev, leaveTypeId: res.data.balances[0].leaveTypeId }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await API.get(`/attendance?startDate=${todayStr}&endDate=${todayStr}`);
      if (res.data.success && res.data.records.length > 0) {
        setTodayAttendance(res.data.records[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const res = await API.get('/leaves/approvals');
      if (res.data.success) {
        const strictlyPending = res.data.requests.filter(
          (req) => req.finalStatus === 'pending_manager' || req.finalStatus === 'pending_hr'
        );
        setPendingApprovals(strictlyPending);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyLeaveRequests = async () => {
    try {
      const res = await API.get('/leaves/requests');
      if (res.data.success) {
        setMyLeaveRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setClockLoading(true);
    setClockMessage(null);
    try {
      const res = await API.post('/attendance/check-in');
      if (res.data.success) {
        setTodayAttendance(res.data.attendance);
        setClockMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setClockMessage({ type: 'error', text: err.response?.data?.message || 'Clock-in failed' });
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    setClockMessage(null);
    try {
      const res = await API.post('/attendance/check-out');
      if (res.data.success) {
        setTodayAttendance(res.data.attendance);
        setClockMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setClockMessage({ type: 'error', text: err.response?.data?.message || 'Clock-out failed' });
    } finally {
      setClockLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLeaveForm((prev) => ({
        ...prev,
        attachmentUrl: reader.result,
        attachmentName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/leaves/apply', leaveForm);
      if (res.data.success) {
        alert(res.data.message);
        setShowApplyLeaveModal(false);
        refreshAllData();
        window.dispatchEvent(new Event('notification-updated'));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveLeave = async (id) => {
    if (!window.confirm('Approve this leave request? Request will be approved, balance reduced, and removed from pending queue.')) return;
    try {
      const res = await API.patch(`/leaves/${id}/approve-manager`, { comment: `Approved by ${user?.name} (${user?.role})` });
      if (res.data.success) {
        alert('Leave request APPROVED! Balance updated and removed from pending queue.');
        refreshAllData();
        window.dispatchEvent(new Event('notification-updated'));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleOpenRejectModal = (req) => {
    setSelectedReqForReject(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReqForReject || !rejectionReason) return;
    setActionLoading(true);
    try {
      const res = await API.patch(`/leaves/${selectedReqForReject._id}/reject`, { rejectionReason });
      if (res.data.success) {
        setShowRejectModal(false);
        refreshAllData();
        window.dispatchEvent(new Event('notification-updated'));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const activePendingQueue = pendingApprovals.filter(
    (req) => req.finalStatus === 'pending_manager' || req.finalStatus === 'pending_hr'
  );

  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center py-20 text-blue-400">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!config?.isConfigured) {
    return <HrmsSetupWizard onComplete={fetchConfig} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Plant Workforce &amp; HRMS Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">HRMS Workspace Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Attendance check-in, real-time leave balances, 1-click approvals (Manager / HR), and biometric punch integration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Attendance &amp; Leave Balances</span>
        </button>

        {['Super Admin', 'Company Admin', 'HR', 'Manager', 'Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Production Manager', 'Maintenance Manager'].includes(user?.role) && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === 'approvals'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Leave Approvals Queue</span>
            {activePendingQueue.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activePendingQueue.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Attendance & Leave Balances */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Check-In / Clock Console Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>Daily Workstation Clock Console</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grace Period: <span className="text-blue-300 font-mono font-semibold">15 Mins</span> | Shift: <span className="text-emerald-300 font-mono font-semibold">General (09:00 - 17:30)</span>
                </p>
              </div>

              {/* Clock Buttons */}
              <div className="flex items-center gap-3">
                <button
                  disabled={clockLoading || (todayAttendance && todayAttendance.checkInTime) || todayAttendance?.status === 'On Leave'}
                  onClick={handleCheckIn}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {todayAttendance?.status === 'On Leave'
                      ? 'On Approved Leave'
                      : todayAttendance?.checkInTime
                      ? 'Clocked In'
                      : 'Clock In (Web / Biometric)'}
                  </span>
                </button>

                <button
                  disabled={clockLoading || !todayAttendance?.checkInTime || todayAttendance?.checkOutTime || todayAttendance?.status === 'On Leave'}
                  onClick={handleCheckOut}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>{todayAttendance?.checkOutTime ? 'Clocked Out' : 'Clock Out'}</span>
                </button>
              </div>
            </div>

            {clockMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  clockMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {clockMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Today Check-In</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {todayAttendance?.checkInTime
                    ? new Date(todayAttendance.checkInTime).toLocaleTimeString()
                    : 'Not Clocked In'}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Today Check-Out</span>
                <p className="text-sm font-mono font-bold text-white mt-1">
                  {todayAttendance?.checkOutTime
                    ? new Date(todayAttendance.checkOutTime).toLocaleTimeString()
                    : 'Not Clocked Out'}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Attendance Status</span>
                <p className={`text-sm font-bold mt-1 ${todayAttendance?.status === 'On Leave' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {todayAttendance?.status || 'Ready / Shift Scheduled'}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Biometric Status</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-blue-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Biometric Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balances Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Leave Balances &amp; Entitlements</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveBalances.map((b) => (
                <div
                  key={b.leaveTypeId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px]">
                      {b.code || b.leaveTypeCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{b.isPaid ? 'Paid Leave' : 'Unpaid'}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white">{b.name || b.leaveTypeName}</h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {b.remainingDays}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ {b.daysPerYear} Days Left</span>
                  </div>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (b.remainingDays / (b.daysPerYear || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Submitted Leave Applications & Live Status Tracking */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>My Submitted Leave Applications &amp; Live Approval Status</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Dates &amp; Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Approved / Processed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {myLeaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500">
                        No leave applications submitted yet.
                      </td>
                    </tr>
                  ) : (
                    myLeaveRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-blue-400">
                          {req.leaveTypeId?.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}
                          <div className="text-[10px] text-slate-500 font-bold">
                            Total: {req.totalDays} Day(s)
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3.5 px-4">
                          {req.finalStatus === 'approved' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                            </span>
                          ) : req.finalStatus === 'rejected' ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold text-[10px] border border-rose-500/20 flex items-center gap-1 w-max">
                              <XCircle className="w-3.5 h-3.5" /> REJECTED ({req.rejectionReason})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20 animate-pulse flex items-center gap-1 w-max">
                              <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {req.hrApprovedBy?.name || req.managerApprovedBy?.name || req.managerComment || req.hrComment || 'Pending Sign-off'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Approvals Queue (Manager / HR) */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Leave Approval Queue (Pending 1-Click Sign-Off for Manager / HR)</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Pending Queue: {activePendingQueue.length} Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates &amp; Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Attachment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">1-Click Sign-Off Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activePendingQueue.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500">
                      No pending leave approvals in queue. All requests processed!
                    </td>
                  </tr>
                ) : (
                  activePendingQueue.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {req.employeeId?.name}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {req.employeeId?.employeeId} ({req.employeeId?.role})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-blue-400">
                        {req.leaveTypeId?.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}
                        <div className="text-[10px] text-slate-500 font-bold">
                          Total: {req.totalDays} Day(s)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {req.reason}
                      </td>

                      <td className="py-3.5 px-4">
                        {req.attachmentUrl ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold text-[10px] border border-blue-500/20 inline-flex items-center gap-1">
                            <Paperclip className="w-3 h-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">None</span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20 animate-pulse flex items-center gap-1 w-max">
                          <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleApproveLeave(req._id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md shadow-emerald-600/20 inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Leave
                        </button>

                        <button
                          onClick={() => handleOpenRejectModal(req)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Apply for Leave */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Apply for Leave</span>
              </h3>
              <button onClick={() => setShowApplyLeaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Leave Type *</label>
                <select
                  value={leaveForm.leaveTypeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  {leaveBalances.map((b) => (
                    <option key={b.leaveTypeId} value={b.leaveTypeId}>
                      {b.name || b.leaveTypeName} ({b.remainingDays} days remaining)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>From Date *</span>
                    <span className="text-[10px] text-blue-400 font-normal">Click to pick</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      required
                      style={{ colorScheme: 'dark' }}
                      onClick={(e) => e.target.showPicker?.()}
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>To Date *</span>
                    <span className="text-[10px] text-blue-400 font-normal">Click to pick</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      required
                      style={{ colorScheme: 'dark' }}
                      onClick={(e) => e.target.showPicker?.()}
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Working Days Live Indicator (Excludes Weekends) */}
              {leaveForm.fromDate && leaveForm.toDate && (() => {
                const start = new Date(leaveForm.fromDate);
                const end = new Date(leaveForm.toDate);
                let count = 0;
                if (start <= end) {
                  const cur = new Date(start);
                  cur.setHours(0, 0, 0, 0);
                  const finish = new Date(end);
                  finish.setHours(0, 0, 0, 0);
                  while (cur <= finish) {
                    const dayOfWeek = cur.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
                    cur.setDate(cur.getDate() + 1);
                  }
                }
                const workingDaysCount = leaveForm.isHalfDay ? 0.5 : count;

                return (
                  <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans font-bold">Calculated Working Leave Duration:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {workingDaysCount} Working Day{workingDaysCount !== 1 ? 's' : ''}
                      <span className="text-[10px] text-blue-400 font-sans block text-right font-normal">
                        (Sat &amp; Sun auto-excluded)
                      </span>
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={leaveForm.isHalfDay}
                  onChange={(e) => setLeaveForm({ ...leaveForm, isHalfDay: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="halfDay" className="text-slate-300 font-semibold cursor-pointer">
                  Half Day Leave Application
                </label>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Reason for Leave *</label>
                <input
                  type="text"
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Personal errand or medical checkup"
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Attachment (Required for Sick Leave &gt; 2 Days)</span>
                  {leaveForm.attachmentName && (
                    <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[150px]">
                      {leaveForm.attachmentName}
                    </span>
                  )}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <label className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>{leaveForm.attachmentName ? 'Change File' : 'Upload Medical / Proof Certificate'}</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reject Leave Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Reject Leave Application</span>
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Are you sure you want to reject <strong className="text-white">{selectedReqForReject?.employeeId?.name}'s</strong> leave request for {selectedReqForReject?.leaveTypeId?.name}?
              </p>

              <div>
                <label className="text-slate-300 font-semibold">Mandatory Rejection Reason *</label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide clear operational reason for rejection..."
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrmsDashboard;
