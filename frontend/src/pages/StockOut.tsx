import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, productsApi, locationsApi } from '../services/api';
import { Product, Warehouse, Store, InventoryItem } from '../types';
import {
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Package,
  ShieldAlert,
} from 'lucide-react';

export const StockOut: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [productId, setProductId] = useState<number>(1);
  const [locationType, setLocationType] = useState<'WAREHOUSE' | 'STORE'>('WAREHOUSE');
  const [locationId, setLocationId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('STORE_TRANSFER');
  const [notes, setNotes] = useState<string>('Stock dispatch for retail replenishment');

  // Live Inventory Balance Check
  const [currentAvailableStock, setCurrentAvailableStock] = useState<number>(0);
  const [checkingStock, setCheckingStock] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchStockBalance();
  }, [productId, locationType, locationId]);

  const loadData = async () => {
    try {
      const [prodRes, whRes, storeRes] = await Promise.all([
        productsApi.getAll({ size: 100 }),
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
      ]);
      setProducts(prodRes.content || []);
      setWarehouses(whRes || []);
      setStores(storeRes || []);

      if (prodRes.content && prodRes.content.length > 0) {
        setProductId(prodRes.content[0].id);
      }
      if (whRes && whRes.length > 0) {
        setLocationId(whRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load stock out data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockBalance = async () => {
    setCheckingStock(true);
    try {
      const res = await inventoryApi.getOverview({
        productId,
        locationType,
        locationId,
        size: 1,
      });
      if (res.content && res.content.length > 0) {
        setCurrentAvailableStock(res.content[0].availableStock);
      } else {
        setCurrentAvailableStock(0);
      }
    } catch (err) {
      setCurrentAvailableStock(0);
    } finally {
      setCheckingStock(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend zero-negative check
    if (quantity > currentAvailableStock) {
      setError(
        `Insufficient Stock! Requested quantity (${quantity}) exceeds currently available stock (${currentAvailableStock} units). System strictly forbids negative stock.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.stockOut({
        productId,
        locationType,
        locationId,
        quantity: Number(quantity),
        reason,
        notes,
      });

      setSuccess(
        `Successfully dispatched ${quantity} units! Remaining balance at ${res.locationName} is ${res.currentStock} units.`
      );
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <ArrowUpRight className="w-6 h-6 mr-2 text-brand-600" />
          Stock-Out (Dispatch / Issue)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Deduct merchandise from stock for store transfers, customer fulfillment, or damaged goods. Zero-negative stock enforced.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-xs text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">Transaction Blocked:</span>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Source Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Source Facility Type *
              </label>
              <select
                value={locationType}
                onChange={(e) => {
                  const type = e.target.value as 'WAREHOUSE' | 'STORE';
                  setLocationType(type);
                  setLocationId(type === 'WAREHOUSE' ? warehouses[0]?.id || 1 : stores[0]?.id || 1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="WAREHOUSE">Regional Warehouse</option>
                <option value="STORE">Retail Store</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Specific Location *
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {locationType === 'WAREHOUSE'
                  ? warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))
                  : stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
              </select>
            </div>

            {/* Product Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Product to Dispatch *
              </label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Stock Balance Indicator Banner */}
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Currently Available to Dispatch at Selected Location:</span>
              </div>
              <div className="font-mono font-black text-sm">
                {checkingStock ? (
                  <span className="text-slate-400">Checking...</span>
                ) : (
                  <span className={currentAvailableStock <= 0 ? 'text-rose-600' : 'text-slate-900'}>
                    {currentAvailableStock} units
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity to Dispatch (Units) *
              </label>
              <input
                type="number"
                min="1"
                max={currentAvailableStock > 0 ? currentAvailableStock : undefined}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg font-mono font-bold focus:outline-none focus:ring-2 ${
                  quantity > currentAvailableStock
                    ? 'border-rose-400 text-rose-700 focus:ring-rose-500'
                    : 'border-slate-200 text-brand-700 focus:ring-brand-500'
                }`}
              />
              {quantity > currentAvailableStock && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  Exceeds available stock ({currentAvailableStock})
                </p>
              )}
            </div>

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mandatory Dispatch Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="STORE_TRANSFER">Inter-Store Transfer Dispatch</option>
                <option value="CUSTOMER_SHIPMENT">Direct Customer Order Dispatch</option>
                <option value="DAMAGE_DISPOSAL">Damaged / Defective Stock Written Off</option>
                <option value="SAMPLE_MARKETING">Marketing Sample / Display Model</option>
                <option value="VENDOR_RETURN">Return to Vendor (RTV)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dispatch Notes / Authorization Reference
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include shipping bill, driver name, or inspection memo..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || quantity > currentAvailableStock || currentAvailableStock <= 0}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Dispatching Stock...' : 'Confirm Stock Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
