import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ScanBarcode,
  Radio,
  ShoppingCart,
  RotateCcw,
  Truck,
  FileText,
  Warehouse,
  Store,
  BarChart3,
  Users,
  Settings,
  History,
  ShieldCheck,
  Tag,
  Building2,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { user, hasRole, hasAnyRole } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'CORE & ANALYTICS',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics & KPIs', path: '/analytics', icon: BarChart3 },
        { name: '10 Tabular Reports', path: '/reports', icon: FileText },
      ],
    },
    {
      title: 'CATALOG & SCANNING',
      items: [
        { name: 'Product Catalog', path: '/products', icon: Package },
        { name: 'Categories', path: '/categories', icon: Tag },
        { name: 'Barcode Generator', path: '/barcodes', icon: ScanBarcode },
        { name: 'RFID Dock Door', path: '/rfid', icon: Radio, badge: 'Live' },
      ],
    },
    {
      title: 'INVENTORY OPERATIONS',
      items: [
        { name: 'Inventory Overview', path: '/inventory', icon: Boxes },
        { name: 'Receive Stock (In)', path: '/inventory/stock-in', icon: ArrowDownLeft },
        { name: 'Dispatch Stock (Out)', path: '/inventory/stock-out', icon: ArrowUpRight },
        { name: 'Inter-Store Transfers', path: '/transfers', icon: ArrowLeftRight },
        { name: 'Audit & Ledger History', path: '/inventory/history', icon: History },
      ],
    },
    {
      title: 'COMMERCIAL & FULFILLMENT',
      items: [
        { name: 'Customer Orders', path: '/orders', icon: ShoppingCart },
        { name: 'RMA Customer Returns', path: '/returns', icon: RotateCcw },
        { name: 'Suppliers & Vendors', path: '/suppliers', icon: Building2 },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: Truck },
      ],
    },
    {
      title: 'INFRASTRUCTURE & ACCESS',
      items: [
        { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
        { name: 'Retail Stores', path: '/stores', icon: Store },
        { name: 'User Management', path: '/users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
        { name: 'System Integrations', path: '/integrations', icon: Settings, roles: ['ADMIN'] },
        { name: 'Compliance Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['ADMIN', 'AUDITOR'] },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/20">
            R
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-white flex items-center">
              RIMS
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              XYZ Retail Corp
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || hasAnyRole(item.roles)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Location & Role Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-brand-400 border border-slate-700">
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
              {user?.role?.replace('ROLE_', '')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
