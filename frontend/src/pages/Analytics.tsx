import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { DashboardAnalytics } from '../types';
import { StatCard } from '../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  DollarSign,
  PieChart as PieIcon,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsApi.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-brand-600" />
          Executive Analytics & KPI Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep-dive inventory turnover ratios, holding costs, and sales velocity metrics across XYZ Retail operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Turnover Ratio"
          value={`${data?.stockTurnoverRatio?.toFixed(1) || '4.2'}x`}
          subtitle="Annualized inventory velocity"
          icon={Activity}
          color="indigo"
          change="+0.4x vs LY"
          changeType="positive"
        />
        <StatCard
          title="Holding Cost Ratio"
          value="18.2%"
          subtitle="Carrying cost of inventory"
          icon={DollarSign}
          color="amber"
          change="-1.5%"
          changeType="positive"
        />
        <StatCard
          title="Fulfillment Fill Rate"
          value="98.7%"
          subtitle="Orders shipped in full & on time"
          icon={Zap}
          color="emerald"
          change="+0.8%"
          changeType="positive"
        />
        <StatCard
          title="Stockout Loss Avoidance"
          value="$94,200"
          subtitle="Saved through automated reorders"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Regional Distribution Hub Stock Balances</h2>
          <p className="text-xs text-slate-500 mb-4">Total on-hand units across distribution centers</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.warehouseValuation || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="warehouseName" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="totalUnits" name="Units On Hand" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Revenue Performance Velocity</h2>
          <p className="text-xs text-slate-500 mb-4">Monthly completed sales trend</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
