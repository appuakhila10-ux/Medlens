import React from 'react';
import { ProvenanceType } from '../../types/clinical';
import { FileText, UserCheck, Sparkles } from 'lucide-react';

interface ProvenanceBadgeProps {
  source?: ProvenanceType | 'user_provided' | 'extracted_from_report' | 'ai_generated' | string;
  sourceDocument?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  brackets?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  source = 'user_provided',
  sourceDocument,
  className = '',
  size = 'xs',
  brackets = true
}) => {
  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[11px]'
      : size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs';

  const normalized = (source || '').toLowerCase().trim();

  const isAi =
    normalized === 'ai_generated' ||
    normalized === 'ai' ||
    normalized.includes('ai') ||
    normalized.includes('generated');

  const isExtracted =
    normalized === 'extracted_from_report' ||
    normalized === 'report_extracted' ||
    normalized.includes('extracted') ||
    normalized.includes('ocr') ||
    normalized.includes('report');


  if (isAi) {
    const text = brackets ? '[AI generated]' : 'AI generated';
    return (
      <span
        title={sourceDocument ? `AI generated: ${sourceDocument}` : "AI generated: Synthesized by MedLens clinical organizing pipeline from verified records."}
        className={`inline-flex items-center gap-1 rounded-md font-semibold bg-purple-50 text-purple-700 border border-purple-200/90 shadow-2xs ${sizeClasses} ${className}`}
      >
        <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
        <span>{text}</span>
      </span>
    );
  }

  if (isExtracted) {
    const text = brackets ? '[Extracted from report]' : 'Extracted from report';
    return (
      <span
        title={sourceDocument ? `Extracted from: ${sourceDocument}` : "Extracted from report: Extracted from source laboratory report via OCR/document ingestion."}
        className={`inline-flex items-center gap-1 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200/90 ${sizeClasses} ${className}`}
      >
        <FileText className="w-3 h-3 text-blue-600 shrink-0" />
        <span>{text}</span>
      </span>
    );
  }


  // Default: User provided
  const text = brackets ? '[User provided]' : 'User provided';
  return (
    <span
      title="User provided: Documented by clinician or intake staff during clinical intake."
      className={`inline-flex items-center gap-1 rounded-md font-medium bg-teal-50 text-teal-800 border border-teal-200/90 ${sizeClasses} ${className}`}
    >
      <UserCheck className="w-3 h-3 text-teal-700 shrink-0" />
      <span>{text}</span>
    </span>
  );
};
