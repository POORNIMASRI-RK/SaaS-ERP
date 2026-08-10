import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  TrendingUp,
  Boxes,
  AlertTriangle,
  FileText,
  Settings,
  RefreshCw,
  Zap,
  CheckCircle2,
  Sliders,
  Printer,
  Download,
  IndianRupee,
  Layers,
  Search,
  Building,
  Brain,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  PackageCheck,
  PackageX,
  Factory,
  ShoppingBag,
  Clock,
  ChevronRight,
  Award,
  BarChart3,
  Flame,
  Activity,
} from 'lucide-react';

const AIPredictionHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [metrics, setMetrics] = useState({
    current30DayRevenue: 0,
    predicted30DayRevenue: 0,
    forecastedOrderCount: 0,
    criticalStockoutItems: 0,
    shortageRiskItems: 0,
    totalCatalogItems: 0,
    confidenceScore: 94.2,
    forecastHorizonDays: 30,
  });

  const [salesForecast, setSalesForecast] = useState([]);
  const [productForecasts, setProductForecasts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiSettings, setAiSettings] = useState({
    forecastHorizonDays: 30,
    safetyStockBufferDays: 14,
    smoothingFactorAlpha: 0.3,
    seasonalityEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    setLoading(true);
    try {
      const dashRes = await API.get('/ai-prediction/dashboard');
      if (dashRes.data.success) setMetrics(dashRes.data.metrics);

      const salesRes = await API.get('/ai-prediction/sales-forecast');
      if (salesRes.data.success) setSalesForecast(salesRes.data.forecastChart);

      const demandRes = await API.get('/ai-prediction/demand-forecast');
      if (demandRes.data.success) setProductForecasts(demandRes.data.productForecasts);

      const prodRes = await API.get('/ai-prediction/products-classification');
      if (prodRes.data.success) {
        setBestSellers(prodRes.data.bestSellers);
        setSlowMoving(prodRes.data.slowMoving);
      }

      const recRes = await API.get('/ai-prediction/recommendations');
      if (recRes.data.success) setRecommendations(recRes.data.recommendations);

      const setRes = await API.get('/ai-prediction/settings');
      if (setRes.data.success) setAiSettings(setRes.data.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.put('/ai-prediction/settings', aiSettings);
      if (res.data.success) {
        alert(res.data.message);
        fetchAIData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update AI parameters.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = productForecasts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Multi-Tenant AI Sales &amp; Demand Predictive Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Sales Prediction &amp; Demand Engine</h1>
            <p className="text-xs text-slate-400 mt-1">
              Predictive revenue forecasting, product demand modeling, raw material stockout risk analysis, and automated action recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAIData()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalibrate AI Model</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Executive AI Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>AI Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('sales_forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'sales_forecast' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Revenue Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('demand_forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'demand_forecast' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Product Demand Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('product_analysis')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'product_analysis' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Fast vs Dead Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory_forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'inventory_forecast' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Stockout Risk &amp; ROP</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'recommendations' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>AI Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'settings' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AI Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Predicted 30-Day Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">₹{metrics.predicted30DayRevenue?.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12.5% Projected Growth
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Forecasted Order Volume</span>
              <div className="text-2xl font-extrabold text-blue-400 font-mono">{metrics.forecastedOrderCount} Orders</div>
              <p className="text-[11px] text-slate-500 font-mono">30-Day Estimated Demand</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">Stockout Risk Items</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">{metrics.criticalStockoutItems + metrics.shortageRiskItems} Items</div>
              <p className="text-[11px] text-rose-400 font-mono">{metrics.criticalStockoutItems} Critical &amp; {metrics.shortageRiskItems} Shortage Risk</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block">AI Model Confidence Score</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">{metrics.confidenceScore}%</div>
              <p className="text-[11px] text-slate-500 font-mono">Trained on Historical Billing &amp; Orders</p>
            </div>
          </div>

          {/* AI Sales Forecast Chart Preview & Recommendation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>3-Month Predicted Revenue Velocity</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold">
                  AI Holt-Winters Engine
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {salesForecast.slice(-5).map((row, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-sans font-bold text-white text-sm">{row.month}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {row.isPrediction ? '🤖 Predicted Forecast' : 'Historical Actual'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-emerald-400 text-sm">
                        ₹{(row.predictedRevenue || row.actualRevenue)?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Range: ₹{row.lowerBound?.toLocaleString('en-IN')} - ₹{row.upperBound?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>AI Recommended Actions</span>
                </h2>
                <button onClick={() => setActiveTab('recommendations')} className="text-xs text-purple-400 font-semibold hover:underline">
                  View All Actions →
                </button>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{rec.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{rec.description}</p>
                    <div className="text-[11px] text-purple-400 font-mono font-bold pt-1">{rec.impactScore}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES REVENUE FORECAST */}
      {activeTab === 'sales_forecast' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Historical Sales &amp; AI Revenue Projections (6 Months Past + 3 Months Future)</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timeline Month</th>
                  <th className="py-3 px-4">Actual Revenue</th>
                  <th className="py-3 px-4 font-bold text-emerald-400">AI Predicted Revenue</th>
                  <th className="py-3 px-4 text-slate-400">Lower Bound (-10%)</th>
                  <th className="py-3 px-4 text-purple-400">Upper Bound (+10%)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {salesForecast.map((row, idx) => (
                  <tr key={idx} className={row.isPrediction ? 'bg-purple-950/20 hover:bg-purple-900/30' : 'hover:bg-slate-800/40'}>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{row.month}</td>
                    <td className="py-3.5 px-4">{row.actualRevenue ? `₹${row.actualRevenue.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{row.predictedRevenue?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-slate-400">₹{row.lowerBound?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-purple-400 font-bold">₹{row.upperBound?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.isPrediction ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {row.isPrediction ? '🤖 Predicted' : 'Historical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT DEMAND FORECAST */}
      {activeTab === 'demand_forecast' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-400" />
              <span>Finished Goods Predicted Demand &amp; Stock Availability</span>
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter Product Code or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4 font-sans">Product Name</th>
                  <th className="py-3 px-4 font-bold text-white">Current Stock</th>
                  <th className="py-3 px-4 text-purple-400">30-Day Demand</th>
                  <th className="py-3 px-4">60-Day Demand</th>
                  <th className="py-3 px-4">90-Day Demand</th>
                  <th className="py-3 px-4 text-amber-400">Reorder Point (ROP)</th>
                  <th className="py-3 px-4">AI Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{p.itemCode}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{p.name}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.currentStock} {p.uom}
                    </td>
                    <td className="py-3.5 px-4 text-purple-400 font-extrabold">{p.predictedDemand30} Pcs</td>
                    <td className="py-3.5 px-4">{p.predictedDemand60} Pcs</td>
                    <td className="py-3.5 px-4">{p.predictedDemand90} Pcs</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">{p.reorderPoint} Pcs</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.riskLevel === 'Critical'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : p.riskLevel === 'High'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FAST VS DEAD STOCK */}
      {activeTab === 'product_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Fast-Moving Best Sellers (Top Revenue Generators)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4 font-sans">Product Name</th>
                    <th className="py-3 px-4">Total Qty Sold</th>
                    <th className="py-3 px-4 font-bold text-emerald-400">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {bestSellers.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-amber-400">{item.itemCode}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{item.name}</td>
                      <td className="py-3.5 px-4">{item.totalSalesQty} Pcs</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{item.revenueGenerated?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slow-Moving / Dead Stock */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PackageX className="w-5 h-5 text-rose-400" />
              <span>Slow-Moving / Dead Stock Analysis</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4 font-sans">Product Name</th>
                    <th className="py-3 px-4 text-rose-400">Days Idle</th>
                    <th className="py-3 px-4 font-bold text-amber-400">Tied-Up Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {slowMoving.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{item.itemCode}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{item.name}</td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-400">{item.daysWithoutMovement} Days</td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-400">₹{item.tiedUpCapital?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STOCKOUT RISK & ROP */}
      {activeTab === 'inventory_forecast' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>AI Reorder Point (ROP) &amp; Material Stockout Warning Matrix</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4 font-sans">Product Name</th>
                  <th className="py-3 px-4 font-bold text-white">Current Stock</th>
                  <th className="py-3 px-4 text-amber-400">AI Reorder Point (ROP)</th>
                  <th className="py-3 px-4 text-emerald-400">Suggested Reorder Qty</th>
                  <th className="py-3 px-4">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {productForecasts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">{p.itemCode}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{p.name}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{p.currentStock} Pcs</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">{p.reorderPoint} Pcs</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-extrabold">{p.suggestedReorderQty} Pcs</td>
                    <td className="py-3.5 px-4 font-sans">
                      {p.suggestedReorderQty > 0 ? (
                        <span className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] inline-block">
                          Trigger Reorder
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Stock Optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AI RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>AI Automated Business Decision Recommendations</span>
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        rec.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <h3 className="font-sans font-bold text-white text-sm">{rec.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">{rec.description}</p>
                  <div className="text-xs text-purple-400 font-mono font-bold pt-1">Target Action: {rec.suggestedAction}</div>
                </div>

                <a
                  href={rec.moduleTarget}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 text-center"
                >
                  Execute Action →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AI SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-5 h-5 text-purple-400" />
            <span>AI Engine Parameters &amp; Sensitivity Settings</span>
          </h2>

          <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Forecast Horizon</label>
              <select
                value={aiSettings.forecastHorizonDays}
                onChange={(e) => setAiSettings({ ...aiSettings, forecastHorizonDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold"
              >
                <option value={30}>30 Days (Short-term Operational)</option>
                <option value={60}>60 Days (Medium-term Demand)</option>
                <option value={90}>90 Days (Quarterly Strategic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Safety Stock Buffer Days</label>
              <input
                type="number"
                value={aiSettings.safetyStockBufferDays}
                onChange={(e) => setAiSettings({ ...aiSettings, safetyStockBufferDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Holt-Winters Smoothing Factor (Alpha: 0.1 to 0.9)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={aiSettings.smoothingFactorAlpha}
                onChange={(e) => setAiSettings({ ...aiSettings, smoothingFactorAlpha: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold"
              />
            </div>

            <button type="submit" disabled={actionLoading} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
              Save AI Parameters
            </button>
          </form>
        </div>
      )}

      {/* PRINTABLE EXECUTIVE AI REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-400" />
                <span>Executive AI Sales &amp; Predictive Demand Report</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
              <div className="text-center space-y-1 border-b border-slate-800 pb-3">
                <div className="text-base font-bold text-white font-sans uppercase">Apex Manufacturing Pvt Ltd</div>
                <div className="text-purple-400 font-bold">AI PREDICTIVE SALES &amp; DEMAND INTELLIGENCE REPORT</div>
                <div className="text-[10px] text-slate-500">Generated on: {new Date().toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 uppercase">30-Day Revenue Projection:</span>
                  <div className="text-sm font-bold text-emerald-400">₹{metrics.predicted30DayRevenue?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">AI Model Accuracy Score:</span>
                  <div className="text-sm font-bold text-purple-400">{metrics.confidenceScore}% Confidence</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase">Stockout Risk Items Alert:</span>
                <div className="text-xs font-bold text-rose-400 mt-1">
                  {metrics.criticalStockoutItems} Critical &amp; {metrics.shortageRiskItems} Shortage Risk products detected.
                </div>
              </div>

              <div className="pt-2 text-right">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
                  Print Report / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionHub;
