import React, { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../services/api';
import { Product, Category } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { BarcodeModal } from '../components/BarcodeModal';
import { Modal } from '../components/Modal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ScanBarcode,
  Edit,
  Trash2,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Barcode Modal State
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);

  // Create / Edit Product Modal
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: 1,
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minStockLevel: 10,
    reorderPoint: 25,
    safetyStock: 5,
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedStatus, page]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({
        search: search || undefined,
        categoryId: selectedCategory,
        status: selectedStatus || undefined,
        page,
        size: 10,
      });
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      barcode: `${Date.now()}`.slice(0, 12),
      name: '',
      description: '',
      categoryId: categories[0]?.id || 1,
      brand: '',
      purchasePrice: 10.0,
      sellingPrice: 19.99,
      minStockLevel: 10,
      reorderPoint: 25,
      safetyStock: 5,
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Business rule validation: Selling Price >= Purchase Price
    if (Number(formData.sellingPrice) < Number(formData.purchasePrice)) {
      setFormError('Selling price cannot be less than purchase price.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData);
      } else {
        await productsApi.create(formData);
      }
      setIsFormOpen(false);
      loadProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await productsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await productsApi.importCsv(file);
      alert(`Bulk Import Successful! ${res.count} products added.`);
      loadProducts();
    } catch (err: any) {
      alert(`CSV Import Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain master SKU catalog, retail pricing margins, barcode specifications, and stock limits.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Barcode, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4">Product Name & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Safety Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading Catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setBarcodeModalProduct(p)}
                        className="inline-flex items-center space-x-1.5 font-mono text-[11px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                        title="Click to view & print Code 128 vector barcode"
                      >
                        <ScanBarcode className="w-3.5 h-3.5 text-slate-500" />
                        <span>{p.barcode}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.brand}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        {p.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${p.purchasePrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${p.sellingPrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      <span title={`Min: ${p.minStockLevel}, Reorder: ${p.reorderPoint}, Safety: ${p.safetyStock}`}>
                        {p.safetyStock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Product"
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

      {/* Barcode Modal */}
      {barcodeModalProduct && (
        <BarcodeModal
          isOpen={!!barcodeModalProduct}
          onClose={() => setBarcodeModalProduct(null)}
          sku={barcodeModalProduct.sku}
          productName={barcodeModalProduct.name}
          price={barcodeModalProduct.sellingPrice}
        />
      )}

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
        subtitle="Ensure selling price covers purchase price to satisfy business validation."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Product SKU *
              </label>
              <input
                type="text"
                required
                disabled={!!editingProduct}
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. ELEC-LAP-001"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Barcode (Code 128 / UPC) *
              </label>
              <input
                type="text"
                required
                value={formData.barcode || ''}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 8901234567890"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ultra HD Smart Monitor 32-inch"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Category *
              </label>
              <select
                required
                value={formData.categoryId || 1}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Dell"
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Purchase Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.purchasePrice ?? ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.sellingPrice ?? ''}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold text-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel ?? 10}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Reorder Point
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderPoint ?? 25}
                onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) })}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
