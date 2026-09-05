import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { Patient, MedicalTest } from '../types/clinical';
import {
  ExtractedReportBundle,
  SAMPLE_EXTRACTED_TEMPLATES,
  extractFromUploadedDocument
} from '../utils/extractor';
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileUp,
  RefreshCw,
  Eye,
  FileCode,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface UploadReportPageProps {
  patients: Patient[];
  selectedPatientId?: string;
  onNavigate: (page: NavPage, patientId?: string) => void;
  onReadyForVerification: (bundle: ExtractedReportBundle, assignedPatientId: string) => void;
}

type PipelineStage =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'ocr_extracting'
  | 'info_structuring'
  | 'ready_for_review';

export const UploadReportPage: React.FC<UploadReportPageProps> = ({
  patients,
  selectedPatientId,
  onNavigate,
  onReadyForVerification
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [assignedPatientId, setAssignedPatientId] = useState<string>(
    selectedPatientId || patients[0]?.id || 'ML-1042'
  );

  const [currentStage, setCurrentStage] = useState<PipelineStage>('ready_for_review');
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // Active extracted bundle preview (initialized with realistic CBC sample)
  const [extractedBundle, setExtractedBundle] = useState<ExtractedReportBundle>(
    SAMPLE_EXTRACTED_TEMPLATES.cbc
  );

  const stagesList = [
    { id: 'uploading', label: '1. Upload' },
    { id: 'validating', label: '2. Document Validation' },
    { id: 'ocr_extracting', label: '3. OCR / Text Extraction' },
    { id: 'info_structuring', label: '4. Information Extraction' },
    { id: 'ready_for_review', label: '5. Structured Data' },
    { id: 'verification', label: '6. Human Verification' },
  ];

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // 1. File Type Validation (.pdf, .jpg, .jpeg, .png)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = extension === 'pdf' || extension === 'jpg' || extension === 'jpeg' || extension === 'png';

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setErrorMessage(`Unsupported file format: ".${extension}". MedLens supports PDF, JPG, JPEG, and PNG medical records.`);
      return;
    }

    // 2. File Size Validation (25 MB max)
    const maxSizeInBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit for clinical document ingestion.`);
      return;
    }

    // 3. Run Visual 6-Stage Processing Pipeline
    setCurrentStage('uploading');
    setProgressPercent(15);

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // Try reading text if text or markdown
    const reader = new FileReader();
    reader.onload = (e) => {
      const textContent = typeof e.target?.result === 'string' ? e.target.result : undefined;

      setTimeout(() => {
        setCurrentStage('validating');
        setProgressPercent(35);
      }, 500);

      setTimeout(() => {
        setCurrentStage('ocr_extracting');
        setProgressPercent(60);
      }, 1100);

      setTimeout(() => {
        setCurrentStage('info_structuring');
        setProgressPercent(85);
      }, 1700);

      setTimeout(() => {
        const bundle = extractFromUploadedDocument(file.name, extension?.toUpperCase() || 'PDF', sizeStr, textContent);
        setExtractedBundle(bundle);
        setCurrentStage('ready_for_review');
        setProgressPercent(100);
      }, 2300);
    };

    reader.readAsText(file.slice(0, 50000));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (key: 'cbc' | 'metabolic' | 'thyroid') => {
    setErrorMessage(null);
    setCurrentStage('uploading');
    setProgressPercent(20);

    setTimeout(() => {
      setCurrentStage('ocr_extracting');
      setProgressPercent(65);
    }, 600);

    setTimeout(() => {
      setExtractedBundle(SAMPLE_EXTRACTED_TEMPLATES[key]);
      setCurrentStage('ready_for_review');
      setProgressPercent(100);
    }, 1300);
  };

  const isProcessing = currentStage !== 'idle' && currentStage !== 'ready_for_review';
  const assignedPatient = patients.find(p => p.id === assignedPatientId) || patients[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Upload Medical Report</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingest clinical documents to extract structured quantitative biomarkers and source reference bounds.
          </p>
        </div>

        {/* Patient Association Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 pl-1">Assign to Patient:</span>
          <select
            value={assignedPatientId}
            onChange={(e) => setAssignedPatientId(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-semibold">Document Ingestion Notice:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      <Card noPadding className="border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors bg-slate-50/50">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`p-8 sm:p-12 text-center transition-all ${dragActive ? 'bg-blue-50/80 border-blue-500 scale-[0.99]' : ''}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Drag and drop clinical report file here
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Supported formats: <strong className="text-slate-700">PDF</strong>, <strong className="text-slate-700">JPG</strong>, <strong className="text-slate-700">JPEG</strong>, <strong className="text-slate-700">PNG</strong> (Max 25 MB).
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 cursor-pointer transition-all">
            <FileUp className="w-4 h-4" />
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>

          {/* Quick Demo Pre-Loaders */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Test with sample diagnostic report:</span>
            <button
              onClick={() => handleLoadSample('cbc')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium shadow-2xs transition-colors"
            >
              📄 Sample CBC Report (PDF)
            </button>
            <button
              onClick={() => handleLoadSample('metabolic')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium shadow-2xs transition-colors"
            >
              🖼️ Sample Metabolic Panel (PNG)
            </button>
            <button
              onClick={() => handleLoadSample('thyroid')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium shadow-2xs transition-colors"
            >
              📸 Sample Thyroid Panel (JPG)
            </button>
          </div>
        </div>
      </Card>

      {/* Visual 6-Stage Processing Pipeline */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Medical Ingestion & OCR Pipeline</span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-500">
              {progressPercent}% completed
            </span>
          </div>
        }
        subtitle="Visual pipeline: Upload → Validation → OCR Extraction → Entity Mapping → Structured Data → Verification"
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Pipeline Stage Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
            {stagesList.map((stage, idx) => {
              const isDone = progressPercent >= ((idx + 1) / 6) * 100;
              const isCurrent = isProcessing && !isDone;
              return (
                <div
                  key={stage.id}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isCurrent
                      ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{stage.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Extracted Information Preview Card */}
      {extractedBundle && (
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>Extracted Structured Information</span>
              </div>
              <Badge status="verified" label="Extraction Ready" />
            </div>
          }
          subtitle={`Telemetry: ${extractedBundle.tests.length} tests identified from source • ${extractedBundle.fileName}`}
        >
          <div className="space-y-4">
            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Document Name:</span>
                <span className="font-semibold text-slate-900 truncate block" title={extractedBundle.fileName}>
                  {extractedBundle.fileName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Format / Size:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {extractedBundle.fileType} • {extractedBundle.fileSize}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Report Date:</span>
                <span className="font-semibold text-slate-800">{extractedBundle.reportDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Patient:</span>
                <span className="font-semibold text-blue-700">{assignedPatient?.name} ({assignedPatient?.id})</span>
              </div>
            </div>

            {/* Extracted Tests Table Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Test Name</th>
                      <th className="px-4 py-2.5">Extracted Value</th>
                      <th className="px-4 py-2.5">Unit</th>
                      <th className="px-4 py-2.5">Reference Range (source report)</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedBundle.tests.map((test, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {test.testName}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-blue-900">
                          {test.value}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">
                          {test.unit}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-600 bg-slate-50/50">
                          {test.referenceRange}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            status={
                              test.status === 'Normal'
                                ? 'normal'
                                : test.status === 'High'
                                ? 'high'
                                : test.status === 'Low'
                                ? 'low'
                                : 'unavailable'
                            }
                            label={test.status}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <ProvenanceBadge source="extracted_from_report" size="xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Raw Extracted Text Collapsible Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  <span>Inspect Raw OCR Extraction Stream</span>
                </div>
                {showRawText ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showRawText && (
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {extractedBundle.rawExtractedText}
                </div>
              )}
            </div>

            {/* Proceed Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  Mean confidence: <strong>{Math.round(extractedBundle.meanConfidence * 100)}%</strong>. All fields require clinical verification prior to saving.
                </span>
              </div>

              <Button
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onReadyForVerification(extractedBundle, assignedPatientId)}
                className="shadow-sm"
              >
                Proceed to Human Verification ({extractedBundle.tests.length} items)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Clinical Safety Protocol Footer */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-800 block">MedLens Ingestion Protocol:</strong>
          <p>
            Status values are calculated strictly according to numerical limits provided in the source report. If reference bounds are missing, status defaults to <em>"Reference range unavailable — status not determined."</em>
          </p>
        </div>
      </div>
    </div>
  );
};