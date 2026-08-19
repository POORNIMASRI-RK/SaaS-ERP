import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  UserPlus,
  Mail,
  CheckCircle,
  Clock,
  Send,
  Building,
  Shield,
  X,
  Copy,
} from 'lucide-react';

const HRDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: 'HR',
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
      console.error('HR fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteSuccess(null);

    try {
      const res = await API.post('/users/invite', formData);
      if (res.data.success) {
        setInviteSuccess({
          email: formData.email,
          role: formData.role,
          inviteLink: res.data.inviteLink,
        });
        setFormData({
          name: '',
          email: '',
          role: 'Employee',
          department: 'HR',
          designation: 'Technician',
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
    <main className="space-y-6">
      {/* Top Banner */}
      <section aria-label="HR Banner" className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>Human Resources &amp; Onboarding Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Workforce Management &amp; Recruitment</h1>
            <p className="text-xs text-slate-400 mt-1">
              Invite new manufacturing staff via secure Nodemailer link, manage shifts and employee status.
            </p>
          </div>
          <button
            onClick={() => {
              setInviteSuccess(null);
              setShowInviteModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Invite New Employee / Staff</span>
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="HR Metrics Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Staff Members</p>
            <p className="text-xl font-bold text-white mt-0.5">{loading ? '...' : users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Accounts</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {loading ? '...' : users.filter((u) => u.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Email Invitations</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">
              {loading ? '...' : users.filter((u) => u.status === 'pending_invitation').length}
            </p>
          </div>
        </div>
      </section>

      {/* Directory Table */}
      <section aria-label="Employee Directory Table" className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" aria-hidden="true" />
            <span>Employee Directory</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-40"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  </tr>
                ))
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {u.status === 'pending_invitation' ? '● Pending Invite' : '● Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Employee Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" aria-hidden="true" />
                <span>Send Employee Onboarding Invitation</span>
              </h3>
              <button
                type="button"
                aria-label="Close onboarding modal"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Invitation Email Successfully Dispatched!</span>
                </div>
                <p className="text-xs text-slate-300">
                  An onboarding email with a secure link was sent via Nodemailer to{' '}
                  <strong className="text-white">{inviteSuccess.email}</strong> for role{' '}
                  <strong className="text-purple-300">{inviteSuccess.role}</strong>.
                </p>
                <div className="pt-2 border-t border-purple-800/40">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">
                    Generated Direct Invitation Link (for Dev Testing):
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-blue-400 break-all font-mono">
                    <a href={inviteSuccess.inviteLink} target="_blank" rel="noreferrer" className="underline">
                      {inviteSuccess.inviteLink}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInviteSuccess(null)}
                  className="w-full mt-2 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer"
                >
                  Send Another Invitation
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hr-invite-name" className="text-xs font-semibold text-slate-300">Full Name</label>
                    <input
                      id="hr-invite-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="hr-invite-email" className="text-xs font-semibold text-slate-300">Work Email</label>
                    <input
                      id="hr-invite-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="johndoe@company.com"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hr-invite-role" className="text-xs font-semibold text-slate-300">Assign Role</label>
                    <select
                      id="hr-invite-role"
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="Employee">Employee</option>
                      <option value="CRM Employee">CRM Employee</option>
                      <option value="Maintenance Employee">Maintenance Employee</option>
                      <option value="Production Employee">Production Employee</option>
                      <option value="Warehouse Employee">Warehouse Employee</option>
                      <option value="Purchase Employee">Purchase Employee</option>
                      <option value="Inventory Employee">Inventory Employee</option>
                      <option value="Finance Employee">Finance Employee</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Warehouse Manager">Warehouse Manager</option>
                      <option value="Purchase Manager">Purchase Manager</option>
                      <option value="Production Manager">Production Manager</option>
                      <option value="Maintenance Manager">Maintenance Manager</option>
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Finance Manager">Finance Manager</option>
                      <option value="Team Leader">Team Leader (TL)</option>
                      <option value="Manager">Manager</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hr-invite-dept" className="text-xs font-semibold text-slate-300">Department</label>
                    <select
                      id="hr-invite-dept"
                      name="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="HR">HR</option>
                      <option value="Inventory Automation">Inventory Automation</option>
                      <option value="Warehouse Management">Warehouse Management</option>
                      <option value="Purchase Management">Purchase Management</option>
                      <option value="Production Planning">Production Planning</option>
                      <option value="Maintenance Tracking">Maintenance Tracking</option>
                      <option value="CRM Integration">CRM Integration</option>
                      <option value="Sales & Business Development">Sales &amp; Business Development</option>
                      <option value="Finance & Accounts">Finance &amp; Accounts</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    {inviteLoading ? 'Sending Invitation...' : 'Dispatch Invitation Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default HRDashboard;
