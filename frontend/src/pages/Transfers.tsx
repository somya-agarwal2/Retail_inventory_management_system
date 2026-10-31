import React, { useState, useEffect } from 'react';
import { transfersApi, locationsApi, productsApi } from '../services/api';
import { StockTransfer, Warehouse, Store, Product } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  ArrowLeftRight,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  Building2,
  X,
  Package,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const Transfers: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Transfer Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<'WAREHOUSE' | 'STORE'>('WAREHOUSE');
  const [sourceId, setSourceId] = useState<number>(1);
  const [destType, setDestType] = useState<'WAREHOUSE' | 'STORE'>('STORE');
  const [destId, setDestId] = useState<number>(1);
  const [carrier, setCarrier] = useState<string>('BlueDart Logistics');
  const [notes, setNotes] = useState<string>('Retail store replenishment batch');
  const [transferItems, setTransferItems] = useState<{ productId: number; requestedQty: number }[]>([
    { productId: 1, requestedQty: 15 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [transRes, whData, storeData, prodData] = await Promise.all([
        transfersApi.getAll(),
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
        productsApi.getAll({ size: 100 }),
      ]);
      setTransfers(transRes.content || []);
      setWarehouses(whData);
      setStores(storeData);
      setProducts(prodData.content || []);
    } catch (err) {
      console.error('Failed to load transfers data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setTransferItems([...transferItems, { productId: products[0]?.id || 1, requestedQty: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...transferItems];
    updated[index] = { ...updated[index], [field]: value };
    setTransferItems(updated);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceType === destType && sourceId === destId) {
      setError('Source and Destination cannot be the exact same facility.');
      return;
    }

    setSubmitting(true);
    try {
      await transfersApi.create({
        sourceLocationType: sourceType,
        sourceLocationId: sourceId,
        destLocationType: destType,
        destLocationId: destId,
        carrier,
        notes,
        items: transferItems,
      });
      setIsModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transfer order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (transfer: StockTransfer, nextStatus: string) => {
    try {
      await transfersApi.updateStatus(transfer.id, nextStatus, `Updated to ${nextStatus}`);
      loadAllData();
    } catch (err: any) {
      alert(`Status transition failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ArrowLeftRight className="w-6 h-6 mr-2 text-brand-600" />
            Inter-Facility Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate replenishment between regional distribution hubs and retail flagship store locations.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Transfer Order
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Origin (Source)</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Items / Total Units</th>
                <th className="py-3 px-4">Carrier / Tracking</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading Transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transfer orders created yet.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => {
                  const totalUnits = (t.items || []).reduce((acc, curr) => acc + (curr.requestedQty || 0), 0);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-700">
                        {t.transferNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.sourceLocationName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{t.sourceLocationType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.destLocationName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{t.destLocationType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{t.items?.length || 0} SKUs</span>
                        <span className="text-slate-500 ml-1">({totalUnits} units)</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{t.carrier || 'Standard Freight'}</div>
                        <div className="text-[10px] font-mono text-slate-400">{t.trackingNumber || 'Pending'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {t.status === 'REQUESTED' && (
                          <button
                            onClick={() => handleAdvanceStatus(t, 'APPROVED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {t.status === 'APPROVED' && (
                          <button
                            onClick={() => handleAdvanceStatus(t, 'IN_TRANSIT')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                          >
                            Dispatch
                          </button>
                        )}
                        {t.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleAdvanceStatus(t, 'RECEIVED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                          >
                            Receive & Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Inter-Facility Transfer Order"
        subtitle="Initiate freight transfer of stock from one warehouse/store to another."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin Source */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Origin (Source Facility)
              </span>
              <select
                value={sourceType}
                onChange={(e) => {
                  const type = e.target.value as 'WAREHOUSE' | 'STORE';
                  setSourceType(type);
                  setSourceId(type === 'WAREHOUSE' ? warehouses[0]?.id || 1 : stores[0]?.id || 1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="WAREHOUSE">Warehouse</option>
                <option value="STORE">Store</option>
              </select>

              <select
                value={sourceId}
                onChange={(e) => setSourceId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {sourceType === 'WAREHOUSE'
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

            {/* Destination */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                2. Destination Facility
              </span>
              <select
                value={destType}
                onChange={(e) => {
                  const type = e.target.value as 'WAREHOUSE' | 'STORE';
                  setDestType(type);
                  setDestId(type === 'WAREHOUSE' ? warehouses[0]?.id || 1 : stores[0]?.id || 1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="STORE">Retail Store</option>
                <option value="WAREHOUSE">Warehouse</option>
              </select>

              <select
                value={destId}
                onChange={(e) => setDestId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {destType === 'WAREHOUSE'
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

          {/* Transfer Items List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">
                Transfer Merchandise Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transferItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <select
                    value={item.productId}
                    onChange={(e) => handleUpdateItem(idx, 'productId', Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.requestedQty}
                    onChange={(e) => handleUpdateItem(idx, 'requestedQty', parseInt(e.target.value) || 1)}
                    className="w-24 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold"
                    placeholder="Units"
                  />

                  {transferItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Freight Logistics Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating Transfer...' : 'Initiate Transfer Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
