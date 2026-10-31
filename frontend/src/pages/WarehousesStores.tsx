import React, { useState, useEffect } from 'react';
import { locationsApi } from '../services/api';
import { Warehouse, Store } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Warehouse as WhIcon, Store as StoreIcon, Plus, MapPin, Building2, Phone, Mail } from 'lucide-react';

export const WarehousesStores: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'warehouses' | 'stores'>('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create Location Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    code: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    capacitySqft: 50000,
    storeType: 'STANDARD',
    managerName: '',
    contactEmail: '',
    contactPhone: '',
    active: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const [whData, storeData] = await Promise.all([
        locationsApi.getWarehouses(),
        locationsApi.getStores(),
      ]);
      setWarehouses(whData);
      setStores(storeData);
    } catch (err) {
      console.error('Failed to load facilities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      code: activeTab === 'warehouses' ? `WH-00${warehouses.length + 1}` : `STR-00${stores.length + 1}`,
      addressLine1: '100 Enterprise Way',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75001',
      country: 'USA',
      capacitySqft: 50000,
      storeType: 'STANDARD',
      managerName: 'Operations Lead',
      contactEmail: 'facility@xyzretail.com',
      contactPhone: '+1-800-555-0199',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'warehouses') {
        await locationsApi.createWarehouse(formData);
      } else {
        await locationsApi.createStore(formData);
      }
      setIsModalOpen(false);
      loadLocations();
    } catch (err: any) {
      alert(`Failed to save facility: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-brand-600" />
            Facilities & Multi-Location Infrastructure
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage regional distribution warehouses and retail brick-and-mortar storefronts across XYZ Retail Corporation.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add {activeTab === 'warehouses' ? 'Warehouse' : 'Retail Store'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'warehouses'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <WhIcon className="w-4 h-4" />
          <span>Regional Warehouses ({warehouses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'stores'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Retail Storefronts ({stores.length})</span>
        </button>
      </div>

      {/* Grid of Locations */}
      {activeTab === 'warehouses' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((w) => (
            <div key={w.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                  {w.code}
                </span>
                <StatusBadge status={w.active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{w.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{w.addressLine1}, {w.city}, {w.state} {w.postalCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <WhIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Capacity: {w.capacitySqft?.toLocaleString()} sq. ft.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Lead: {w.managerName || 'Operations Mgr'}</span>
                <span className="font-bold text-emerald-600">Operational</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {s.storeType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{s.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{s.addressLine1}, {s.city}, {s.state} {s.postalCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{s.contactEmail || 'store@xyzretail.com'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Manager: {s.managerName || 'Store Mgr'}</span>
                <StatusBadge status={s.active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeTab === 'warehouses' ? 'Register Regional Warehouse' : 'Onboard Retail Store'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Facility Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Street Address *</label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
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
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
            >
              Save Facility
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
