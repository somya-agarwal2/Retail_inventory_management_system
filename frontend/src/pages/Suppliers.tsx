import React, { useState, useEffect } from 'react';
import { suppliersApi } from '../services/api';
import { Supplier } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Building2, Plus, Phone, Mail, Clock, Star, Edit, Trash2 } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    code: '',
    email: '',
    phone: '',
    paymentTerms: 'NET_30',
    leadTimeDays: 7,
    performanceScore: 98.0,
    active: true,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await suppliersApi.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      code: `VEND-00${suppliers.length + 1}`,
      email: '',
      phone: '',
      paymentTerms: 'NET_30',
      leadTimeDays: 7,
      performanceScore: 95.0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, formData);
      } else {
        await suppliersApi.create(formData);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      alert(`Failed to save vendor: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-brand-600" />
            Supplier Directory & Vendor Scorecards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized vendor contacts, SLA delivery lead times, and quality audit performance scores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Vendor Code</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-center">Avg Lead Time</th>
                <th className="py-3 px-4 text-center">Payment Terms</th>
                <th className="py-3 px-4 text-center">Quality Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading Suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No suppliers configured.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {s.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.contactPerson || 'Account Rep'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.email}</div>
                      <div className="text-[10px] text-slate-400">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {s.leadTimeDays} days
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {s.paymentTerms}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Star className="w-3 h-3 mr-1 fill-emerald-600 text-emerald-600" />
                        {s.performanceScore?.toFixed(1) || '95.0'}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={s.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingSupplier(s);
                          setFormData(s);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-brand-600 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Vendor Details' : 'Onboard New Vendor'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Vendor Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Vendor Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Email *</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.leadTimeDays || 7}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 7 })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Payment Terms</label>
              <select
                value={formData.paymentTerms || 'NET_30'}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="NET_15">Net 15 Days</option>
                <option value="NET_30">Net 30 Days</option>
                <option value="NET_60">Net 60 Days</option>
                <option value="IMMEDIATE">Immediate COD</option>
              </select>
            </div>
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
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
