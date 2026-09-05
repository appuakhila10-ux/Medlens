import React from 'react';
import { Menu, Search, Bell, ShieldCheck, UserCheck } from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  activePage,
  onNavigate
}) => {
  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Clinical Information Intelligence' },
    patients: { title: 'Patients Directory', subtitle: 'Manage Patient Cohort & Records' },
    upload: { title: 'Upload Medical Report', subtitle: 'Ingest PDF, JPG & PNG Diagnostics' },
    records: { title: 'Patient Medical Record', subtitle: 'Traceable Clinical Ledger & Labs' },
    compare: { title: 'Compare Reports', subtitle: 'Longitudinal Laboratory Variance Analysis' },
    conflicts: { title: 'Clinical Inconsistencies', subtitle: 'Discrepancy Detection & Traceability' },
    timeline: { title: 'Patient Audit Timeline', subtitle: 'Chronological Provenance History' },
    settings: { title: 'Settings & Security', subtitle: 'System Configuration & Compliance' },
  };

  const current = pageTitles[activePage] || { title: 'MedLens', subtitle: 'Clinical Intelligence' };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>Clinical Mode Active</span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('conflicts')}
          aria-label="Potential Inconsistencies"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" aria-hidden="true" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
            SL
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
            Dr. Lin
          </span>
        </div>
      </div>
    </header>
  );
};
