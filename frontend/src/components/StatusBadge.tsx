import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'inventory' | 'transfer' | 'po' | 'return' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  const normalized = (status || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['ACTIVE', 'DELIVERED', 'RECEIVED', 'APPROVED', 'RESTOCKED', 'PAID', 'SUCCESS'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['PENDING', 'REQUESTED', 'DRAFT', 'SUBMITTED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['SHIPPED', 'PICKED', 'PACKED', 'CONFIRMED'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['LOW_STOCK', 'INSPECTED'].includes(normalized)) {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (['CANCELLED', 'REJECTED', 'OUT_OF_STOCK', 'DISCONTINUED', 'SUSPENDED', 'ERROR'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} tracking-wide uppercase transition-all duration-150`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {formatText(normalized)}
    </span>
  );
};
