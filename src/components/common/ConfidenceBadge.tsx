import React from 'react';
import { AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export function getConfidenceTier(confidence?: number): {
  tier: ConfidenceTier;
  percentage: number;
  label: string;
  badgeClass: string;
  isLow: boolean;
} {
  if (confidence === undefined || confidence === null || isNaN(confidence)) {
    return {
      tier: 'medium',
      percentage: 85,
      label: '85% Medium',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      isLow: false
    };
  }

  // Normalize: if given 0.0 - 1.0, convert to 0 - 100
  const pct = confidence <= 1.0 && confidence > 0 ? Math.round(confidence * 100) : Math.round(confidence);

  if (pct >= 90) {
    return {
      tier: 'high',
      percentage: pct,
      label: `${pct}% High`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10',
      isLow: false
    };
  }

  if (pct >= 70) {
    return {
      tier: 'medium',
      percentage: pct,
      label: `${pct}% Medium`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/10',
      isLow: false
    };
  }

  return {
    tier: 'low',
    percentage: pct,
    label: `${pct}% Low`,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20 font-semibold',
    isLow: true
  };
}

export const CONFIDENCE_TOOLTIP_TEXT =
  "Confidence indicates how reliably the system extracted this information from the source document. It does not indicate medical certainty.";

export const LOW_CONFIDENCE_WARNING_TEXT =
  "?? Low extraction confidence ? please verify this information.";

interface ConfidenceBadgeProps {
  confidence?: number;
  showWarning?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showWarning = false,
  size = 'xs',
  className = ''
}) => {
  const { tier, label, badgeClass, isLow } = getConfidenceTier(confidence);

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[11px]'
      : size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs';

  const icon =
    tier === 'high' ? (
      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
    ) : tier === 'medium' ? (
      <Activity className="w-3 h-3 text-amber-600 shrink-0" />
    ) : (
      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 stroke-[2.5]" />
    );

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        title={CONFIDENCE_TOOLTIP_TEXT}
        className={`inline-flex items-center gap-1 rounded-md border font-medium cursor-help transition-colors ${sizeClasses} ${badgeClass} ${className}`}
      >
        {icon}
        <span>{label}</span>
      </span>

      {showWarning && isLow && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded"
          title={CONFIDENCE_TOOLTIP_TEXT}
        >
          {LOW_CONFIDENCE_WARNING_TEXT}
        </span>
      )}
    </div>
  );
};
