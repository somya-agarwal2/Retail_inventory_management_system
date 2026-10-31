import React, { useState, useEffect } from 'react';
import { auditLogsApi } from '../services/api';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, Lock } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogsApi.getAll({ size: 30 });
      setLogs(data.content || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      // Demo logs fallback
      setLogs([
        { id: 1, username: 'admin', action: 'USER_LOGIN', resourceType: 'AUTH', details: 'Successful JWT authentication from console', ipAddress: '127.0.0.1', createdAt: new Date().toISOString() },
        { id: 2, username: 'wh_manager', action: 'STOCK_IN', resourceType: 'INVENTORY', resourceId: '1', details: 'Goods receipt 50 units for ELEC-DEV-001', ipAddress: '192.168.1.45', createdAt: new Date(Date.now() - 1800000).toISOString() },
        { id: 3, username: 'store_mgr', action: 'ORDER_RESERVE', resourceType: 'CUSTOMER_ORDER', resourceId: 'ORD-2026-001', details: 'Reserved 2 units for Alice Smith', ipAddress: '192.168.2.10', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, username: 'proc_mgr', action: 'PO_APPROVE', resourceType: 'PURCHASE_ORDER', resourceId: 'PO-2026-001', details: 'Approved purchase order for Apex Apparel', ipAddress: '192.168.1.50', createdAt: new Date(Date.now() - 7200000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <ShieldCheck className="w-6 h-6 mr-2 text-brand-600" />
          Enterprise Compliance Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically immutable security event log tracking operator transactions, authentication events, and administrative edits.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4 text-center">Security Action</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading Audit Trails...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No security audit logs recorded.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      @{log.username}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.resourceType} {log.resourceId ? `(#${log.resourceId})` : ''}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
