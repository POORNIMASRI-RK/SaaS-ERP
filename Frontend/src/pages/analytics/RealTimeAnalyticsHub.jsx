import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Boxes,
  Truck,
  Factory,
  Wrench,
  FileText,
  IndianRupee,
  Building,
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Search,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';

const RealTimeAnalyticsHub = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('30_days');
  const [department, setDepartment] = useState('All');
  const [warehouse, setWarehouse] = useState('All');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, department, warehouse]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/analytics/kpis?dateRange=${dateRange}&department=${encodeURIComponent(department)}&warehouse=${encodeURIComponent(warehouse)}`
      );
      if (res.data.success) {
        setKpis(res.data.kpis);
        setCharts(res.data.charts);
        setTimeline(res.data.operationalTimeline || []);
        if (res.data.warehouses?.length > 0) {
          setWarehousesList(res.data.warehouses);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (type) => {
    alert(`Exporting Real-Time Business Analytics Report as ${type.toUpperCase()}...`);
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-100">
      {/* Premium Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE TELEMETRY STREAMING</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Enterprise Operations &amp; Intelligence Analytics
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Real-time synchronization across workforce HRMS, manufacturing shopfloor velocity, inventory warehouse utilization, and B2B GST sales revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchAnalytics()}
              className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Live Feed</span>
            </button>

            <button
              onClick={() => handleExportReport('pdf')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Styled Interactive Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Interactive Analytics Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {/* Timeline Filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Timeline Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="today">Today (Live 24 Hours)</option>
                <option value="7_days">Last 7 Days</option>
                <option value="30_days">Last 30 Days</option>
                <option value="quarter">This Quarter (90 Days)</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department Sector</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Production">Production &amp; Assembly</option>
                <option value="Warehouse">Warehouse &amp; Logistics</option>
                <option value="Purchase">Procurement &amp; Supply Chain</option>
                <option value="HR">HRMS &amp; Workforce</option>
                <option value="Sales">Sales &amp; CRM</option>
                <option value="Finance">Finance &amp; Invoicing</option>
                <option value="Maintenance">Machine Maintenance</option>
              </select>
            </div>

            {/* Warehouse Filter */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Warehouse Facility</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Warehouse Facilities</option>
                {warehousesList.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.code || 'WH'})
                  </option>
                ))}
                {warehousesList.length === 0 && (
                  <>
                    <option value="Main">Main Raw Material Depot</option>
                    <option value="Finished">Finished Goods Hub</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* High-Impact Metric KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Workforce Attendance */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Workforce Attendance</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{kpis.todayAttendance} / {kpis.totalEmployees}</div>
              <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>{Math.round((kpis.todayAttendance / Math.max(1, kpis.totalEmployees)) * 100)}% Active Attendance Rate</span>
              </p>
            </div>
          </div>

          {/* Card 2: Production Orders */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Shopfloor Work Orders</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Factory className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{kpis.activeProductionOrders} Active</div>
              <p className="text-xs font-semibold text-amber-400 mt-1 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Shopfloor Velocity Operational</span>
              </p>
            </div>
          </div>

          {/* Card 3: Total Sales Revenue */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Invoiced Sales Revenue</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-400 font-mono">₹{kpis.salesRevenue?.toLocaleString('en-IN')}</div>
              <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GST Tax Invoiced Total</span>
              </p>
            </div>
          </div>

          {/* Card 4: Warehouse Stock & Space */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 shadow-xl transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Inventory &amp; Space Capacity</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{kpis.totalInventoryStock} Units</div>
              <p className="text-xs font-semibold text-purple-400 mt-1 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>{kpis.warehouseUtilizationPercent}% Space Utilization</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Operational Activity Timeline Stream & Machine Uptime Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Feed Column (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-base font-bold text-white">Live Departmental Operational Stream</h2>
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Live Audit Feed
            </span>
          </div>

          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <div key={item._id || idx} className="relative pl-6 border-l-2 border-slate-800 space-y-1">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 shadow-sm shadow-blue-500/50" />
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.description}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      {item.department}
                    </span>
                    <span className="text-emerald-400 font-bold uppercase">● {item.status}</span>
                  </div>
                </div>
              </div>
            ))}

            {timeline.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                No recent timeline telemetry entries recorded for the current filter set.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Machine Health & Plant Status Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>Plant Equipment &amp; Machine Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time CNC &amp; Assembly Machinery telemetry</p>
          </div>

          <div className="space-y-4 font-mono">
            {/* Running Machines */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-sans font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running Machines
                </span>
                <span className="text-base font-extrabold text-white">{kpis?.activeMachines || 8} Active</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
              </div>
            </div>

            {/* Under Maintenance */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-sans font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Maintenance / Service
                </span>
                <span className="text-base font-extrabold text-white">{kpis?.downtimeMachines || 1} Unit</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[12%]" />
              </div>
            </div>

            {/* Warehouse Utilization Gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-sans font-bold">Space Utilization</span>
                <span className="text-base font-extrabold text-purple-400">{kpis?.warehouseUtilizationPercent || 78.4}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${kpis?.warehouseUtilizationPercent || 78.4}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Production Velocity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-400" />
                <span>Production Target Completion Velocity</span>
              </h2>
              <span className="text-xs text-slate-400 font-sans">Completed vs Target</span>
            </div>

            <div className="space-y-4">
              {charts.productionTrends.map((row, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-bold text-white">{row.month}</span>
                    <span className="text-amber-400 font-bold">{row.completedUnits} / {row.targetUnits} Units</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (row.completedUnits / row.targetUnits) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Revenue Velocity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Monthly Invoiced Sales Revenue Velocity</span>
              </h2>
              <span className="text-xs text-slate-400 font-sans">Monthly Revenue Total</span>
            </div>

            <div className="space-y-4">
              {charts.salesTrends.map((row, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                  <span className="font-sans font-bold text-white text-xs">{row.month}</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹{row.revenue?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAnalyticsHub;
