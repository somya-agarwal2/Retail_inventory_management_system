import React, { useState, useEffect } from 'react';
import { returnsApi, locationsApi } from '../services/api';
import { ReturnOrder, Warehouse, Store } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { RotateCcw, Plus, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Returns: React.FC = () => {
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Disposition Processing Modal
  const [processingReturn, setProcessingReturn] = useState<ReturnOrder | null>(null);
  const [disposition, setDisposition] = useState<'RESTOCK' | 'SCRAP' | 'REFURBISH' | 'RETURN_TO_VENDOR'>('RESTOCK');
  const [restockLocationType, setRestockLocationType] = useState<'WAREHOUSE' | 'STORE'>('WAREHOUSE');
  const [restockLocationId, setRestockLocationId] = useState<number>(1);
  const [inspectionNotes, setInspectionNotes] = useState<string>('Item in unopened original packaging; verified eligible for resale');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [retRes, whData, storeData] = await Promise.all([
        returnsApi.getAll(),
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
      ]);
      setReturns(retRes.content || []);
      setWarehouses(whData);
      setStores(storeData);
    } catch (err) {
      console.error('Failed to load returns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingReturn) return;
    setSubmitting(true);
    try {
      await returnsApi.processDisposition(processingReturn.id, {
        disposition,
        restockLocationType,
        restockLocationId,
        notes: inspectionNotes,
      });
      setProcessingReturn(null);
      loadAllData();
    } catch (err: any) {
      alert(`Failed to process return disposition: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <RotateCcw className="w-6 h-6 mr-2 text-brand-600" />
            Customer Returns & RMA Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize return merchandise agreements (RMA), conduct defect inspections, and automate restock into inventory.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">RMA #</th>
                <th className="py-3 px-4">Original Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4 text-center">Disposition</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading Returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No return merchandise authorizations filed.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {r.rmaNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {r.orderNumber || `ORD-${r.orderId}`}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.customerName || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.reason}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${r.refundAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {r.disposition || 'PENDING INSPECTION'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={r.status} type="return" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status !== 'RESTOCKED' && r.status !== 'REFUNDED' && (
                        <button
                          onClick={() => setProcessingReturn(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded transition-colors"
                        >
                          Process RMA
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

      {/* Disposition Modal */}
      {processingReturn && (
        <Modal
          isOpen={!!processingReturn}
          onClose={() => setProcessingReturn(null)}
          title={`Process Return Disposition: ${processingReturn.rmaNumber}`}
          subtitle="Determine inventory disposition and issue customer refund authorization"
          maxWidth="md"
        >
          <form onSubmit={handleProcessDisposition} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Product Disposition Decision *
              </label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="RESTOCK">Restock into Inventory (Eligible for Resale)</option>
                <option value="SCRAP">Scrap / Write-off (Damaged beyond repair)</option>
                <option value="REFURBISH">Send to Technical Refurbishment</option>
                <option value="RETURN_TO_VENDOR">Return to Vendor (Warranty Claim)</option>
              </select>
            </div>

            {disposition === 'RESTOCK' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 uppercase">Restock Facility</label>
                  <select
                    value={restockLocationType}
                    onChange={(e) => setRestockLocationType(e.target.value as any)}
                    className="mt-1 w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                  >
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="STORE">Retail Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900 uppercase">Location</label>
                  <select
                    value={restockLocationId}
                    onChange={(e) => setRestockLocationId(Number(e.target.value))}
                    className="mt-1 w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                  >
                    {restockLocationType === 'WAREHOUSE'
                      ? warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))
                      : stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Inspection Quality Notes</label>
              <textarea
                rows={2}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProcessingReturn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                {submitting ? 'Processing...' : 'Complete Disposition'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
