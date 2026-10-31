import React, { useState, useEffect } from 'react';
import { barcodeRfidApi, productsApi } from '../services/api';
import { Product } from '../types';
import { BarcodeModal } from '../components/BarcodeModal';
import {
  ScanBarcode,
  Search,
  Printer,
  Copy,
  Check,
  Package,
  Boxes,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const Barcodes: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [barcodeSvg, setBarcodeSvg] = useState<string>('');
  const [loadingSvg, setLoadingSvg] = useState<boolean>(false);

  // Scanner Simulator
  const [scannedCode, setScannedCode] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll({ size: 50 });
      setProducts(data.content || []);
      if (data.content && data.content.length > 0) {
        handleSelectProduct(data.content[0]);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleSelectProduct = async (prod: Product) => {
    setSelectedProduct(prod);
    setLoadingSvg(true);
    try {
      const svg = await barcodeRfidApi.generateBarcodeSvg(prod.sku);
      setBarcodeSvg(svg);
    } catch (err) {
      console.error('Failed to generate barcode', err);
    } finally {
      setLoadingSvg(false);
    }
  };

  const handleSimulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;
    setScanning(true);
    setScanError(null);
    setScannedResult(null);

    try {
      const res = await barcodeRfidApi.verifyBarcode(scannedCode.trim());
      setScannedResult(res);
    } catch (err: any) {
      setScanError(
        err.response?.data?.message || `Barcode '${scannedCode}' not recognized in XYZ Retail catalog.`
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <ScanBarcode className="w-6 h-6 mr-2 text-brand-600" />
          Barcode Generator & POS Scanner Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Vector Code 128 barcode rendering engine with zero loss scaling for thermal warehouse shelf tags and live barcode reader verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Vector Barcode Generator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">1. Vector Code 128 Label Generator</h2>
            <span className="text-[10px] font-mono font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
              Pure SVG / Lossless
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const found = products.find((p) => p.id === Number(e.target.value));
                if (found) handleSelectProduct(found);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barcode Display Box */}
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[220px]">
            {loadingSvg ? (
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            ) : selectedProduct ? (
              <div className="text-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-sm w-full">
                <div className="text-sm font-bold text-slate-900 mb-1">{selectedProduct.name}</div>
                <div className="text-xs font-mono text-slate-500 mb-4">SKU: {selectedProduct.sku}</div>

                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                />

                <div className="mt-4 text-xl font-bold font-mono text-slate-900">
                  ${selectedProduct.sellingPrice.toFixed(2)}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => {
                if (selectedProduct) {
                  setScannedCode(selectedProduct.barcode);
                }
              }}
              className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Send to Scanner Simulator &rarr;
            </button>
          </div>
        </div>

        {/* Right: Live POS Scanner Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">2. Optical Barcode Reader Simulator</h2>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              Point-of-Sale / Handheld Terminal
            </span>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Scan or Enter Barcode / SKU
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="e.g. 8901234567890 or ELEC-DEV-001"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {scanning ? 'Decoding...' : 'Scan / Verify'}
                </button>
              </div>
            </div>
          </form>

          {/* Scan Results */}
          <div className="min-h-[220px] rounded-xl border border-dashed border-slate-200 p-6 flex flex-col justify-center">
            {scanError && (
              <div className="text-center p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {scanError}
              </div>
            )}

            {scannedResult ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Product Verified & Active in Inventory Master</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product Name:</span>
                    <span className="font-bold text-slate-900">{scannedResult.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SKU:</span>
                    <span className="font-mono font-bold text-brand-700">{scannedResult.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-800">{scannedResult.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retail Selling Price:</span>
                    <span className="font-mono font-bold text-slate-900">${scannedResult.sellingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reorder Threshold:</span>
                    <span className="text-slate-800">{scannedResult.reorderPoint} units</span>
                  </div>
                </div>
              </div>
            ) : !scanError ? (
              <div className="text-center text-xs text-slate-400">
                Scan any barcode above or enter a SKU to verify instant catalog resolution and price lookups.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
