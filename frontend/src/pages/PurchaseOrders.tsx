import React, { useState, useEffect } from 'react';
import { purchaseOrdersApi, suppliersApi, productsApi, locationsApi } from '../services/api';
import { PurchaseOrder, Supplier, Product, Warehouse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Truck, Plus, CheckCircle2, Eye, PackageCheck, AlertCircle } from 'lucide-react';

export const PurchaseOrders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create PO Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [supplierId, setSupplierId] = useState<number>(1);
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [poItems, setPoItems] = useState<{ productId: number; quantityOrdered: number; unitCost: number }[]>([
    { productId: 1, quantityOrdered: 50, unitCost: 15.0 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Receiving GRN Modal
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<number, number>>({});
  const [receiving, setReceiving] = useState<boolean>(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [poRes, supData, prodRes, whData] = await Promise.all([
        purchaseOrdersApi.getAll(),
        suppliersApi.getAll(),
        productsApi.getAll({ size: 100 }),
        locationsApi.getWarehouses(),
      ]);
      setPurchaseOrders(poRes.content || []);
      setSuppliers(supData);
      setProducts(prodRes.content || []);
      setWarehouses(whData);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setPoItems([...poItems, { productId: products[0]?.id || 1, quantityOrdered: 20, unitCost: 10.0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await purchaseOrdersApi.create({
        supplierId,
        destinationLocationType: 'WAREHOUSE',
        destinationLocationId: warehouseId,
        items: poItems,
      });
      setIsModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(`Failed to create PO: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePo = async (po: PurchaseOrder) => {
    try {
      await purchaseOrdersApi.updateStatus(po.id, 'APPROVED');
      loadAllData();
    } catch (err: any) {
      alert(`Approval failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenReceive = (po: PurchaseOrder) => {
    setReceivingPo(po);
    const initialMap: Record<number, number> = {};
    (po.items || []).forEach((item) => {
      if (item.id) {
        initialMap[item.id] = item.quantityOrdered - item.quantityReceived;
      }
    });
    setReceivedQtyMap(initialMap);
  };

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPo) return;
    setReceiving(true);
    try {
      const payload = Object.entries(receivedQtyMap).map(([idStr, qty]) => ({
        itemId: Number(idStr),
        quantityReceived: Number(qty),
      }));
      await purchaseOrdersApi.receive(receivingPo.id, payload);
      setReceivingPo(null);
      loadAllData();
    } catch (err: any) {
      alert(`Receiving failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setReceiving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Truck className="w-6 h-6 mr-2 text-brand-600" />
            Purchase Order (PO) Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Procure stock from approved vendors, approve purchase requisitions, and receive goods directly into warehouse inventory.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Destination Hub</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4 text-right">PO Total ($)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Procurement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading Purchase Orders...
                  </td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No purchase orders recorded.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{po.supplierName}</div>
                      <div className="text-[10px] text-slate-400">{po.supplierCode}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {po.destinationLocationName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{po.items?.length || 0} SKUs</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${po.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={po.status} type="po" />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {po.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApprovePo(po)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          Approve PO
                        </button>
                      )}
                      {(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && (
                        <button
                          onClick={() => handleOpenReceive(po)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                        >
                          Receive GRN
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

      {/* Receive GRN Modal */}
      {receivingPo && (
        <Modal
          isOpen={!!receivingPo}
          onClose={() => setReceivingPo(null)}
          title={`Goods Receipt Note (GRN): ${receivingPo.poNumber}`}
          subtitle={`Receiving stock into ${receivingPo.destinationLocationName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmReceive} className="space-y-4">
            <p className="text-xs text-slate-600">
              Verify physical delivered count against supplier packing slip. Inventory will be atomically incremented upon confirmation.
            </p>

            <div className="space-y-2">
              {receivingPo.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      Ordered: {item.quantityOrdered} | Received: {item.quantityReceived}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-600">Receiving:</span>
                    <input
                      type="number"
                      min="0"
                      max={item.quantityOrdered - item.quantityReceived}
                      value={item.id ? receivedQtyMap[item.id] || 0 : 0}
                      onChange={(e) => {
                        if (item.id) {
                          setReceivedQtyMap({ ...receivedQtyMap, [item.id]: parseInt(e.target.value) || 0 });
                        }
                      }}
                      className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReceivingPo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={receiving}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                {receiving ? 'Receiving...' : 'Confirm Inbound Receipt'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Purchase Order"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Vendor Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Destination Warehouse *</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(Number(e.target.value))}
                className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                + Add SKU
              </button>
            </div>

            {poItems.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const updated = [...poItems];
                    updated[idx].productId = Number(e.target.value);
                    setPoItems(updated);
                  }}
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
                  value={item.quantityOrdered}
                  onChange={(e) => {
                    const updated = [...poItems];
                    updated[idx].quantityOrdered = parseInt(e.target.value) || 1;
                    setPoItems(updated);
                  }}
                  placeholder="Qty"
                  className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitCost}
                  onChange={(e) => {
                    const updated = [...poItems];
                    updated[idx].unitCost = parseFloat(e.target.value) || 0;
                    setPoItems(updated);
                  }}
                  placeholder="Cost"
                  className="w-24 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
            >
              Submit PO
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
