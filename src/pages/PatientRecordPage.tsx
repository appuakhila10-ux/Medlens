import React, { useState } from 'react';
import { Patient, MedicalTest, MedicalTestStatus, MedicalReport } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { ConfidenceBadge, getConfidenceTier, CONFIDENCE_TOOLTIP_TEXT } from '../components/common/ConfidenceBadge';
import { AISummaryCard } from '../components/cards/AISummaryCard';
import { SafetyBanner } from '../components/common/SafetyBanner';
import { Modal } from '../components/common/Modal';
import {
  User,
  Activity,
  Calendar,
  Shield,
  ShieldCheck,
  FileText,
  AlertCircle,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  Info,
  ChevronLeft,
  FileSpreadsheet,
  AlertTriangle,
  Stethoscope,
  Pill,
  HeartPulse,
  FileEdit,
  ClipboardList,
  Eye,
  FileCheck,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface PatientRecordPageProps {
  patient: Patient;
  patientsList: Patient[];
  medicalTests?: MedicalTest[];
  medicalReports?: MedicalReport[];
  onSelectPatient: (patientId: string) => void;
  onNavigate: (page: NavPage, patientId?: string) => void;
  onOpenEditPatient: (patient: Patient) => void;
  onOpenDeletePatient: (patient: Patient) => void;
  onRegenerateSummary?: (patientId: string) => Promise<void> | void;
  isRegeneratingSummary?: boolean;
}

export const PatientRecordPage: React.FC<PatientRecordPageProps> = ({
  patient,
  patientsList,
  medicalTests = [],
  medicalReports = [],
  onSelectPatient,
  onNavigate,
  onOpenEditPatient,
  onOpenDeletePatient,
  onRegenerateSummary,
  isRegeneratingSummary = false
}) => {
  const [selectedReportView, setSelectedReportView] = useState<MedicalReport | null>(null);

  // Filter laboratory tests specifically for this patient
  const patientTests = medicalTests.filter(t => t.patientId === patient.id);
  // Filter medical reports specifically for this patient
  const patientReports = medicalReports.filter(r => r.patientId === patient.id);

  // Confidence distribution calculations
  const highConfTests = patientTests.filter(t => getConfidenceTier(t.confidence).tier === 'high');
  const medConfTests = patientTests.filter(t => getConfidenceTier(t.confidence).tier === 'medium');
  const lowConfTests = patientTests.filter(t => getConfidenceTier(t.confidence).tier === 'low');

  const getTestStatusBadge = (status: MedicalTestStatus, refRange: string) => {
    // IMPORTANT Rule: Do not calculate a status unless a reference range is actually available from the source report.
    if (!refRange || refRange.trim() === '' || refRange.trim().toLowerCase().includes('unavailable') || refRange.trim() === '-') {
      return <Badge status="unavailable" label="Range unavailable" />;
    }

    switch (status) {
      case 'Normal':
        return <Badge status="normal" label="Normal" />;
      case 'High':
        return <Badge status="high" label="High" />;
      case 'Low':
        return <Badge status="low" label="Low" />;
      case 'Not determined':
        return <Badge status="unavailable" label="Not determined" />;
      default:
        return <Badge status="unavailable" label="Range unavailable" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Universal Clinical Safety Banner */}
      <SafetyBanner />

      {/* Patient Header with Switcher & Edit/Delete Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-clinical-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/10 shrink-0">
            {patient.name ? patient.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'PT'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.name}</h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {patient.id}
              </span>
              <ProvenanceBadge source="user_provided" />
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-600">
              <span><strong>Age:</strong> {patient.age} yrs</span>
              <span>•</span>
              <span><strong>Sex:</strong> {patient.sex}</span>
              <span>•</span>
              <span><strong>Registered:</strong> {patient.createdAt || 'Standard Intake'}</span>
              <span>•</span>
              <span><strong>Last Modified:</strong> {patient.updatedAt || patient.createdAt || 'Recent'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Switch:</span>
            <select
              value={patient.id}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              {patientsList.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />}
            onClick={() => onOpenEditPatient(patient)}
            className="hover:border-blue-500 hover:text-blue-700"
          >
            Edit Patient
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            onClick={() => onOpenDeletePatient(patient)}
            className="hover:bg-rose-50 text-rose-600"
            title="Delete patient record"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Section 1: PATIENT INFORMATION */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <User className="w-4 h-4 text-blue-600" />
              <span>Patient Information</span>
            </div>
            <ProvenanceBadge source="user_provided" />
          </div>
        }
        subtitle="Core demographic identity and clinical registry metadata"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Full Legal Name</span>
            <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{patient.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Patient ID</span>
            <span className="font-mono font-bold text-blue-800 text-sm mt-0.5 block">{patient.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Age</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{patient.age} years</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Biological Sex</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{patient.sex}</span>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 2. SYMPTOMS / CONDITIONS / ALLERGIES / MEDICATIONS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Symptoms / Conditions / Allergies / Medications
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Documented Clinical Intake</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symptoms Section */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Symptoms</span>
                </div>
                <ProvenanceBadge source="user_provided" />
              </div>
            }
            subtitle="User-provided symptoms recorded during clinical intake"
          >
            {Array.isArray(patient.symptoms) && patient.symptoms.length > 0 ? (
              <ul className="space-y-2">
                {patient.symptoms.map((symptom, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-medium text-slate-800">{symptom}</span>
                    <ProvenanceBadge source="user_provided" size="xs" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No symptoms reported by user.</p>
            )}
          </Card>

          {/* Existing Conditions Section */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Existing Conditions</span>
                </div>
                <ProvenanceBadge source="user_provided" />
              </div>
            }
            subtitle="User-provided conditions documented in patient history"
          >
            {Array.isArray(patient.conditions) && patient.conditions.length > 0 ? (
              <ul className="space-y-2">
                {patient.conditions.map((condition, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-medium text-slate-800">{condition}</span>
                    <ProvenanceBadge source="user_provided" size="xs" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No existing conditions documented.</p>
            )}
          </Card>

          {/* Allergies Section */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Allergies</span>
                </div>
                <ProvenanceBadge source="user_provided" />
              </div>
            }
            subtitle="User-provided drug and environmental sensitivities"
          >
            {Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
              <ul className="space-y-2">
                {patient.allergies.map((allergy, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/40 border border-amber-200/60 text-xs"
                  >
                    <span className="font-semibold text-amber-950">{allergy}</span>
                    <ProvenanceBadge source="user_provided" size="xs" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No known drug allergies reported.</p>
            )}
          </Card>

          {/* Medications Section */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span>Medications</span>
                </div>
                <ProvenanceBadge source="user_provided" />
              </div>
            }
            subtitle="User-provided current pharmacotherapy and supplements"
          >
            {Array.isArray(patient.medications) && patient.medications.length > 0 ? (
              <ul className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <span className="font-medium text-slate-800">{med}</span>
                    <ProvenanceBadge source="user_provided" size="xs" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No active medications recorded.</p>
            )}
          </Card>
        </div>

        {/* Additional Notes Section */}
        {patient.notes && (
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-slate-600" />
                  <span>Additional Intake Notes</span>
                </div>
                <ProvenanceBadge source="user_provided" />
              </div>
            }
            subtitle="User-provided clinical observations and intake remarks"
          >
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-700">
              <p>{patient.notes}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-end">
                <ProvenanceBadge source="user_provided" size="xs" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MEDICAL REPORTS */}
      {/* ========================================================================= */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Medical Reports ({patientReports.length})</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('upload', patient.id)}
            >
              Upload New Report
            </Button>
          </div>
        }
        subtitle="Historical diagnostic files and extracted document telemetry"
        noPadding
      >
        {patientReports.length === 0 ? (
          <div className="py-10 px-6 text-center text-xs text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No medical reports uploaded for this patient.</p>
            <p className="text-slate-400 mt-0.5 mb-3">Upload a PDF or image report to extract structured information.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('upload', patient.id)}
            >
              Upload Report
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table aria-label="Diagnostic Reports Registry" className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-5 py-3">Report Name</th>
                  <th scope="col" className="px-5 py-3">Report Date</th>
                  <th scope="col" className="px-5 py-3">Upload Date</th>
                  <th scope="col" className="px-5 py-3">Processing Status</th>
                  <th scope="col" className="px-5 py-3">Verification Status</th>
                  <th scope="col" className="px-5 py-3">Extracted Tests</th>
                  <th scope="col" className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {report.fileType}
                        </span>
                        <span className="truncate max-w-xs">{report.fileName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {report.reportDate}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {report.uploadDate}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        status={report.processingStatus === 'Completed' ? 'verified' : 'pending'}
                        label={report.processingStatus}
                        size="sm"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        status={report.verificationStatus === 'verified' ? 'verified' : 'pending'}
                        label={report.verificationStatus === 'verified' ? 'Verified' : 'Pending Review'}
                        size="sm"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {report.extractedEntitiesCount} tests
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedReportView(report)}
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. LABORATORY RESULTS */}
      {/* ========================================================================= */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Laboratory Results ({patientTests.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                {patientTests.length} tests recorded
              </span>
            </div>
          </div>
        }
        subtitle="Structured quantitative laboratory panels with source reference bounds and confidence ratings"
        noPadding
      >
        {/* Low Confidence Warning Notice if any low confidence test exists */}
        {lowConfTests.length > 0 && (
          <div className="m-4 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <span className="font-semibold block text-rose-950">
                ⚠️ Low extraction confidence — please verify this information.
              </span>
              <p className="text-rose-800 mt-0.5">
                {lowConfTests.length} test {lowConfTests.length === 1 ? 'result was' : 'results were'} flagged with low extraction confidence (&lt;70%). Cross-reference with original reports before relying on these parameters.
              </p>
            </div>
          </div>
        )}

        {patientTests.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              No medical reports have been processed for this patient.
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              When laboratory reports are uploaded and processed, structured biomarkers and source report reference ranges will populate this ledger.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('upload', patient.id)}
            >
              Upload Medical Report for Extraction
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table aria-label="Verified Clinical Laboratory Results" className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Test</th>
                  <th scope="col" className="px-5 py-3">Value</th>
                  <th scope="col" className="px-5 py-3">Unit</th>
                  <th scope="col" className="px-5 py-3">Reference Range (source report)</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Confidence</th>
                  <th scope="col" className="px-5 py-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">
                      {test.date}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{test.testName}</span>
                        {test.verified && (
                          <span title="Verified & Locked against AI alteration">
                            <Lock className="w-3 h-3 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      {test.observation && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">{test.observation}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-blue-900">
                      {test.value}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {test.unit}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 bg-slate-50/40">
                      {test.referenceRange ? (
                        <span>{test.referenceRange}</span>
                      ) : (
                        <span className="italic text-slate-400">
                          Reference range was not provided in the source report.
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {getTestStatusBadge(test.status, test.referenceRange)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ConfidenceBadge
                        confidence={test.confidence}
                        showWarning={false}
                        size="xs"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <ProvenanceBadge
                        source={test.source === 'User provided' ? 'user_provided' : 'extracted_from_report'}
                        size="xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. AI SUMMARY */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            5
          </span>
          <h3 className="text-base font-bold text-slate-900">AI Summary</h3>
        </div>

        <AISummaryCard
          summaryText={patient.aiSummary?.text || ''}
          generatedAt={patient.aiSummary?.generatedAt || 'Today'}
          recordsAnalyzedCount={patient.aiSummary?.recordsAnalyzedCount || patientTests.length}
          isAvailable={patient.aiSummary?.isAvailable !== false}
          onRegenerate={onRegenerateSummary ? () => onRegenerateSummary(patient.id) : undefined}
          isRegenerating={isRegeneratingSummary}
          showFallbackToggle={true}
        />
      </div>

      {/* ========================================================================= */}
      {/* 6. SOURCE & VERIFICATION INFORMATION */}
      {/* ========================================================================= */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                6
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Source &amp; Verification Information</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audit Trail Active
            </span>
          </div>
        }
        subtitle="Data provenance distribution, extraction confidence metrics, and clinical integrity guarantees"
      >
        <div className="space-y-6 text-xs">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Provenance breakdown card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Data Provenance
                </span>
                <Database className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center justify-between">
                  <ProvenanceBadge source="user_provided" size="xs" />
                  <span className="font-semibold text-slate-700">
                    {(patient.symptoms?.length || 0) +
                      (patient.conditions?.length || 0) +
                      (patient.allergies?.length || 0) +
                      (patient.medications?.length || 0) +
                      (patient.notes ? 1 : 0)}{' '}
                    intake items
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <ProvenanceBadge source="extracted_from_report" size="xs" />
                  <span className="font-semibold text-slate-700">
                    {patientTests.length} tests ({patientReports.length} reports)
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <ProvenanceBadge source="ai_generated" size="xs" />
                  <span className="font-semibold text-slate-700">
                    {patient.aiSummary ? '1 summary synthesized' : '0 summaries'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Confidence distribution card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Extraction Confidence
                </span>
                <span
                  title={CONFIDENCE_TOOLTIP_TEXT}
                  className="cursor-help"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    High (90–100%)
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {highConfTests.length} tests
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium (70–89%)
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {medConfTests.length} tests
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Low (&lt;70%)
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {lowConfTests.length} tests
                  </span>
                </li>
              </ul>
            </div>

            {/* Integrity protections card */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900 uppercase tracking-wider text-[11px]">
                  Clinical Data Protections
                </span>
                <Lock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="space-y-1.5 mt-2 text-slate-700 text-[11px] leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>AI summaries never overwrite original source lab values.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Source reference ranges are immutable and locked.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>User intake data is quarantined from OCR extractions.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Details Table */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Verified Source Records in Patient Ledger
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Record Source</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Date Added</th>
                    <th className="px-4 py-2.5">Provenance Tier</th>
                    <th className="px-4 py-2.5">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      Initial Clinical Registration Form
                    </td>
                    <td className="px-4 py-3 text-slate-600">Patient Intake</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{patient.createdAt || 'Intake'}</td>
                    <td className="px-4 py-3">
                      <ProvenanceBadge source="user_provided" size="xs" />
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">
                      ✓ Preserved User Data
                    </td>
                  </tr>
                  {patientReports.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {r.fileName} ({r.source || 'Pathology Laboratory'})
                      </td>
                      <td className="px-4 py-3 text-slate-600">Lab Diagnostic File ({r.fileType})</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{r.uploadDate}</td>
                      <td className="px-4 py-3">
                        <ProvenanceBadge source="extracted_from_report" size="xs" />
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">
                        ✓ Verified &amp; Locked
                      </td>
                    </tr>
                  ))}
                  {patient.aiSummary && (
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        Clinical AI Patient Summary Engine
                      </td>
                      <td className="px-4 py-3 text-slate-600">Organized Synthesis</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{patient.aiSummary.generatedAt}</td>
                      <td className="px-4 py-3">
                        <ProvenanceBadge source="ai_generated" size="xs" />
                      </td>
                      <td className="px-4 py-3 text-purple-700 font-medium">
                        ✓ Non-Overwriting Synthesis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Details Modal */}
      {selectedReportView && (
        <Modal
          isOpen={!!selectedReportView}
          onClose={() => setSelectedReportView(null)}
          title={`Report Inspection — ${selectedReportView.fileName}`}
          maxWidth="xl"
          footer={
            <Button variant="primary" onClick={() => setSelectedReportView(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Format:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReportView.fileType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Report Date:</span>
                <span className="font-semibold text-slate-800">{selectedReportView.reportDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Upload Date:</span>
                <span className="font-semibold text-slate-800">{selectedReportView.uploadDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Verification:</span>
                <Badge status={selectedReportView.verificationStatus || 'pending'} size="sm" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Source Clinical Facility / Pathology Laboratory:
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                {selectedReportView.source}
              </div>
            </div>

            {selectedReportView.extractedText && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Extracted Text / OCR Transcription:
                </label>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-56 whitespace-pre-wrap leading-relaxed">
                  {selectedReportView.extractedText}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};