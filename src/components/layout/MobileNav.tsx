import React from 'react';
import {
  X,
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
  Activity
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  conflictCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  conflictCount = 2
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'upload', label: 'Upload Report', icon: UploadCloud },
    { id: 'records', label: 'Medical Records', icon: FlaskConical },
    { id: 'compare', label: 'Compare Reports', icon: GitCompare },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: AlertTriangle,
      badge: conflictCount > 0 ? conflictCount : null
    },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: NavPage) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10 animate-slideRight"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white" aria-hidden="true">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900">MedLens</span>
              <p className="text-[10px] text-slate-500">Clinical Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleSelect(item.id as NavPage)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MedLens AI v1.2</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>HIPAA Protected UI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
