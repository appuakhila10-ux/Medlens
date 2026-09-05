import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  color?: 'blue' | 'teal' | 'amber' | 'rose' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      borderHover: 'hover:border-blue-300'
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      borderHover: 'hover:border-teal-300'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      borderHover: 'hover:border-amber-300'
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      borderHover: 'hover:border-rose-300'
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      borderHover: 'hover:border-slate-300'
    }
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 ${onClick ? 'cursor-pointer hover:shadow-md ' + colorMap.borderHover : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</span>
            {subtitle && <span className="text-xs text-slate-500 font-normal">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap.iconBg} shadow-xs`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-slate-600'}`}>
            {trend.label}
          </span>
          <span className="text-slate-400">• clinical ledger</span>
        </div>
      )}
    </div>
  );
};
