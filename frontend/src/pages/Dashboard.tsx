import React, { useState, useEffect } from 'react';
import { analyticsApi, inventoryApi } from '../services/api';
import { DashboardAnalytics, InventoryItem } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  ArrowLeftRight,
  Truck,
  TrendingUp,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ScanBarcode,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#f97316'];

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await analyticsApi.getDashboardAnalytics();
      setAnalytics(data);

      const lowStockRes = await inventoryApi.getOverview({ isLowStock: true, size: 5 });
      setLowStockItems(lowStockRes.content || []);
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Enterprise Analytics Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            XYZ Retail Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-location stock balances, fulfillment operations, and demand intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <Link
            to="/inventory/stock-in"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            Stock-In
          </Link>

          <Link
            to="/inventory/stock-out"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
            Stock-Out
          </Link>

          <Link
            to="/orders"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Orders
          </Link>
        </div>
      </div>

      {/* 10 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active SKUs"
          value={analytics?.totalSkus?.toLocaleString() || '0'}
          subtitle="32 catalog items"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Stock Units"
          value={analytics?.totalInventoryUnits?.toLocaleString() || '0'}
          subtitle="All warehouses & stores"
          icon={Boxes}
          color="indigo"
        />
        <StatCard
          title="Inventory Valuation"
          value={`$${(analytics?.totalValuation || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="At weighted purchase cost"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={analytics?.lowStockItemsCount || 0}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          color={analytics?.lowStockItemsCount ? 'amber' : 'blue'}
          change={analytics?.lowStockItemsCount ? 'Action required' : 'Optimal'}
          changeType={analytics?.lowStockItemsCount ? 'negative' : 'positive'}
        />
        <StatCard
          title="Out of Stock"
          value={analytics?.outOfStockItemsCount || 0}
          subtitle="Zero balance locations"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Open Orders"
          value={analytics?.openOrdersCount || 0}
          subtitle="Pending fulfillment"
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Active Transfers"
          value={analytics?.pendingTransfersCount || 0}
          subtitle="In-transit freight"
          icon={ArrowLeftRight}
          color="purple"
        />
        <StatCard
          title="Pending POs"
          value={analytics?.pendingPurchaseOrdersCount || 0}
          subtitle="Awaiting vendor delivery"
          icon={Truck}
          color="amber"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(analytics?.monthlyRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Completed sales"
          icon={TrendingUp}
          color="emerald"
          change="+14.2%"
          changeType="positive"
        />
        <StatCard
          title="Stock Turnover"
          value={`${analytics?.stockTurnoverRatio?.toFixed(1) || '4.2'}x`}
          subtitle="Annualized velocity"
          icon={Activity}
          color="indigo"
        />
      </div>

      {/* 4 Interactive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Share & Valuation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h2>
              <p className="text-xs text-slate-500">Distribution across 8 core merchandise departments</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryShare || []}
                  dataKey="valuation"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {(analytics?.categoryShare || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Valuation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Stock In vs Stock Out Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Inventory Flow (Units)</h2>
              <p className="text-xs text-slate-500">Receipts vs Dispatches over the past 6 months</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="stockIn" name="Stock In (Receipts)" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="stockOut" name="Stock Out (Sales/Transfers)" stroke="#2563eb" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Warehouse Valuation Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Distribution Hub Stock Valuation</h2>
              <p className="text-xs text-slate-500">Capital tied up across regional warehouses</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.warehouseValuation || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="warehouseName" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Valuation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="valuation" name="Valuation ($)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Selling Velocity Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top-Selling Products by Units</h2>
              <p className="text-xs text-slate-500">High velocity SKUs requiring priority restock</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics?.topSellingProducts || []}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="sku" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="unitsSold" name="Units Sold" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Immediate Reorder Alerts (Low Stock)
            </h2>
          </div>
          <Link
            to="/inventory?isLowStock=true"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            View all alerts &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Current</th>
                <th className="py-3 px-4 text-center">Reorder Point</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active low-stock alerts. All inventory levels are above safety thresholds!
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.locationName} ({item.locationType})
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">
                      {item.currentStock}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {item.reorderPoint}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status="LOW_STOCK" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/inventory/stock-in"
                        className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                      >
                        Restock
                      </Link>
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
