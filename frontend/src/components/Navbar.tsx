import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import { Notification } from '../types';
import {
  Bell,
  Search,
  UserCheck,
  LogOut,
  ChevronDown,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_ROLES = [
  { username: 'admin', label: 'System Admin', role: 'ROLE_ADMIN', color: 'text-purple-600 bg-purple-50' },
  { username: 'wh_manager', label: 'Warehouse Manager', role: 'ROLE_WAREHOUSE_MANAGER', color: 'text-blue-600 bg-blue-50' },
  { username: 'store_mgr', label: 'Store Manager', role: 'ROLE_STORE_MANAGER', color: 'text-emerald-600 bg-emerald-50' },
  { username: 'proc_mgr', label: 'Procurement Mgr', role: 'ROLE_PROCUREMENT_MANAGER', color: 'text-amber-600 bg-amber-50' },
  { username: 'inv_auditor', label: 'Inventory Auditor', role: 'ROLE_INVENTORY_AUDITOR', color: 'text-cyan-600 bg-cyan-50' },
  { username: 'logistics', label: 'Logistics Officer', role: 'ROLE_LOGISTICS_OFFICER', color: 'text-indigo-600 bg-indigo-50' },
  { username: 'cashier', label: 'Retail Cashier', role: 'ROLE_CASHIER', color: 'text-pink-600 bg-pink-50' },
  { username: 'analyst', label: 'Business Analyst', role: 'ROLE_BUSINESS_ANALYST', color: 'text-teal-600 bg-teal-50' },
];

export const Navbar: React.FC = () => {
  const { user, switchDemoRole, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
      {/* Global Search Bar */}
      <form onSubmit={handleGlobalSearch} className="relative w-96 max-w-md hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search SKU, barcode, product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </form>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center space-x-4">
        {/* Quick Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            <span className="truncate max-w-[120px]">{user?.role?.replace('ROLE_', '') || 'Role'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Any RBAC Role (1-Click)
                </span>
              </div>
              <div className="space-y-0.5">
                {DEMO_ROLES.map((role) => (
                  <button
                    key={role.username}
                    onClick={() => {
                      switchDemoRole(role.username);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      user?.username === role.username ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{role.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${role.color}`}>
                      @{role.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Live Notifications ({notifications.length})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        n.read
                          ? 'bg-slate-50 border-slate-100 text-slate-600'
                          : 'bg-brand-50/50 border-brand-100 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-500 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
