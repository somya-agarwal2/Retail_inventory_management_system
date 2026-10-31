import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Boxes,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const DEMO_PRESETS = [
  { username: 'admin', role: 'System Admin', desc: 'Full enterprise control & security' },
  { username: 'wh_manager', role: 'Warehouse Mgr', desc: 'Central Hub stock & transfers' },
  { username: 'store_mgr', role: 'Store Mgr', desc: 'Retail store stock & POS orders' },
  { username: 'proc_mgr', role: 'Procurement Mgr', desc: 'Suppliers & Purchase Orders' },
  { username: 'inv_auditor', role: 'Inventory Auditor', desc: 'Stock audits & adjustments' },
  { username: 'logistics', role: 'Logistics Officer', desc: 'Inter-store dispatches' },
  { username: 'cashier', role: 'Retail Cashier', desc: 'Customer checkout & returns' },
  { username: 'analyst', role: 'Business Analyst', desc: 'Reports & KPI analytics' },
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (presetUser: string) => {
    setUsername(presetUser);
    setPassword('Password@123');
    setError(null);
    setLoading(true);
    try {
      await login({ username: presetUser, password: 'Password@123' });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-black text-2xl shadow-xl shadow-brand-500/25 mb-4">
          R
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          XYZ Retail Corporation
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Retail Inventory Management System (PRG_RIMS_001)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-white/20 sm:px-10 text-slate-900">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-xs text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Username or Email
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Password@123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Authenticating...' : 'Sign In to Enterprise Portal'}
            </button>
          </form>

          {/* Quick 1-Click Role Login Grid */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                One-Click Quick Login (All 8 Roles)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.username}
                  type="button"
                  onClick={() => handleDemoSelect(preset.username)}
                  className="p-2.5 text-left border border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/50 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-brand-600">
                    {preset.role}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    @{preset.username}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-center text-slate-400">
              Pre-configured demo password for all roles: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-bold">Password@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
