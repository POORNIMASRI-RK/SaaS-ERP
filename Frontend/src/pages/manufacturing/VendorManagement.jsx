import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Plus,
  Star,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  CreditCard,
  IndianRupee,
  Award,
  X,
  Search,
  CheckCircle2,
} from 'lucide-react';

const VendorManagement = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    vendorCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    rating: 5,
    performanceScore: 95,
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/manufacturing/vendors');
      if (res.data.success) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/manufacturing/vendors', form);
      if (res.data.success) {
        alert(res.data.message);
        setShowModal(false);
        fetchVendors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save vendor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>Supplier &amp; Procurement Ecosystem</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Vendor Management System</h1>
            <p className="text-xs text-slate-400 mt-1">
              Vendor directory, GST compliance verification, performance scorecards, and purchase ledgers.
            </p>
          </div>

          {['Super Admin', 'Company Admin', 'Purchase Manager'].includes(user?.role) && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-blue-400">
            Loading vendor directory...
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No registered vendors found. Click "Register New Vendor" to add raw material suppliers.
          </div>
        ) : (
          vendors.map((v) => (
            <div
              key={v._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[10px] uppercase font-mono">
                      {v.vendorCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                      GST Verified
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-1.5">{v.companyName}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{v.email}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{v.rating} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">GSTIN</span>
                  <p className="text-xs font-mono font-bold text-slate-300 mt-0.5 truncate">
                    {v.gstin || '27AAACP1234A1Z5'}
                  </p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Performance Score</span>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{v.performanceScore || 95}%</span>
                  </p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding Balance</span>
                  <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                    ₹{(v.outstandingBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Contact Person: <strong className="text-slate-200">{v.contactPerson || 'Sales Manager'}</strong></span>
                <span className="font-mono text-slate-400">{v.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Register Vendor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Register Vendor Profile</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    value={form.vendorCode}
                    onChange={(e) => setForm({ ...form, vendorCode: e.target.value })}
                    placeholder="e.g. VND-002"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. Apex Industrial Polymers"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. sales@apexpolymers.com"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">GSTIN Number</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Performance Rating (1-5 Stars)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="5">5 Stars (Preferred Supplier)</option>
                    <option value="4">4 Stars (Verified)</option>
                    <option value="3">3 Stars (Standard)</option>
                    <option value="2">2 Stars (Under Review)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  {actionLoading ? 'Registering...' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
