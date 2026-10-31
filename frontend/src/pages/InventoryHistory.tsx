import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import { StockTransaction } from '../types';
import { History, Search, Filter, ArrowDownLeft, ArrowUpRight, FileSpreadsheet } from 'lucide-react';

export const InventoryHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    loadTransactions();
  }, [selectedType, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getTransactions({
        transactionType: selectedType || undefined,
        page,
        size: 20,
      });
      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load transaction ledger', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <History className="w-6 h-6 mr-2 text-brand-600" />
            Stock Ledger & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable financial and inventory transaction ledger with before/after balances and user accountability.
          </p>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="">All Transaction Types</option>
            <option value="STOCK_IN">Stock In (Receipts)</option>
            <option value="STOCK_OUT">Stock Out (Dispatches)</option>
            <option value="ADJUSTMENT_ADD">Audit Adjustment (+)</option>
            <option value="ADJUSTMENT_SUBTRACT">Audit Adjustment (-)</option>
            <option value="ORDER_FULFILL">Order Fulfillment</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Tx Reference</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-center">Balance After</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4">Ref / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading Ledger History...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {tx.transactionRef}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{tx.productName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{tx.productSku}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {tx.transactionType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {tx.balanceAfter} units
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${tx.unitCost?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{tx.referenceType} ({tx.referenceId || 'N/A'})</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{tx.notes}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page + 1} of {totalPages}</span>
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
    </div>
  );
};
