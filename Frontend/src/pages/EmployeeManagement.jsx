import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  Trash2,
  KeyRound,
  X,
  Building,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phoneNumber: '',
    department: 'Robotic Milling & Fabrication',
    designation: 'Technician',
    reportingManager: '',
    role: 'Employee',
    joiningDate: new Date().toISOString().split('T')[0],
    branchLocation: 'Main Plant',
  });

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, selectedDept, selectedRole, selectedStatus, currentPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
      });

      if (searchQuery) params.append('q', searchQuery);
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedRole !== 'ALL') params.append('role', selectedRole);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

      const response = await API.get(`/users?${params.toString()}`);
      if (response.data.success) {
        setEmployees(response.data.users);
        setTotalRecords(response.data.total);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAddSuccess(null);

    try {
      const res = await API.post('/users', formData);
      if (res.data.success) {
        setAddSuccess({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          activationLink: res.data.activationLink,
        });
        resetForm();
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setActionLoading(true);

    try {
      const res = await API.put(`/users/${selectedEmp._id}`, formData);
      if (res.data.success) {
        setShowEditModal(false);
        setSelectedEmp(null);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const targetStatus = emp.status === 'active' ? 'inactive' : 'active';
    if (
      !window.confirm(
        `Are you sure you want to change [${emp.name}] status to ${targetStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      const res = await API.patch(`/users/${emp._id}/status`, { status: targetStatus });
      if (res.data.success) {
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleSendResetInvite = async (emp) => {
    if (!window.confirm(`Send password reset email link to [${emp.email}]?`)) return;

    try {
      const res = await API.post(`/users/${emp._id}/reset-password-invite`);
      if (res.data.success) {
        alert(`Password reset link dispatched to ${emp.email}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reset link.');
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (
      !window.confirm(
        `DANGER: Are you sure you want to PERMANENTLY DELETE employee [${emp.name}] (${emp.employeeId})?`
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(`/users/${emp._id}`);
      if (res.data.success) {
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const openAddModal = () => {
    resetForm();
    setAddSuccess(null);
    setShowAddModal(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      email: emp.email || '',
      phoneNumber: emp.phoneNumber || '',
      department: emp.department || 'General Assembly',
      designation: emp.designation || 'Staff',
      reportingManager: emp.reportingManager?._id || '',
      role: emp.role || 'Employee',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
      branchLocation: emp.branchLocation || 'Main Plant',
    });
    setShowEditModal(true);
  };

  const openViewModal = (emp) => {
    setSelectedEmp(emp);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phoneNumber: '',
      department: 'Robotic Milling & Fabrication',
      designation: 'Technician',
      reportingManager: '',
      role: 'Employee',
      joiningDate: new Date().toISOString().split('T')[0],
      branchLocation: 'Main Plant',
    });
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  const rolesList = [
    'Company Admin',
    'HR',
    'Manager',
    'Assistant Manager',
    'Production Manager',
    'Team Leader',
    'Employee',
  ];

  const departmentsList = [
    'Executive Management',
    'Human Resources',
    'Robotic Milling & Fabrication',
    'Shop Floor & Line Production',
    'Quality Control & Assurance',
    'Supply Chain & Warehousing',
    'General Assembly',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Company Workforce Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">User &amp; Role Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage plant employees, role-based access control (RBAC), team managers, and email onboarding.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(user?.role) && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee / Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Name, ID, Email, Phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Department */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 font-semibold">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 font-semibold">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              {rolesList.map((r) => (
                <option key={r} value={r} className="bg-slate-900">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
              <option value="pending_invitation" className="bg-slate-900">Pending Invite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Employee Data Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Employee Directory Roster</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Total: {totalRecords} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Emp ID</th>
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Department &amp; Designation</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Reporting Manager</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Loading Employee Records...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No employees found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Employee ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {emp.employeeId || 'N/A'}
                    </td>

                    {/* Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                      {emp.phoneNumber && (
                        <div className="text-[10px] text-slate-500">{emp.phoneNumber}</div>
                      )}
                    </td>

                    {/* Department & Designation */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{emp.department}</div>
                      <div className="text-[11px] text-slate-400">{emp.designation}</div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 text-[11px]">
                        {emp.role}
                      </span>
                    </td>

                    {/* Reporting Manager */}
                    <td className="py-3.5 px-4">
                      {emp.reportingManager ? (
                        <div>
                          <div className="font-medium text-slate-200">{emp.reportingManager.name}</div>
                          <div className="text-[10px] text-slate-500">{emp.reportingManager.role}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">Self / Top Head</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {emp.status === 'active' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      )}
                      {emp.status === 'inactive' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Inactive
                        </span>
                      )}
                      {emp.status === 'pending_invitation' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Pending Invite
                        </span>
                      )}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {emp.joiningDate
                        ? new Date(emp.joiningDate).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {/* View Profile */}
                      <button
                        onClick={() => openViewModal(emp)}
                        title="View Full Profile"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Profile */}
                      {['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(user?.role) && (
                        <button
                          onClick={() => openEditModal(emp)}
                          title="Edit Profile"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Password Reset Email Link */}
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <button
                          onClick={() => handleSendResetInvite(emp)}
                          title="Send Password Reset Email"
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Toggle Active / Inactive */}
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'active'
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      {['Super Admin', 'Company Admin', 'HR'].includes(user?.role) && (
                        <button
                          onClick={() => handleDeleteEmployee(emp)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{employees.length}</span> of{' '}
            <span className="font-semibold text-white">{totalRecords}</span> employees
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-semibold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Add New Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Add Employee &amp; Dispatch One-Time Invitation</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addSuccess ? (
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>Employee Invitation Email Dispatched!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Account created for <strong className="text-white">{addSuccess.name}</strong> (
                  <strong className="text-blue-300">{addSuccess.email}</strong>). An activation email with one-time password setup link was sent via Nodemailer.
                </p>
                <div className="pt-2 border-t border-blue-800/40">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">
                    Direct One-Time Activation Link (for Dev Testing):
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-blue-400 break-all font-mono">
                    <a href={addSuccess.activationLink} target="_blank" rel="noreferrer" className="underline">
                      {addSuccess.activationLink}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => setAddSuccess(null)}
                  className="w-full mt-2 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Add Another Employee
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddEmployee} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Employee ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Auto generated if empty"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Miller"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+1 (555) 019-2831"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Assign Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {rolesList.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {departmentsList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. CNC Machine Technician"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Reporting Manager</label>
                    <select
                      value={formData.reportingManager}
                      onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="">No Direct Manager (Top Level)</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold">Plant / Branch Location</label>
                    <input
                      type="text"
                      value={formData.branchLocation}
                      onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
                      placeholder="Detroit Assembly Plant"
                      className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                  >
                    {actionLoading ? 'Creating & Sending Email...' : 'Dispatch Invitation Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Edit Employee */}
      {showEditModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Edit Employee Profile [{selectedEmp.employeeId}]</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Reporting Manager</label>
                  <select
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">No Direct Manager (Top Level)</option>
                    {employees
                      .filter((e) => e._id !== selectedEmp._id)
                      .map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Plant / Branch Location</label>
                  <input
                    type="text"
                    value={formData.branchLocation}
                    onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
                >
                  {actionLoading ? 'Saving...' : 'Update Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Employee Profile View */}
      {showViewModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <span>Employee Profile Card</span>
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Header */}
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20">
                {selectedEmp.name ? selectedEmp.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">{selectedEmp.name}</h4>
                <p className="text-xs text-blue-400 font-mono font-bold">{selectedEmp.employeeId}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 text-[10px]">
                  {selectedEmp.role}
                </span>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email:
                </span>
                <span className="font-mono text-slate-200">{selectedEmp.email}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone:
                </span>
                <span className="font-mono text-slate-200">{selectedEmp.phoneNumber || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Department:
                </span>
                <span className="font-semibold text-slate-200">{selectedEmp.department}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Designation:
                </span>
                <span className="font-semibold text-slate-200">{selectedEmp.designation}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Reporting Manager:
                </span>
                <span className="font-semibold text-slate-200">
                  {selectedEmp.reportingManager ? selectedEmp.reportingManager.name : 'Self / Executive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Branch / Location:
                </span>
                <span className="font-semibold text-slate-200">{selectedEmp.branchLocation || 'Main Plant'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Joining Date:
                </span>
                <span className="font-mono text-slate-200">
                  {selectedEmp.joiningDate ? new Date(selectedEmp.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
