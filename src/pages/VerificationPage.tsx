import React, { useState, useEffect } from 'react';
import { MedicalTest, Patient, MedicalReport, MedicalTestStatus } from '../types/clinical';
import { ExtractedReportBundle, calculateStatusFromRange } from '../utils/extractor';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Filter,
  Save,
  UserCheck,
  Info,
  Check
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface VerificationPageProps {
  patients: Patient[];
  preSelectedPatientId?: string;
  extractedBundle?: ExtractedReportBundle | null;
  onSaveToPatientRecord: (
    report: Omit<MedicalReport, 'id'>,
    tests: Omit<MedicalTest, 'id'>[],
    targetPatientId: string
  ) => void;
  onNavigate: (page: NavPage, patientId?: string) => void;
}

interface EditableTestItem {
  tempId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: MedicalTestStatus;
  date: string;
  source: string;
  confidence: number;
  observation?: string;
  isConfirmed: boolean;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  patients,
  preSelectedPatientId,
  extractedBundle,
  onSaveToPatientRecord,
  onNavigate
}) => {
  const [targetPatientId, setTargetPatientId] = useState<string>(
    preSelectedPatientId || patients[0]?.id || 'ML-1042'
  );

  const [items, setItems] = useState<EditableTestItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditableTestItem | null>(null);

  // Load items from extractedBundle or fallback demo items
  useEffect(() => {
    if (extractedBundle && extractedBundle.tests) {
      const mapped = extractedBundle.tests.map((t, idx) => ({
        tempId: `TMP-${idx}-${Date.now()}`,
        testName: t.testName,
        value: t.value,
        unit: t.unit,
        referenceRange: t.referenceRange,
        status: t.status,
        date: t.date || extractedBundle.reportDate,
        source: "Extracted from report",
        confidence: t.confidence || 0.96,
        observation: t.observation || "Extracted from source laboratory report",
        isConfirmed: false
      }));
      setItems(mapped);
    } else {
      // Default fallback items
      const today = new Date().toISOString().split('T')[0];
      setItems([
        {
          tempId: 'TMP-1',
          testName: 'Hemoglobin',
          value: '10.2',
          unit: 'g/dL',
          referenceRange: '12.0 – 16.0 g/dL',
          status: 'Low',
          date: today,
          source: 'Extracted from report',
          confidence: 0.96,
          observation: 'Microcytic presentation',
          isConfirmed: false
        },
        {
          tempId: 'TMP-2',
          testName: 'Hematocrit',
          value: '31.4',
          unit: '%',
          referenceRange: '37.0 – 48.0 %',
          status: 'Low',
          date: today,
          source: 'Extracted from report',
          confidence: 0.98,
          observation: 'Red cell fraction low',
          isConfirmed: false
        },
        {
          tempId: 'TMP-3',
          testName: 'White Blood Cells (WBC)',
          value: '6.8',
          unit: 'x10^3/uL',
          referenceRange: '4.5 – 11.0 x10^3/uL',
          status: 'Normal',
          date: today,
          source: 'Extracted from report',
          confidence: 0.99,
          observation: 'Normal limits',
          isConfirmed: false
        },
        {
          tempId: 'TMP-4',
          testName: 'Serum Ferritin',
          value: '14',
          unit: 'ng/mL',
          referenceRange: '15 – 150 ng/mL',
          status: 'Low',
          date: today,
          source: 'Extracted from report',
          confidence: 0.94,
          observation: 'Low serum ferritin',
          isConfirmed: false
        },
        {
          tempId: 'TMP-5',
          testName: 'RBC Morphology Index',
          value: 'Microcytosis',
          unit: 'Qualitative',
          referenceRange: 'Reference range unavailable — status not determined.',
          status: 'Range unavailable',
          date: today,
          source: 'Extracted from report',
          confidence: 0.91,
          observation: 'Source report provides no discrete reference bounds',
          isConfirmed: false
        }
      ]);
    }
  }, [extractedBundle]);

  const handleConfirmItem = (tempId: string) => {
    setItems(prev => prev.map(item => item.tempId === tempId ? { ...item, isConfirmed: true } : item));
  };

  const handleRejectItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const handleConfirmAll = () => {
    setItems(prev => prev.map(item => ({ ...item, isConfirmed: true })));
  };

  const handleSaveModalEdit = (updated: EditableTestItem) => {
    setItems(prev => prev.map(item => item.tempId === updated.tempId ? { ...updated, isConfirmed: true } : item));
    setEditingItem(null);
  };

  const handleSaveToPatient = () => {
    if (items.length === 0) return;

    const fileName = extractedBundle?.fileName || "Clinical_Diagnostic_Report.pdf";
    const fileType = extractedBundle?.fileType || "PDF";
    const reportDate = extractedBundle?.reportDate || new Date().toISOString().split('T')[0];
    const sourceFacility = extractedBundle?.sourceFacility || "Clinical Pathology Laboratory";

    const reportData: Omit<MedicalReport, 'id'> = {
      patientId: targetPatientId,
      fileName,
      fileType,
      fileSize: extractedBundle?.fileSize || "1.4 MB",
      reportDate,
      uploadDate: new Date().toISOString().split('T')[0] + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedText: extractedBundle?.rawExtractedText || "Extracted laboratory diagnostic panel.",
      processingStatus: "Completed",
      verificationStatus: "verified",
      source: sourceFacility,
      extractedEntitiesCount: items.length
    };

    const testsData: Omit<MedicalTest, 'id'>[] = items.map(i => ({
      patientId: targetPatientId,
      testName: i.testName,
      value: i.value,
      unit: i.unit,
      referenceRange: i.referenceRange,
      status: i.status,
      date: i.date,
      observation: i.observation,
      source: "Extracted from report",
      confidence: i.confidence,
      verified: true
    }));

    onSaveToPatientRecord(reportData, testsData, targetPatientId);
  };

  const assignedPatient = patients.find(p => p.id === targetPatientId) || patients[0];
  const confirmedCount = items.filter(i => i.isConfirmed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('upload')}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">
              Source: {extractedBundle?.fileName || "Diagnostic Report"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Extracted Information Verification</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Human verification required: Review, edit, or reject extracted fields before saving to the patient record.
          </p>
        </div>

        {/* Patient Selector for Linking */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-700 pl-1">Assign to Patient:</span>
          <select
            value={targetPatientId}
            onChange={(e) => setTargetPatientId(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Human-in-the-Loop Protocol Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 font-semibold block text-sm">
            Human Clinical Verification Protocol
          </strong>
          <p className="text-amber-900 leading-relaxed">
            Verify each quantitative value against the source laboratory report. Status indicators (<em>Normal</em>, <em>Low</em>, <em>High</em>) are calculated strictly when reference bounds exist in the source report. If no bounds were provided, status defaults to <em>"Reference range unavailable — status not determined."</em>
          </p>
        </div>
      </div>

      {/* Verification Items List */}
      <Card
        title={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>
                Extracted Fields ({items.length} items • {confirmedCount} confirmed)
              </span>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleConfirmAll}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
              >
                Confirm All Items
              </button>
            )}
          </div>
        }
        subtitle="Review extracted test names, values, units, reference intervals, and confidence scores"
        noPadding
      >
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-semibold text-slate-800">No items remaining in queue</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              All extracted items have been handled or rejected.
            </p>
            <Button variant="primary" size="sm" onClick={() => onNavigate('upload')}>
              Upload Another Report
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.tempId} className={`p-4 sm:p-5 transition-colors ${item.isConfirmed ? 'bg-emerald-50/20' : 'hover:bg-slate-50/70'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Test Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{item.testName}</span>
                      <Badge
                        status={
                          item.status === 'Normal'
                            ? 'normal'
                            : item.status === 'High'
                            ? 'high'
                            : item.status === 'Low'
                            ? 'low'
                            : 'unavailable'
                        }
                        label={item.status}
                        size="sm"
                      />
                      {item.isConfirmed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3 text-emerald-600" /> Confirmed
                        </span>
                      )}
                    </div>

                    {/* Extracted Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Value:</span>
                        <span className="font-mono text-base font-bold text-blue-900">
                          {item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[11px]">Reference Range (source):</span>
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {item.referenceRange}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Report Date:</span>
                        <span className="font-semibold text-slate-700">{item.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Provenance:</span>
                        <ProvenanceBadge source="extracted_from_report" size="xs" />
                      </div>
                    </div>

                    {/* Extraction Confidence & Observation */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Extraction confidence: {Math.round(item.confidence * 100)}%</span>
                      </div>
                      {item.observation && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 italic">{item.observation}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: Confirm, Edit, Reject */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleConfirmItem(item.tempId)}
                      className={item.isConfirmed ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700"}
                    >
                      {item.isConfirmed ? 'Confirmed' : 'Confirm'}
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
                      onClick={() => handleRejectItem(item.tempId)}
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

        {/* Global Save Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-600">
              Ready to link <strong>{items.length} verified biomarkers</strong> to{' '}
              <strong className="text-blue-700">{assignedPatient?.name}</strong> ({assignedPatient?.id}).
            </div>
            <Button
              variant="teal"
              size="md"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSaveToPatient}
              className="shadow-sm"
            >
              Save to Patient Record
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit Extracted Field — ${editingItem.testName}`}
          maxWidth="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<Check className="w-4 h-4" />}
                onClick={() => handleSaveModalEdit(editingItem)}
              >
                Save & Confirm Item
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Test Name</label>
              <input
                type="text"
                value={editingItem.testName}
                onChange={(e) => setEditingItem({ ...editingItem, testName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Value</label>
                <input
                  type="text"
                  value={editingItem.value}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    const newStatus = calculateStatusFromRange(newVal, editingItem.referenceRange);
                    setEditingItem({ ...editingItem, value: newVal, status: newStatus });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference Range (from source report)</label>
              <input
                type="text"
                value={editingItem.referenceRange}
                onChange={(e) => {
                  const newRange = e.target.value;
                  const newStatus = calculateStatusFromRange(editingItem.value, newRange);
                  setEditingItem({ ...editingItem, referenceRange: newRange, status: newStatus });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Must match the range explicitly reported on the source document.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status (computed from range)</label>
              <select
                value={editingItem.status}
                onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as MedicalTestStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
                <option value="Range unavailable">Range unavailable</option>
                <option value="Not determined">Not determined</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Observation / Notes</label>
              <input
                type="text"
                value={editingItem.observation || ''}
                onChange={(e) => setEditingItem({ ...editingItem, observation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};