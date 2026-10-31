import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { inventoryApi, locationsApi, productsApi } from '../services/api';
import { InventoryItem, Warehouse, Store, Product } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('isLowStock') === 'true';

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedLocationType, setSelectedLocationType] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [isLowStock, setIsLowStock] = useState<boolean>(initialLowStock);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Quick Stock Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [newActualStock, setNewActualStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('CYCLE_COUNT_DISCREPANCY');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<boolean>(false);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [selectedLocationType, selectedLocationId, isLowStock, page]);

  const loadLocations = async () => {
    try {
      const [whData, storeData] = await Promise.all([
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
      ]);
      setWarehouses(whData);
      setStores(storeData);
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getOverview({
        locationType: selectedLocationType || undefined,
        locationId: selectedLocationId,
        isLowStock: isLowStock ? true : undefined,
        page,
        size: 15,
      });
      setInventory(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setNewActualStock(item.currentStock);
    setAdjustReason('CYCLE_COUNT_DISCREPANCY');
    setAdjustNotes('');
    setAdjustError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    setAdjusting(true);
    setAdjustError(null);
    try {
      await inventoryApi.adjustStock({
        productId: adjustItem.productId,
        locationType: adjustItem.locationType,
        locationId: adjustItem.locationId,
        newActualStock: Number(newActualStock),
        reason: adjustReason,
        notes: adjustNotes || 'Audit count adjustment',
      });
      setAdjustItem(null);
      loadInventory();
    } catch (err: any) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Multi-Location Inventory Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time atomic stock balances across 3 distribution hubs and 5 retail flagship stores.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/inventory/stock-in"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4 mr-1.5" />
            Stock-In (Receipt)
          </Link>

          <Link
            to="/inventory/stock-out"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Stock-Out (Dispatch)
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedLocationType}
            onChange={(e) => {
              setSelectedLocationType(e.target.value);
              setSelectedLocationId(undefined);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
          >
            <option value="">All Locations (Warehouses & Stores)</option>
            <option value="WAREHOUSE">Warehouses Only</option>
            <option value="STORE">Retail Stores Only</option>
          </select>

          {selectedLocationType === 'WAREHOUSE' && (
            <select
              value={selectedLocationId || ''}
              onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="">Select Specific Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          )}

          {selectedLocationType === 'STORE' && (
            <select
              value={selectedLocationId || ''}
              onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="">Select Specific Store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={isLowStock}
              onChange={(e) => setIsLowStock(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span className="flex items-center text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Low Stock Alerts Only
            </span>
          </label>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing {inventory.length} live ledger balances
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">On-Hand</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Safety Point</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading Real-time Ledger...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No inventory records match the selected location or filters.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-brand-700">{item.sku}</div>
                      <div className="text-[10px] text-slate-400">{item.barcode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">{item.categoryName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.locationName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {item.locationType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {item.currentStock}
                    </td>
                    <td className="py-3 px-4 text-center text-amber-600 font-medium">
                      {item.reservedStock}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          item.availableStock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : item.availableStock <= item.reorderPoint
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      Reorder: {item.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge
                        status={
                          item.currentStock <= 0
                            ? 'OUT_OF_STOCK'
                            : item.currentStock <= item.reorderPoint
                            ? 'LOW_STOCK'
                            : 'ACTIVE'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3 mr-1" />
                        Audit Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <Modal
          isOpen={!!adjustItem}
          onClose={() => setAdjustItem(null)}
          title="Physical Stock Adjustment"
          subtitle={`Adjust on-hand balance for ${adjustItem.productName} at ${adjustItem.locationName}`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            {adjustError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {adjustError}
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Current Recorded Stock:</span>
                <span className="font-bold text-slate-900">{adjustItem.currentStock} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Customer Reservations:</span>
                <span className="font-bold text-amber-600">{adjustItem.reservedStock} units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                New Actual Physical Count *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newActualStock}
                onChange={(e) => setNewActualStock(parseInt(e.target.value) || 0)}
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Reason for Adjustment *
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="CYCLE_COUNT_DISCREPANCY">Cycle Count Discrepancy</option>
                <option value="DAMAGED_IN_WAREHOUSE">Damaged Goods Written Off</option>
                <option value="EXPIRED_OBSOLETE">Expired / Obsolete Item</option>
                <option value="THEFT_SHRINKAGE">Unexplained Shrinkage / Loss</option>
                <option value="DATA_CORRECTION">Administrative Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Audit Notes / Investigation
              </label>
              <textarea
                rows={2}
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Details of audit or write-off approval..."
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjusting}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {adjusting ? 'Updating Ledger...' : 'Commit Adjustment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
