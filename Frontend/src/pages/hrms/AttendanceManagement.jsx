import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Cpu,
  History,
  FileText,
  X,
} from 'lucide-react';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Biometric simulator state
  const [bioEmpId, setBioEmpId] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState(null);

  // Correction Modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    newStatus: 'Present',
    reason: '',
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await API.get('/attendance');
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateBiometric = async (e) => {
    e.preventDefault();
    if (!bioEmpId) return;
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await API.post('/attendance/biometric-sync', {
        employeeCode: bioEmpId.trim().toUpperCase(),
        deviceId: 'BIO-SIMULATOR-01',
      });
      if (res.data.success) {
        setSimMessage({ type: 'success', text: res.data.message });
        fetchAttendance();
      }
    } catch (err) {
      setSimMessage({ type: 'error', text: err.response?.data?.message || 'Biometric punch sync failed.' });
    } finally {
      setSimulating(false);
    }
  };

  const openCorrectionModal = (rec) => {
    setSelectedRecord(rec);
    setCorrectionForm({
      newStatus: rec.status,
      reason: '',
    });
    setShowCorrectionModal(true);
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!selectedRecord || !correctionForm.reason.trim()) {
      alert('Detailed correction reason is required for audit logging.');
      return;
    }

    try {
      const res = await API.patch(`/attendance/${selectedRecord._id}/correct`, {
        newStatus: correctionForm.newStatus,
        reason: correctionForm.reason,
      });

      if (res.data.success) {
        alert(res.data.message);
        setShowCorrectionModal(false);
        fetchAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Correction failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Attendance &amp; Biometric Machine Integration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric punch sync, check-in tracking, overtime duration, and manual correction audit trails.
          </p>
        </div>

        {/* Biometric Machine Punch Simulator Bar */}
        <form onSubmit={handleSimulateBiometric} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            required
            value={bioEmpId}
            onChange={(e) => setBioEmpId(e.target.value)}
            placeholder="Enter Emp ID (e.g. CMP-A-101)..."
            className="w-44 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={simulating}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
          >
            {simulating ? 'Syncing...' : 'Simulate Biometric Punch'}
          </button>
        </form>
      </div>

      {simMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${
            simMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          {simMessage.text}
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Daily Attendance Records &amp; Hardware Punch Logs</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Device Verification</th>
                <th className="py-3.5 px-4">Audit Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-400">Loading attendance records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-500">No attendance records found.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {r.employeeId?.name}
                      <div className="text-[10px] text-slate-400 font-mono">{r.employeeId?.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${
                        r.status === 'On Leave'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : r.status === 'Late Arrival'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      {r.biometricDeviceId}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isManualCorrection ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          Audit Corrected ({r.correctionAuditLog?.length || 1})
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Verified Device</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <button
                          onClick={() => openCorrectionModal(r)}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]"
                        >
                          Manual Correction
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction Modal */}
      {showCorrectionModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Manual Attendance Correction &amp; Audit Log</span>
              </h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Correcting record for <strong>{selectedRecord.employeeId?.name}</strong> on{' '}
                <span className="font-mono text-blue-400">{new Date(selectedRecord.date).toLocaleDateString()}</span>
              </p>

              <div>
                <label className="text-slate-300 font-semibold">New Attendance Status *</label>
                <select
                  value={correctionForm.newStatus}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, newStatus: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="Present">Present</option>
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Overtime">Overtime</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Mandatory Audit Reason *</label>
                <textarea
                  required
                  rows="3"
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  placeholder="State official reason (e.g. Authorized plant emergency duty)..."
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Apply Correction &amp; Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
