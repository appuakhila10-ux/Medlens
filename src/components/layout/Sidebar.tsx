import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FlaskConical,
  GitCompare,
  AlertTriangle,
  Clock,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'patients'
  | 'upload'
  | 'records'
  | 'compare'
  | 'conflicts'
  | 'timeline'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  pendingCount?: number;
  conflictCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  pendingCount = 2,
  conflictCount = 2
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'patients', label: 'Patients', icon: Users, badge: null },
    { id: 'upload', label: 'Upload Report', icon: UploadCloud, badge: null },
    { id: 'records', label: 'Medical Records', icon: FlaskConical, badge: null },
    { id: 'compare', label: 'Compare Reports', icon: GitCompare, badge: null },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? conflictCount : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { id: 'timeline', label: 'Timeline', icon: Clock, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside aria-label="Sidebar navigation" className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)] h-screen sticky top-0">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-clinical-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20" aria-hidden="true">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">MedLens</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-200/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Clinical Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id as NavPage)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  aria-hidden="true"
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-500 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {/* MedLens AI Badge */}
        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-indigo-900">MedLens AI</span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
            v1.2 Active
          </span>
        </div>

        {/* Privacy / Security Indicator */}
        <div className="px-2.5 py-1.5 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
          <span className="truncate">HIPAA Protected UI • Source-Traceable</span>
        </div>

        {/* User Profile */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          aria-label="User settings for Dr. Sarah Lin"
          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs" aria-hidden="true">
              SL
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">Dr. Sarah Lin, MD</p>
              <p className="text-[10px] text-slate-500 truncate">Chief Medical Officer</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};
