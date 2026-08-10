import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Shield,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  Power,
  Users,
} from 'lucide-react';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await API.get('/leaves/types');
      if (res.data.success) {
        setLeaveTypes(res.data.types);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>Leave Policy Configuration &amp; Entitlements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure company leave rules, annual day limits, probation restrictions, and carry-forward rules.
          </p>
        </div>
      </div>

      {/* Leave Types Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Company Leave Policies Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Policy Code</th>
                <th className="py-3.5 px-4">Leave Type Name</th>
                <th className="py-3.5 px-4">Annual Days</th>
                <th className="py-3.5 px-4">Max Monthly Limit</th>
                <th className="py-3.5 px-4">Half-Day Allowed</th>
                <th className="py-3.5 px-4">Medical Attachment</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-slate-400">Loading leave policies...</td>
                </tr>
              ) : leaveTypes.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{t.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{t.name}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">{t.daysPerYear} Days/Yr</td>
                  <td className="py-3.5 px-4 font-mono">{t.maxMonthlyLimit > 0 ? `${t.maxMonthlyLimit} Days/Mo` : 'Unlimited'}</td>
                  <td className="py-3.5 px-4">{t.allowHalfDay ? 'Yes' : 'No'}</td>
                  <td className="py-3.5 px-4">{t.requireAttachmentDays > 0 ? `Required if > ${t.requireAttachmentDays} Days` : 'Not Required'}</td>
                  <td className="py-3.5 px-4 font-semibold">{t.isPaid ? 'Paid Leave' : 'Unpaid (LOP)'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
