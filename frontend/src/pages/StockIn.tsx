import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, productsApi, locationsApi } from '../services/api';
import { Product, Warehouse, Store } from '../types';
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Package,
  Building2,
  DollarSign,
  FileText,
} from 'lucide-react';

export const StockIn: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [productId, setProductId] = useState<number>(1);
  const [locationType, setLocationType] = useState<'WAREHOUSE' | 'STORE'>('WAREHOUSE');
  const [locationId, setLocationId] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [referenceType, setReferenceType] = useState<string>('PURCHASE_ORDER');
  const [referenceId, setReferenceId] = useState<string>('PO-2026-001');
  const [notes, setNotes] = useState<string>('Goods receipt note inbound restock');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
        setUnitCost(prodRes.content[0].purchasePrice);
      }
      if (whRes && whRes.length > 0) {
        setLocationId(whRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load stock in data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (id: number) => {
    setProductId(id);
    const selected = products.find((p) => p.id === id);
    if (selected) {
      setUnitCost(selected.purchasePrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await inventoryApi.stockIn({
        productId,
        locationType,
        locationId,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        referenceType,
        referenceId,
        notes,
      });

      setSuccess(
        `Successfully received ${quantity} units! Updated on-hand balance at ${res.locationName} is now ${res.currentStock} units.`
      );
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process Stock-In.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <ArrowDownLeft className="w-6 h-6 mr-2 text-emerald-600" />
          Stock-In (Goods Receipt Note)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Receive inbound merchandise into warehouse or store stock. Updates atomic ledger balance and unit cost valuation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-xs text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
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
            {/* Product Selection */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Catalog Product (SKU / Name) *
              </label>
              <select
                required
                value={productId}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} - ${p.purchasePrice.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Destination Facility Type *
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
                <option value="STORE">Retail Flagship Store</option>
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

            {/* Quantity and Unit Cost */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quantity Received (Units) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Unit Purchase Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Document Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reference Document Type
              </label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="PURCHASE_ORDER">Purchase Order (PO)</option>
                <option value="TRANSFER_ORDER">Inter-Store Transfer In</option>
                <option value="CUSTOMER_RETURN">Customer RMA Restock</option>
                <option value="INITIAL_LOAD">Initial Inventory Opening Balance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reference ID / Number
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. PO-2026-001"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Receiving Notes / Bill of Lading
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Total Valuation Summary Banner */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-900">Total Goods Receipt Valuation:</span>
              <p className="text-emerald-700 mt-0.5">
                {quantity} units @ ${Number(unitCost).toFixed(2)} / unit
              </p>
            </div>
            <div className="text-xl font-black font-mono text-emerald-800">
              ${(quantity * unitCost).toFixed(2)}
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
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {submitting ? 'Recording Inbound Receipt...' : 'Confirm Goods Receipt (Stock-In)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
