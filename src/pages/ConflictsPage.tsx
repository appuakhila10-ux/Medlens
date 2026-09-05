import React, { useState } from 'react';
import { ClinicalConflict } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SafetyBanner } from '../components/common/SafetyBanner';
import { Modal } from '../components/common/Modal';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';
import { getStoredConflicts, updateStoredConflict } from '../utils/storage';

interface ConflictsPageProps {
  onSelectPatient: (patientId: string) => void;
  conflicts?: ClinicalConflict[];
  onRefreshConflicts?: () => void;
}

export const ConflictsPage: React.FC<ConflictsPageProps> = ({
  onSelectPatient,
  conflicts: propConflicts,
  onRefreshConflicts
}) => {
  const [localConflicts, setLocalConflicts] = useState<ClinicalConflict[]>(() => getStoredConflicts());
  const conflicts = propConflicts || localConflicts;

  const [activeReviewConflict, setActiveReviewConflict] = useState<ClinicalConflict | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedResolution, setSelectedResolution] = useState<'source1' | 'source2' | 'manual'>('manual');

  const handleResolve = () => {
    if (!activeReviewConflict) return;
    const note = resolutionNote || 'Clinical review completed by attending clinician.';
    updateStoredConflict(activeReviewConflict.id, {
      status: 'resolved',
      resolutionNotes: note
    });
    setLocalConflicts(getStoredConflicts());
    if (onRefreshConflicts) {
      onRefreshConflicts();
    }
    setActiveReviewConflict(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Universal Clinical Safety Banner */}
      <SafetyBanner />

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Clinical Inconsistency Detection</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Automated multi-document cross-reference flags potential inconsistencies between disparate clinical sources for staff adjudication.
        </p>
      </div>

      {/* Safety Protocol Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 font-semibold block text-sm">
            Potential Inconsistency Notice
          </strong>
          <p className="leading-relaxed text-amber-900/90">
            MedLens highlights variations between documented statements across medical records. Wording reflects neutral detection (<em>"Potential inconsistency detected"</em>) without drawing medical or diagnostic conclusions. Clinicians must confirm the ground-truth allergy or regimen.
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {conflicts.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Clinical Inconsistencies Detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All multi-document cross-references are concordant across verified patient records. When a new medical report is verified, MedLens automatically cross-references reported allergies, medications, and demographics.
            </p>
          </Card>
        ) : (
          conflicts.map((conflict) => (
          <Card key={conflict.id} noPadding className="overflow-hidden">
            {/* Conflict Card Header */}
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100/70 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{conflict.title}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {conflict.category}
                    </span>
                    <Badge
                      status={conflict.status === 'resolved' ? 'resolved' : 'active'}
                      label={conflict.status === 'resolved' ? 'Adjudicated / Resolved' : 'Potential Inconsistency Detected'}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: <strong className="text-slate-800">{conflict.patientName}</strong> ({conflict.patientId}) • Detected: {conflict.detectedDate}
                  </p>
                </div>
              </div>

              <div>
                <Button
                  variant={conflict.status === 'resolved' ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => setActiveReviewConflict(conflict)}
                  className={conflict.status === 'resolved' ? '' : 'bg-amber-600 hover:bg-amber-700 border-transparent'}
                >
                  {conflict.status === 'resolved' ? 'View Resolution' : 'Review & Adjudicate'}
                </Button>
              </div>
            </div>

            {/* Inconsistency Details */}
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-700">
                {conflict.description}
              </p>

              {/* Side-by-side comparison of Source 1 vs Source 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Source Document 1
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{conflict.source1.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{conflict.source1.name}</span>
                  </h4>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                    "{conflict.source1.claim}"
                  </div>
                </div>

                {/* Source 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Source Document 2
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{conflict.source2.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{conflict.source2.name}</span>
                  </h4>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                    "{conflict.source2.claim}"
                  </div>
                </div>
              </div>

              {/* Resolution Notes if already resolved */}
              {conflict.status === 'resolved' && conflict.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Clinical Adjudication Note:</strong>
                    <span>{conflict.resolutionNotes}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )))}
      </div>

      {/* Review Modal */}
      {activeReviewConflict && (
        <Modal
          isOpen={!!activeReviewConflict}
          onClose={() => setActiveReviewConflict(null)}
          title="Review Potential Inconsistency"
          maxWidth="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setActiveReviewConflict(null)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleResolve}>
                Save Clinical Adjudication
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Please review the conflicting records for <strong>{activeReviewConflict.patientName}</strong> and document which information is clinically accurate:
            </p>

            <div className="space-y-2">
              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  checked={selectedResolution === 'source1'}
                  onChange={() => setSelectedResolution('source1')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800">Verify Source 1 as Ground Truth</span>
                  <p className="text-slate-500 text-[11px]">{activeReviewConflict.source1.claim}</p>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  checked={selectedResolution === 'source2'}
                  onChange={() => setSelectedResolution('source2')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800">Verify Source 2 as Ground Truth</span>
                  <p className="text-slate-500 text-[11px]">{activeReviewConflict.source2.claim}</p>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  checked={selectedResolution === 'manual'}
                  onChange={() => setSelectedResolution('manual')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-800">Flag for Follow-up / Direct Patient Clarification</span>
                  <p className="text-slate-500 text-[11px]">Maintain active safety alert in clinical chart.</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Adjudication Notes (Mandatory for Audit Trail)
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Document verification discussion with patient or pharmacy clarification..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
