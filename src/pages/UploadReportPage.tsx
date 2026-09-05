import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
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
  Eye
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface UploadReportPageProps {
  onNavigate: (page: NavPage, patientId?: string) => void;
  onProceedToVerification?: () => void;
}

interface UploadedFilePreview {
  fileName: string;
  fileSize: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  uploadDate: string;
  status: 'Processing' | 'Extracted' | 'Ready for Review';
  patientId: string;
  patientName: string;
  progress: number;
  extractedCount: number;
  confidence: number;
}

export const UploadReportPage: React.FC<UploadReportPageProps> = ({
  onNavigate,
  onProceedToVerification
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFilePreview | null>({
    fileName: "CBC_Differential_Report_Aug26.pdf",
    fileSize: "1.4 MB",
    fileType: "PDF",
    uploadDate: "2026-08-26 13:42 EST",
    status: "Ready for Review",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    progress: 100,
    extractedCount: 16,
    confidence: 0.96
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatedUpload = (name: string, type: 'PDF' | 'JPG' | 'PNG', size: string, patientName: string) => {
    setIsProcessing(true);
    const newPreview: UploadedFilePreview = {
      fileName: name,
      fileSize: size,
      fileType: type,
      uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today",
      status: 'Processing',
      patientId: "ML-1042",
      patientName: patientName,
      progress: 20,
      extractedCount: 0,
      confidence: 0.95
    };
    setSelectedFile(newPreview);

    setTimeout(() => {
      setSelectedFile(prev => prev ? { ...prev, progress: 65, extractedCount: 10 } : null);
    }, 800);

    setTimeout(() => {
      setSelectedFile(prev => prev ? {
        ...prev,
        progress: 100,
        status: 'Ready for Review',
        extractedCount: 14,
        confidence: 0.96
      } : null);
      setIsProcessing(false);
    }, 1600);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const fileType = (extension === 'JPG' || extension === 'PNG' || extension === 'PDF') ? extension : 'PDF';
      handleSimulatedUpload(file.name, fileType, `${(file.size / (1024 * 1024)).toFixed(1)} MB`, "Eleanor Vance");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Upload Clinical Medical Report</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload a medical report to extract structured information. All extracted entities require clinical verification before record integration.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <Card noPadding className="border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors bg-slate-50/50">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
              const fileType = (ext === 'JPG' || ext === 'PNG' || ext === 'PDF') ? ext : 'PDF';
              handleSimulatedUpload(file.name, fileType, `${(file.size / (1024 * 1024)).toFixed(1)} MB`, "Eleanor Vance");
            }
          }}
          className={`p-8 sm:p-12 text-center transition-all ${dragActive ? 'bg-blue-50/80 border-blue-500' : ''}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Drag and drop clinical report file here
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Support formats: <strong className="text-slate-700">PDF</strong>, <strong className="text-slate-700">JPG</strong>, <strong className="text-slate-700">PNG</strong> (Up to 25MB per document).
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 cursor-pointer transition-all">
            <FileUp className="w-4 h-4" />
            <span>Browse Computer</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>

          {/* Quick Demo Pre-loaders */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400">Or load mock clinical sample:</span>
            <button
              onClick={() => handleSimulatedUpload("Hematology_CBC_Panel.pdf", "PDF", "1.4 MB", "Eleanor Vance")}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium"
            >
              📄 CBC Panel (PDF)
            </button>
            <button
              onClick={() => handleSimulatedUpload("CMP_Metabolic_Scan.png", "PNG", "2.1 MB", "Eleanor Vance")}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium"
            >
              🖼️ Metabolic Scan (PNG)
            </button>
            <button
              onClick={() => handleSimulatedUpload("Thyroid_Requisition.jpg", "JPG", "3.2 MB", "Sophia Rodriguez")}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-medium"
            >
              📸 Thyroid Requisition (JPG)
            </button>
          </div>
        </div>
      </Card>

      {/* Processing Preview Card */}
      {selectedFile && (
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Processing-Preview Card</span>
              </div>
              <Badge
                status={selectedFile.status === 'Ready for Review' ? 'verified' : 'pending'}
                label={selectedFile.status}
              />
            </div>
          }
          subtitle="Mock processing inspection: Extracted document telemetry and entity confidence"
        >
          <div className="space-y-4">
            {/* File Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">File Name:</span>
                <span className="font-semibold text-slate-800 truncate block" title={selectedFile.fileName}>
                  {selectedFile.fileName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">File Type:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedFile.fileType} ({selectedFile.fileSize})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Upload Date:</span>
                <span className="font-semibold text-slate-800">{selectedFile.uploadDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Associated Patient:</span>
                <span className="font-semibold text-blue-700">{selectedFile.patientName}</span>
              </div>
            </div>

            {/* Progress Bar & Stages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span>Extracting clinical entities & reference ranges...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Structured OCR extraction complete</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {selectedFile.progress}%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${selectedFile.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> OCR Text Ingestion
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Entity & Range Mapping
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Human Review Queue
                </span>
              </div>
            </div>

            {/* Extraction Telemetry Summary */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedFile.extractedCount} Clinical Biomarkers Extracted</span>
                </div>
                <p className="text-blue-900/80">
                  Mean extraction confidence: <strong>{Math.round(selectedFile.confidence * 100)}%</strong>. Source references mapped from original PDF layout.
                </p>
              </div>

              {/* Action: Proceed to Verification */}
              <Button
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onNavigate('records', selectedFile.patientId)}
                disabled={isProcessing}
                className="shrink-0"
              >
                Proceed to Verification
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Traceability & Safety Guardrail Note */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-800 block">MedLens Ingestion Protocol:</strong>
          <p>
            All uploaded clinical files remain immutable in your storage repository. Extracted laboratory entities are preserved alongside raw bounding-box provenance and must be confirmed by authorized medical staff before entering the verified patient timeline.
          </p>
        </div>
      </div>
    </div>
  );
};
