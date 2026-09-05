import React, { useState } from 'react';
import { Sparkles, ShieldAlert, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { Button } from '../common/Button';

export const MANDATORY_AI_DISCLAIMER =
  "MedLens summarizes and organizes reported information. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional.";

interface AISummaryCardProps {
  summaryText?: string;
  generatedAt?: string;
  recordsAnalyzedCount?: number;
  className?: string;
  onRegenerate?: () => void | Promise<void>;
  isRegenerating?: boolean;
  isAvailable?: boolean;
  showFallbackToggle?: boolean;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summaryText = "",
  generatedAt = "Today",
  recordsAnalyzedCount = 0,
  className = "",
  onRegenerate,
  isRegenerating = false,
  isAvailable = true,
  showFallbackToggle = true
}) => {
  const [simulatedUnavailable, setSimulatedUnavailable] = useState(false);
  const [localRegenerating, setLocalRegenerating] = useState(false);

  const effectiveAvailable =
    isAvailable &&
    !simulatedUnavailable &&
    Boolean(summaryText && summaryText.trim().length > 0);

  const regenerating = isRegenerating || localRegenerating;

  const handleRegenerateClick = async () => {
    if (onRegenerate) {
      setLocalRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setTimeout(() => setLocalRegenerating(false), 450);
      }
    }
  };

  return (
    <div
      role="region"
      aria-label="AI Summary section"
      className={`relative rounded-2xl border-2 border-indigo-200/90 bg-linear-to-b from-indigo-50/70 via-white to-purple-50/30 p-5 lg:p-6 shadow-sm overflow-hidden ${className}`}
    >
      {/* Visual Accent Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header with ?? AI Summary, Visual Tags & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-indigo-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-500/20 shrink-0">
            ??
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">AI Summary</h3>
              <ProvenanceBadge source="ai_generated" size="xs" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-100/90 text-indigo-800 border border-indigo-200">
                Generated from verified patient records.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-normal">
              <span>Last generated: {generatedAt}</span>
              {recordsAnalyzedCount > 0 && (
                <>
                  <span>?</span>
                  <span>Synthesized from {recordsAnalyzedCount} verified clinical {recordsAnalyzedCount === 1 ? 'record' : 'records'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {showFallbackToggle && (
            <button
              type="button"
              onClick={() => setSimulatedUnavailable(!simulatedUnavailable)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
              title="Test the fallback state when AI service is unavailable"
            >
              {simulatedUnavailable ? 'Restore Summary' : 'Simulate AI Unavailable'}
            </button>
          )}

          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              disabled={regenerating}
              onClick={handleRegenerateClick}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-indigo-600 ${regenerating ? 'animate-spin' : ''}`}
                />
              }
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-semibold text-xs"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate Summary'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="py-4">
        {effectiveAvailable ? (
          <div className="space-y-3">
            <p className="text-sm sm:text-[15px] leading-relaxed text-slate-800 font-normal">
              {summaryText}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-md border border-indigo-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Source-bounded ? No diagnosis or treatment advice
              </span>
            </div>
          </div>
        ) : (
          /* Fallback State: "AI summary is currently unavailable." */
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">
              AI summary is currently unavailable.
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-3 leading-relaxed">
              The summary cannot be rendered at this time. This can occur when external clinical reports have not yet completed verification, or if the synthesis service is offline.
            </p>
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSimulatedUnavailable(false);
                  handleRegenerateClick();
                }}
                icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
                className="text-xs"
              >
                Retry Generation
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mandatory Clinical Disclaimer Underneath */}
      <div className="mt-1 rounded-xl bg-amber-50/90 border border-amber-200/80 p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block text-amber-950">Clinical Information Disclaimer:</span>
          <p className="text-amber-900/90 leading-relaxed">
            {MANDATORY_AI_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
};
