import React, { useState, useEffect } from 'react';
import { ordersApi, productsApi, locationsApi } from '../services/api';
import { CustomerOrder, Product, Warehouse, Store } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  DollarSign,
  PackageCheck,
} from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Order Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<'WAREHOUSE' | 'STORE'>('WAREHOUSE');
  const [locationId, setLocationId] = useState<number>(1);
  const [carrier, setCarrier] = useState<string>('BlueDart Express');
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 1, quantity: 2 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, whRes, storeRes] = await Promise.all([
        ordersApi.getAll(),
        productsApi.getAll({ size: 100 }),
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
      ]);
      setOrders(ordRes.content || []);
      setProducts(prodRes.content || []);
      setWarehouses(whRes || []);
      setStores(storeRes || []);
    } catch (err) {
      console.error('Failed to load orders data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: products[0]?.id || 1, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await ordersApi.create({
        customerId: 1, // Alice Smith (Seeded demo customer)
        fulfillmentLocationType: locationType,
        fulfillmentLocationId: locationId,
        shippingCarrier: carrier,
        items: orderItems,
      });
      setIsModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShipOrder = async (order: CustomerOrder) => {
    try {
      await ordersApi.ship(order.id);
      loadAllData();
      if (selectedOrder?.id === order.id) {
        const updated = await ordersApi.getById(order.id);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(`Shipping failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancelOrder = async (order: CustomerOrder) => {
    if (!window.confirm('Cancel this order? Reserved stock will be immediately released back to the available inventory pool.')) {
      return;
    }
    try {
      await ordersApi.cancel(order.id, 'Customer requested order cancellation');
      loadAllData();
      if (selectedOrder?.id === order.id) {
        const updated = await ordersApi.getById(order.id);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(`Cancellation failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-brand-600" />
            Customer Order Management & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Two-phase stock reservation lifecycle with automated release on cancellation and dispatch tracking.
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
          Create Customer Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Fulfillment Hub</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total ($)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading Customer Orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{o.fulfillmentLocationName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{o.fulfillmentLocationType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{o.items?.length || 0} line items</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${o.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={o.status} type="order" />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="View Order Details & Status History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {o.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleShipOrder(o)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                          >
                            Ship Order
                          </button>
                          <button
                            onClick={() => handleCancelOrder(o)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Customer Order: ${selectedOrder.orderNumber}`}
          subtitle={`Placed on ${new Date(selectedOrder.orderDate).toLocaleString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Customer Details</span>
                <p className="font-bold text-slate-900 mt-1">{selectedOrder.customerName}</p>
                <p className="text-slate-600">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Fulfillment Facility</span>
                <p className="font-bold text-slate-900 mt-1">{selectedOrder.fulfillmentLocationName}</p>
                <p className="text-slate-600">{selectedOrder.shippingCarrier} ({selectedOrder.trackingNumber || 'Tracking Pending'})</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-700 block mb-2">
                Order Items & Stock Reservation Status
              </span>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item / SKU</th>
                    <th className="py-2 px-3 text-center">Ordered</th>
                    <th className="py-2 px-3 text-center">Reserved</th>
                    <th className="py-2 px-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-800">{item.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 px-3 text-center text-emerald-600 font-bold">{item.allocatedQty}</td>
                      <td className="py-2 px-3 text-right font-mono">${item.unitPrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%):</span>
                  <span className="font-mono">${selectedOrder.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Freight:</span>
                  <span className="font-mono">${selectedOrder.shippingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Paid:</span>
                  <span className="font-mono font-bold text-brand-700">${selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Lifecycle History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-500 mb-2 block">
                  Audit Lifecycle Log
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded">
                      <span className="font-semibold text-slate-800">{h.newStatus}</span>
                      <span className="text-slate-500">{h.comment}</span>
                      <span className="text-slate-400">{new Date(h.createdAt || '').toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Place New Customer Order"
        subtitle="Stock will be automatically reserved at the selected fulfillment location."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fulfillment Facility Type *
              </label>
              <select
                value={locationType}
                onChange={(e) => {
                  const type = e.target.value as 'WAREHOUSE' | 'STORE';
                  setLocationType(type);
                  setLocationId(type === 'WAREHOUSE' ? warehouses[0]?.id || 1 : stores[0]?.id || 1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="WAREHOUSE">Warehouse</option>
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
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                {locationType === 'WAREHOUSE'
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

          {/* Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">Order Items</span>
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
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <select
                    value={item.productId}
                    onChange={(e) => handleUpdateItem(idx, 'productId', Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name} - ${p.sellingPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold"
                  />

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
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
              {submitting ? 'Placing Order...' : 'Confirm Order & Reserve Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
