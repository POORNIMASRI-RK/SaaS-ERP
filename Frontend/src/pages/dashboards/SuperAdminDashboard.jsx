import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Plus,
  Server,
  Globe,
  Edit2,
  Power,
  Trash2,
  AlertTriangle,
  X,
  Search,
  CheckCircle,
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form states
  const [newCompany, setNewCompany] = useState({
    name: '',
    code: '',
    industry: 'Automotive & Heavy Manufacturing',
    contactEmail: '',
    phone: '',
    maxEmployees: 500,
    subscriptionPlan: 'Enterprise',
    adminEmail: '',
    adminPassword: 'Password123!',
  });

  const [editCompany, setEditCompany] = useState({
    name: '',
    industry: '',
    contactEmail: '',
    phone: '',
    maxEmployees: 500,
    subscriptionPlan: 'Enterprise',
  });

  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, compRes] = await Promise.all([
        API.get('/companies/stats'),
        API.get('/companies'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (compRes.data.success) setCompanies(compRes.data.companies);
    } catch (err) {
      console.error('Super Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await API.post('/companies', newCompany);
      if (res.data.success) {
        setShowCreateModal(false);
        setNewCompany({
          name: '',
          code: '',
          industry: 'Automotive & Heavy Manufacturing',
          contactEmail: '',
          phone: '',
          maxEmployees: 500,
          subscriptionPlan: 'Enterprise',
          adminEmail: '',
          adminPassword: 'Password123!',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create tenant company.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setModalLoading(true);
    try {
      const res = await API.put(`/companies/${selectedCompany._id}`, editCompany);
      if (res.data.success) {
        setShowEditModal(false);
        setSelectedCompany(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (comp) => {
    const targetStatus = comp.status === 'active' ? 'suspended' : 'active';
    const actionText = targetStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE';
    
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} tenant [${comp.name}]? ${
          targetStatus === 'suspended'
            ? 'Users of this company will be blocked from logging in.'
            : ''
        }`
      )
    ) {
      return;
    }

    try {
      const res = await API.patch(`/companies/${comp._id}/status`, { status: targetStatus });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCompany = async (comp) => {
    if (
      !window.confirm(
        `DANGER: Are you sure you want to PERMANENTLY DELETE tenant [${comp.name}]? All associated employee accounts will be removed.`
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(`/companies/${comp._id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company.');
    }
  };

  const openEditModal = (comp) => {
    setSelectedCompany(comp);
    setEditCompany({
      name: comp.name,
      industry: comp.industry || 'Automotive & Heavy Manufacturing',
      contactEmail: comp.contactEmail || '',
      phone: comp.phone || '',
      maxEmployees: comp.maxEmployees || 500,
      subscriptionPlan: comp.subscriptionPlan || 'Enterprise',
    });
    setShowEditModal(true);
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Platform Governance</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">SaaS Multi-Tenant Management Module</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage platform tenant companies (Company A, Company B, Company C, Company D), auto-provision Company Admins, and enforce data isolation.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Tenant Company</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Tenant Companies</p>
            <p className="text-xl font-bold text-white mt-0.5">{companies.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Tenants</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {companies.filter((c) => c.status === 'active').length} Active
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Suspended Tenants</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">
              {companies.filter((c) => c.status === 'suspended').length} Suspended
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Platform Users</p>
            <p className="text-xl font-bold text-purple-300 mt-0.5">{stats?.totalUsers || 25}</p>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Control Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Multi-Tenant Organizations Registry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Super Admin complete access to create, edit, activate, suspend, and delete tenant companies.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Company Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Tenant Code</th>
                <th className="py-3 px-4">Industry Domain</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Users</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500">
                    No tenant companies match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        <p>{comp.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{comp.contactEmail}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{comp.code}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {comp.industry}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                        {comp.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {comp.userCount || 0} / {comp.maxEmployees || 500} seats
                    </td>
                    <td className="py-3.5 px-4">
                      {comp.status === 'active' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Enter Company Portal Context */}
                      <button
                        onClick={() => {
                          localStorage.setItem('selectedTenantId', comp._id);
                          window.dispatchEvent(new Event('tenant-changed'));
                          window.location.href = '/crm';
                        }}
                        title="Enter Company Portal"
                        className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Manage Portal</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(comp)}
                        title="Edit Tenant"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Suspend / Activate Toggle */}
                      <button
                        onClick={() => handleToggleStatus(comp)}
                        title={comp.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          comp.status === 'active'
                            ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCompany(comp)}
                        title="Delete Tenant"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Onboard New Tenant Company */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-400" />
                <span>Onboard New Tenant Company</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="e.g. Company Name"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Tenant Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={newCompany.code}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, code: e.target.value.toUpperCase() })
                    }
                    placeholder="CMP code"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Industry Sector</label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="Automotive & Heavy Manufacturing"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                    placeholder="admin@companye.com"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Subscription Plan</label>
                  <select
                    value={newCompany.subscriptionPlan}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, subscriptionPlan: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Enterprise">Enterprise Tier</option>
                    <option value="Professional">Professional Tier</option>
                    <option value="Basic">Basic Tier</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Max Employee Seats</label>
                  <input
                    type="number"
                    value={newCompany.maxEmployees}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, maxEmployees: parseInt(e.target.value) || 500 })
                    }
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Company Admin Provisioning details */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Company Admin Provisioning Credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Admin Email</label>
                    <input
                      type="email"
                      value={newCompany.adminEmail || newCompany.contactEmail}
                      onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                      placeholder="admin@companye.com"
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Initial Password</label>
                    <input
                      type="text"
                      value={newCompany.adminPassword}
                      onChange={(e) => setNewCompany({ ...newCompany, adminPassword: e.target.value })}
                      className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
                >
                  {modalLoading ? 'Creating Tenant...' : 'Onboard Tenant Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Tenant Company */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>Edit Tenant Specs [{selectedCompany.code}]</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompany.name}
                  onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Industry Sector</label>
                  <input
                    type="text"
                    value={editCompany.industry}
                    onChange={(e) => setEditCompany({ ...editCompany, industry: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editCompany.contactEmail}
                    onChange={(e) => setEditCompany({ ...editCompany, contactEmail: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Subscription Plan</label>
                  <select
                    value={editCompany.subscriptionPlan}
                    onChange={(e) =>
                      setEditCompany({ ...editCompany, subscriptionPlan: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Enterprise">Enterprise Tier</option>
                    <option value="Professional">Professional Tier</option>
                    <option value="Basic">Basic Tier</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Max Employee Seats</label>
                  <input
                    type="number"
                    value={editCompany.maxEmployees}
                    onChange={(e) =>
                      setEditCompany({
                        ...editCompany,
                        maxEmployees: parseInt(e.target.value) || 500,
                      })
                    }
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {modalLoading ? 'Saving Changes...' : 'Update Tenant Specs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
