import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface SafetyBannerProps {
  className?: string;
  variant?: 'subtle' | 'compact' | 'callout';
}

export const UNIVERSAL_SAFETY_MESSAGE =
  "MedLens assists with organizing and understanding medical information. It does not replace professional medical advice.";

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  className = '',
  variant = 'subtle'
}) => {
  if (variant === 'compact') {
    return (
      <div
        role="region"
        aria-label="Clinical safety notice"
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50/90 border border-sky-200 text-sky-900 text-xs font-medium ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span>{UNIVERSAL_SAFETY_MESSAGE}</span>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Clinical safety notice"
      className={`rounded-xl border border-sky-200/90 bg-linear-to-r from-sky-50 via-blue-50/40 to-slate-50 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-sky-950 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-md bg-sky-100 text-sky-700 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold text-sky-900 shrink-0">Clinical Notice:</span>
          <span className="text-sky-800/90 font-normal leading-relaxed">
            {UNIVERSAL_SAFETY_MESSAGE}
          </span>
        </div>
      </div>
      <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100/80 text-sky-700 border border-sky-200/70 shrink-0">
        Non-Diagnostic Tool
      </span>
    </div>
  );
};
