import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Briefcase,
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  Layers,
  Activity,
  Plus,
  X,
} from 'lucide-react';

const ManagerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: 'Robotic Milling & Fabrication',
    designation: 'Technician',
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Manager fetch error:', err);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await API.post('/users/invite', formData);
      if (res.data.success) {
        setInviteSuccess({
          email: formData.email,
          role: formData.role,
          inviteLink: res.data.inviteLink,
        });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Departmental Operations Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">General Operations &amp; Team Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Resource planning, project milestones &amp; team member invitations.
            </p>
          </div>
          <button
            onClick={() => {
              setInviteSuccess(null);
              setShowInviteModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Department Team Members</p>
            <p className="text-xl font-bold text-white mt-0.5">{users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Department Projects</p>
            <p className="text-xl font-bold text-cyan-400 mt-0.5">8 Active Projects</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Operational Efficiency</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">94.2% Target</p>
          </div>
        </div>
      </div>

      {/* Team Roster */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-base font-bold text-white mb-4">Department Team Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{u.email}</td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">{u.role}</td>
                  <td className="py-3 px-4 text-slate-300">{u.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Invite Team Member (TL or Employee)</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <p className="text-xs text-emerald-400 font-bold">Invitation Email Sent!</p>
                <p className="text-xs text-slate-300">Direct Invitation Link:</p>
                <div className="bg-slate-950 p-2 rounded text-xs text-blue-400 font-mono break-all">
                  <a href={inviteSuccess.inviteLink} target="_blank" rel="noreferrer">
                    {inviteSuccess.inviteLink}
                  </a>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Team Leader">Team Leader</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-4 py-2 bg-blue-600 text-xs text-white font-bold rounded-xl"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
