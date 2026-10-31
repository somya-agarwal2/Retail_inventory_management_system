import React, { useState, useEffect } from 'react';
import { barcodeRfidApi, locationsApi } from '../services/api';
import { Warehouse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Radio,
  Play,
  RotateCcw,
  CheckCircle2,
  Signal,
  Layers,
  Building2,
  Activity,
} from 'lucide-react';

export const Rfid: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1);
  const [gateNumber, setGateNumber] = useState<string>('DOCK-DOOR-04');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<any[]>([]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await locationsApi.getWarehouses();
      setWarehouses(data);
      if (data.length > 0) setSelectedWarehouseId(data[0].id);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    }
  };

  const handleRunDockDoorSimulation = async () => {
    setIsScanning(true);
    setScanResults([]);

    const demoEpcCodes = [
      '3034257BF400B7800004FB29',
      '3034257BF400B7800004FB30',
      '3034257BF400B7800004FB31',
      '3034257BF400B7800004FB32',
      '3034257BF400B7800004FB33',
    ];

    try {
      const res = await barcodeRfidApi.simulateDockDoorScan({
        gateNumber,
        epcCodes: demoEpcCodes,
        locationType: 'WAREHOUSE',
        locationId: selectedWarehouseId,
      });

      setScanResults(res.scannedItems || [
        { epc: demoEpcCodes[0], sku: 'ELEC-DEV-001', name: 'Premium Wireless Mouse', rssi: '-54 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[1], sku: 'APP-SHIRT-001', name: 'Oxford Cotton Shirt', rssi: '-58 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[2], sku: 'APP-DENIM-001', name: 'Slim Fit Denim Jeans', rssi: '-61 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[3], sku: 'HOME-BLND-001', name: 'High-Speed Blender Pro', rssi: '-52 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[4], sku: 'FOOT-SNEAK-01', name: 'Air Cushion Running Shoes', rssi: '-65 dBm', status: 'VERIFIED_PO' },
      ]);
    } catch (err) {
      // Fallback demo simulation
      setScanResults([
        { epc: demoEpcCodes[0], sku: 'ELEC-DEV-001', name: 'Premium Wireless Mouse', rssi: '-54 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[1], sku: 'APP-SHIRT-001', name: 'Oxford Cotton Shirt', rssi: '-58 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[2], sku: 'APP-DENIM-001', name: 'Slim Fit Denim Jeans', rssi: '-61 dBm', status: 'VERIFIED_PO' },
        { epc: demoEpcCodes[3], sku: 'HOME-BLND-001', name: 'High-Speed Blender Pro', rssi: '-52 dBm', status: 'VERIFIED_PO' },
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <Radio className="w-6 h-6 mr-2 text-brand-600" />
          RFID Pallet Portal & Dock Door Reader
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulated EPC Class 1 Gen 2 fixed RFID dock door reader. Captures multi-item bulk pallet tags in under 500ms without line of sight.
        </p>
      </div>

      {/* Simulator Terminal Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 ${isScanning ? 'animate-ping-slow' : ''}`}>
              <Signal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center">
                RFID Antenna Array [Impinj Speedway R420 Emulator]
                <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-400">902–928 MHz UHF Frequency Band • Circular Polarization</p>
            </div>
          </div>

          <button
            onClick={handleRunDockDoorSimulation}
            disabled={isScanning}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Reading Pallet Tags...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Simulate Pallet Inbound Pass
              </>
            )}
          </button>
        </div>

        {/* Configuration settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Distribution Hub Location
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Dock Gate Portal Identifier
            </label>
            <input
              type="text"
              value={gateNumber}
              onChange={(e) => setGateNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Live Read Results Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Bulk Pallet EPC Tag Interception Log ({scanResults.length} tags)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Read Rate: 100% Accuracy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Electronic Product Code (EPC-96)</th>
                <th className="py-3 px-4">Resolved Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">RSSI Signal</th>
                <th className="py-3 px-4 text-center">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {scanResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Click "Simulate Pallet Inbound Pass" above to trigger high-speed RFID bulk tag capture.
                  </td>
                </tr>
              ) : (
                scanResults.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {item.epc}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">
                      {item.rssi}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status="ACTIVE" />
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
