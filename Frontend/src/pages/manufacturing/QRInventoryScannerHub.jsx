import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Scan,
  Printer,
  Boxes,
  Layers,
  History,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  Building,
  Package,
  Clock,
  UserCheck,
} from 'lucide-react';

// Real Scannable QR Code Graphic Component
const QRCodeGraphic = ({ value, size = 160 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value || 'QR-CODE-DEFAULT'
  )}&margin=10`;

  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block shadow-sm">
      <img
        src={qrUrl}
        alt={`Scannable QR Code ${value}`}
        width={size}
        height={size}
        className="mx-auto block rounded"
        loading="eager"
      />
    </div>
  );
};

const QRInventoryScannerHub = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('scanner');

  // Scanner Form State
  const [scanForm, setScanForm] = useState({
    qrPayload: '',
    itemId: '',
    actionType: 'STOCK_RECEIVING',
    qtyScanned: 10,
    sourceLocation: 'Main Receiving Dock',
    destinationLocation: 'Rack A-12 Main Warehouse',
    notes: 'GRN stock receipt scanned',
  });

  // Modals state
  const [selectedItemForLabel, setSelectedItemForLabel] = useState(null);
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);

  const [selectedItemForTrace, setSelectedItemForTrace] = useState(null);
  const [traceabilityTimeline, setTraceabilityTimeline] = useState([]);

  useEffect(() => {
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    setLoading(true);
    try {
      const [itemRes, logRes] = await Promise.all([
        API.get('/manufacturing/inventory/items'),
        API.get('/qr-tracking/logs'),
      ]);

      if (itemRes.data.success) {
        setItems(itemRes.data.items || []);
        if (itemRes.data.items?.length > 0 && !scanForm.itemId) {
          setScanForm((prev) => ({
            ...prev,
            itemId: itemRes.data.items[0]._id,
            qrPayload: itemRes.data.items[0].qrCode || `QR-${itemRes.data.items[0].itemCode}-BATCH001`,
          }));
        }
      }

      if (logRes.data.success) {
        setLogs(logRes.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessScan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.post('/qr-tracking/scan', scanForm);
      if (res.data.success) {
        alert(res.data.message);
        fetchQRData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'QR Scan processing failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewTraceability = async (item) => {
    setSelectedItemForTrace(item);
    setActiveTab('traceability');
    try {
      const res = await API.get(`/qr-tracking/items/${item._id}/traceability`);
      if (res.data.success) {
        setTraceabilityTimeline(res.data.traceabilityTimeline || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              <span>Multi-Tenant Smart Warehouse &amp; Barcode System</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">QR Barcode Tracking &amp; Inventory Scanner</h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time QR barcode scanning, stock receiving, production issues, batch movements, and printable barcode labels.
            </p>
          </div>

          <button
            onClick={() => fetchQRData()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Scan Feed</span>
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'scanner' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Barcode Scanner &amp; Movement</span>
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'labels' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Printable QR Barcode Labels</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Live Audit Scan Logs</span>
        </button>
      </div>

      {/* TAB 1: SCANNER & STOCK MOVEMENT */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Console Form */}
          <form onSubmit={handleProcessScan} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Scan className="w-5 h-5 text-blue-400" />
              <span>Smart Barcode Inventory Terminal</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Inventory Item</label>
              <select
                value={scanForm.itemId}
                onChange={(e) => {
                  const it = items.find((i) => i._id === e.target.value);
                  setScanForm({
                    ...scanForm,
                    itemId: e.target.value,
                    qrPayload: it ? it.qrCode || `QR-${it.itemCode}-BATCH001` : '',
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs"
              >
                {items.map((it) => (
                  <option key={it._id} value={it._id}>
                    {it.name} ({it.itemCode}) - Stock: {it.totalStock} {it.uom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">QR Code Barcode Payload String</label>
              <input
                type="text"
                required
                value={scanForm.qrPayload}
                onChange={(e) => setScanForm({ ...scanForm, qrPayload: e.target.value })}
                placeholder="e.g. QR-SP-SEAL-50-BATCH2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Scan Action Type</label>
                <select
                  value={scanForm.actionType}
                  onChange={(e) => setScanForm({ ...scanForm, actionType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="STOCK_RECEIVING">STOCK_RECEIVING (Goods Inward)</option>
                  <option value="PRODUCTION_CONSUMPTION">PRODUCTION_CONSUMPTION (Issue to Floor)</option>
                  <option value="STOCK_ISSUE">STOCK_ISSUE (Material Dispatch)</option>
                  <option value="DISPATCH">DISPATCH (Customer Shipping)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Quantity Scanned</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={scanForm.qtyScanned}
                  onChange={(e) => setScanForm({ ...scanForm, qtyScanned: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Source Location</label>
                <input
                  type="text"
                  value={scanForm.sourceLocation}
                  onChange={(e) => setScanForm({ ...scanForm, sourceLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Destination Location</label>
                <input
                  type="text"
                  value={scanForm.destinationLocation}
                  onChange={(e) => setScanForm({ ...scanForm, destinationLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Scan Notes</label>
              <input
                type="text"
                value={scanForm.notes}
                onChange={(e) => setScanForm({ ...scanForm, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Execute QR Stock Movement</span>
            </button>
          </form>

          {/* Quick Item List & Generate QR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Boxes className="w-5 h-5 text-blue-400" />
              <span>Active Inventory Products &amp; QR Codes</span>
            </h2>

            <div className="space-y-3 font-mono">
              {items.map((it) => (
                <div key={it._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-sans font-bold text-white text-xs">{it.name}</div>
                    <div className="text-[11px] text-blue-400 font-bold">{it.itemCode} • Location: {it.warehouseLocation || 'Main Dock'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewTraceability(it)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Traceability
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItemForLabel(it);
                        setShowPrintLabelModal(true);
                      }}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Label
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR LABELS GENERATOR */}
      {activeTab === 'labels' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <span>Printable QR Barcode Labels Directory</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
            {items.map((it) => {
              const qrPayload = it.qrCode || `QR:${it.itemCode}`;
              return (
                <div key={it._id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center">
                  <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                    {/* Real Scannable Graphical QR Code */}
                    <QRCodeGraphic value={qrPayload} size={140} />
                  </div>

                  <div>
                    <div className="font-sans font-bold text-white text-sm">{it.name}</div>
                    <div className="text-xs text-blue-400 font-bold mt-0.5">{it.itemCode}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Batch: {it.batchNo || 'BATCH-2026-001'}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemForLabel(it);
                      setShowPrintLabelModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Label
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SCAN LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Live Audit Trail QR Scan Log Entries</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">QR Payload</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Scanned Qty</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">{log.qrPayload}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">{log.qtyScanned} Pcs</td>
                    <td className="py-3.5 px-4">{log.destinationLocation}</td>
                    <td className="py-3.5 px-4 font-sans">{log.scannedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ITEM TRACEABILITY TIMELINE */}
      {activeTab === 'traceability' && selectedItemForTrace && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">End-to-End Product Traceability</span>
              <h2 className="text-xl font-bold text-white">{selectedItemForTrace.name} ({selectedItemForTrace.itemCode})</h2>
            </div>
            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400">
              Current Stock: {selectedItemForTrace.totalStock} {selectedItemForTrace.uom}
            </span>
          </div>

          <div className="space-y-4 font-mono">
            {traceabilityTimeline.map((step, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold">
                  #{idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{step.actionType}</span>
                    <span className="text-[10px] text-slate-500">{new Date(step.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans">{step.notes}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">Scanned Qty: {step.qtyScanned} Pcs • Destination: {step.destinationLocation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE QR LABEL MODAL WITH GRAPHICAL SCANNABLE QR CODE */}
      {showPrintLabelModal && selectedItemForLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center print:border-none print:shadow-none print:bg-white text-slate-100 print:text-black">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <h3 className="text-sm font-bold text-white">Print QR Barcode Label</h3>
              <button onClick={() => setShowPrintLabelModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl inline-block shadow-xl border border-slate-200 space-y-3 print:border-slate-300">
              {/* Graphical Scannable QR Code */}
              <QRCodeGraphic value={selectedItemForLabel.qrCode || `QR:${selectedItemForLabel.itemCode}`} size={160} />

              <div className="space-y-1">
                <div className="text-slate-900 font-extrabold font-sans text-sm">{selectedItemForLabel.name}</div>
                <div className="text-blue-700 font-mono font-bold text-xs">{selectedItemForLabel.itemCode}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Batch: {selectedItemForLabel.batchNo || 'BATCH-2026-001'} | Loc: {selectedItemForLabel.warehouseLocation || 'Rack A-1'}
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 print:hidden cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Barcode Label</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRInventoryScannerHub;
