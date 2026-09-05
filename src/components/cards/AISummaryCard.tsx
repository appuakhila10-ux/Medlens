import React from 'react';
import { Sparkles, ShieldAlert, FileSearch, Info } from 'lucide-react';

interface AISummaryCardProps {
  summaryText: string;
  generatedAt?: string;
  recordsAnalyzedCount?: number;
  className?: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summaryText,
  generatedAt = "Today",
  recordsAnalyzedCount = 4,
  className = ""
}) => {
  return (
    <div className={`relative rounded-2xl border-2 border-indigo-200 bg-linear-to-b from-indigo-50/70 via-white to-purple-50/30 p-5 lg:p-6 shadow-sm overflow-hidden ${className}`}>
      {/* Visual Accent Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header with AI Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                AI Summary
              </span>
              <span className="text-xs text-indigo-900/70 font-medium">
                Generated from available records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Synthesized from {recordsAnalyzedCount} chronological clinical documents • {generatedAt}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200">
          <FileSearch className="w-3.5 h-3.5 text-slate-400" />
          <span>Source-Traceable</span>
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-normal">
          {summaryText}
        </p>
      </div>

      {/* Mandatory Safety Rule Disclaimer */}
      <div className="mt-2 rounded-xl bg-amber-50/90 border border-amber-200/80 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block text-amber-950">Clinical Information Notice:</span>
          <p className="text-amber-900/90">
            This summary organizes available medical information and is not a medical diagnosis or treatment recommendation. Always cross-reference original laboratory reports and consult licensed clinical judgment.
          </p>
        </div>
      </div>
    </div>
  );
};
