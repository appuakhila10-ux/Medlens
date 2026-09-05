import React, { useState } from 'react';
import { LabResult, Patient } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { EditTestModal } from '../components/modals/EditTestModal';
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface VerificationPageProps {
  patient: Patient;
  labResults: LabResult[];
  onConfirmItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  onUpdateItem: (updated: LabResult) => void;
  onNavigate: (page: NavPage, patientId?: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  patient,
  labResults,
  onConfirmItem,
  onRejectItem,
  onUpdateItem,
  onNavigate
}) => {
  const [editingItem, setEditingItem] = useState<LabResult | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'review'>('all');

  // Filter unverified / pending items for this patient
  const pendingItems = labResults.filter(
    (item) => item.verificationStatus === 'pending' || item.verificationStatus === 'in_review'
  );

  const displayedItems = pendingItems.filter((item) => {
    if (filterConfidence === 'high') return item.confidence >= 0.95;
    if (filterConfidence === 'review') return item.confidence < 0.95;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header with Human-in-the-loop emphasis */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('records', patient.id)}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Record
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">{patient.name} ({patient.id})</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Extracted Information Verification</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Review and validate automated extractions prior to saving into the clinical patient ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Human-in-the-Loop Protocol</span>
          </div>
        </div>
      </div>

      {/* Prominent Verification Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 font-semibold block text-sm">
            Human Clinical Verification Required
          </strong>
          <p className="text-amber-900/90 leading-relaxed">
            MedLens utilizes optical character recognition and clinical entity mapping with confidence telemetry. Automated extractions do not constitute verified clinical data until an authorized clinician or clinical staff member confirms accuracy against the original source document.
          </p>
        </div>
      </div>

      {/* Verification Items List */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span>Pending Extractions ({displayedItems.length} items awaiting review)</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal text-slate-400">Filter confidence:</span>
              <button
                onClick={() => setFilterConfidence('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${
                  filterConfidence === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterConfidence('high')}
                className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${
                  filterConfidence === 'high' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                ≥ 95%
              </button>
              <button
                onClick={() => setFilterConfidence('review')}
                className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${
                  filterConfidence === 'review' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                &lt; 95%
              </button>
            </div>
          </div>
        }
        noPadding
      >
        {displayedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-semibold text-slate-800">All extractions verified</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              All parsed laboratory values for this cohort have been reviewed.
            </p>
            <Button variant="primary" size="sm" onClick={() => onNavigate('records', patient.id)}>
              View Full Patient Record
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedItems.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left test info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{item.testName}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <Badge status={item.status} />
                    </div>

                    {/* Extracted value and source range */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Extracted Value</span>
                        <span className="font-mono text-base font-bold text-blue-900">
                          {item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reference Range (source report)</span>
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {item.referenceRange}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[11px]">Source Document</span>
                        <span className="font-medium text-slate-700 truncate block" title={item.sourceDocument}>
                          {item.sourceDocument}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Extraction confidence: {Math.round(item.confidence * 100)}%</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 text-[11px]">Extracted on {item.sourceDate}</span>
                    </div>
                  </div>

                  {/* Right Actions: Confirm, Edit, Reject */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => onConfirmItem(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/15"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => setEditingItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<XCircle className="w-4 h-4 text-rose-500" />}
                      onClick={() => onRejectItem(item.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Test Modal */}
      <EditTestModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSave={onUpdateItem}
      />
    </div>
  );
};
