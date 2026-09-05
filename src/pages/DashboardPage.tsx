import React from 'react';
import { StatCard } from '../components/cards/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Patient, MedicalReport } from '../types/clinical';
import { NavPage } from '../components/layout/Sidebar';
import {
  Users,
  FileCheck,
  Clock,
  AlertTriangle,
  UserPlus,
  UploadCloud,
  ArrowRight,
  FileText,
  ChevronRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface DashboardPageProps {
  patients: Patient[];
  reports: MedicalReport[];
  onNavigate: (page: NavPage, patientId?: string) => void;
  onOpenAddPatient: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  patients,
  reports,
  onNavigate,
  onOpenAddPatient
}) => {
  // Dynamically computed metrics based on actual stored cohort
  const totalPatients = patients.length;
  const processedReportsCount = reports.length;
  const pendingVerificationCount = patients.filter(
    p => p.verificationStatus === 'pending' || p.verificationStatus === 'in_review'
  ).length;
  const detectedConflictsCount = patients.reduce(
    (acc, p) => acc + (p.conflictCount || 0), 0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-linear-to-r from-blue-900 via-clinical-800 to-teal-800 rounded-2xl p-6 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>MedLens Clinical Intelligence System</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Good morning, Dr. Lin</h2>
          <p className="text-blue-100 text-sm max-w-2xl font-light">
            Clinical Information Dashboard — Structured intake dossiers, traceable multi-source diagnostics, and human-verified consistency checks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            icon={<UserPlus className="w-4 h-4 text-slate-800" />}
            onClick={onOpenAddPatient}
            className="shadow-sm hover:bg-white"
          >
            + Add Patient
          </Button>
          <Button
            variant="teal"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => onNavigate('upload')}
            className="shadow-sm"
          >
            Upload Medical Report
          </Button>
        </div>
      </div>

      {/* Safety Guardrail Banner */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 flex items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Clinical Safety Protocol:</strong> MedLens organizes diagnostic documents with full source provenance. It does not diagnose conditions, prescribe medicines, or provide treatment advice.
          </span>
        </div>
        <span className="hidden lg:inline-block font-mono text-[11px] text-blue-700/80 uppercase">
          Rule-Enforced
        </span>
      </div>

      {/* Top Statistics Cards - Dynamically Connected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="active cohort"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          trend={{ label: `${totalPatients} stored in ledger`, positive: true }}
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Reports Processed"
          value={processedReportsCount}
          subtitle="source documents"
          icon={<FileCheck className="w-5 h-5" />}
          color="teal"
          trend={{ label: "Source-indexed", positive: true }}
          onClick={() => onNavigate('upload')}
        />
        <StatCard
          title="Pending Verification"
          value={pendingVerificationCount}
          subtitle="requires human sign-off"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          trend={{ label: "Human-in-the-loop", positive: false }}
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Detected Conflicts"
          value={detectedConflictsCount}
          subtitle="potential inconsistencies"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
          trend={{ label: "Cross-record variance", positive: false }}
          onClick={() => onNavigate('conflicts')}
        />
      </div>

      {/* Two Column Layout: Recent Patients & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients Table (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Patients"
            subtitle="Latest patient cohorts requiring clinical attention or record verification"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('patients')}
              >
                View all ({patients.length})
              </Button>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Patient ID</th>
                    <th className="px-5 py-3">Patient Name</th>
                    <th className="px-5 py-3">Age / Sex</th>
                    <th className="px-5 py-3">Last Report</th>
                    <th className="px-5 py-3">Verification Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                        No patients added yet. Click "+ Add Patient" above to create your first record.
                      </td>
                    </tr>
                  ) : (
                    patients.slice(0, 5).map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-900">
                          {patient.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{patient.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{patient.mrn || 'Intake Dossier'}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs">
                          {patient.age} yrs • {patient.sex}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs">
                          {patient.lastReportDate || 'No reports yet'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge status={patient.verificationStatus || 'pending'} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('records', patient.id)}
                            className="hover:border-blue-400 hover:text-blue-700"
                          >
                            View Record
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Reports Section (1 col) */}
        <div className="space-y-4">
          <Card
            title="Recent Reports"
            subtitle="Diagnostic files ingested into MedLens"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('upload')}
              >
                Upload new
              </Button>
            }
            noPadding
          >
            <div className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No medical reports processed yet.
                </div>
              ) : (
                reports.slice(0, 4).map((report) => (
                  <div key={report.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate" title={report.reportName}>
                            {report.reportName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {report.patientName} • {report.date}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {report.fileType}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {report.extractedEntitiesCount} entities
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('records', report.patientId)}
                        className="shrink-0 p-1.5"
                        title="View record"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};