import React, { useState } from 'react';
import { Patient, ComparisonItem, MedicalReport } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Calendar,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { MOCK_COMPARISONS } from '../data/mockData';

interface CompareReportsPageProps {
  patients: Patient[];
  reports: MedicalReport[];
  selectedPatientId?: string;
  onSelectPatient: (patientId: string) => void;
}

export const CompareReportsPage: React.FC<CompareReportsPageProps> = ({
  patients,
  reports,
  selectedPatientId,
  onSelectPatient
}) => {
  const currentPatientId = selectedPatientId || patients[0]?.id || "ML-1042";
  const patient = patients.find(p => p.id === currentPatientId) || patients[0];

  const [previousReport, setPreviousReport] = useState<string>("REP-BASELINE-2026-03");
  const [currentReport, setCurrentReport] = useState<string>("REP-FOLLOWUP-2026-08");

  // Fetch comparison data for this patient
  const comparisonItems: ComparisonItem[] = MOCK_COMPARISONS[currentPatientId] || [
    {
      testName: "Total Cholesterol",
      previousValue: "210",
      currentValue: "185",
      previousRange: "< 200 mg/dL",
      currentRange: "< 200 mg/dL",
      unit: "mg/dL",
      delta: "-25 mg/dL",
      trend: "decreased",
      previousDate: "2026-02-10",
      currentDate: "2026-08-15"
    },
    {
      testName: "Fasting Glucose",
      previousValue: "98",
      currentValue: "104",
      previousRange: "70 – 99 mg/dL",
      currentRange: "70 – 99 mg/dL",
      unit: "mg/dL",
      delta: "+6 mg/dL",
      trend: "increased",
      previousDate: "2026-02-10",
      currentDate: "2026-08-15"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Compare Longitudinal Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare structured quantitative results side-by-side across diagnostic reporting intervals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Selected Patient:</span>
          <select
            value={currentPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-2xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Selection Bar */}
      <Card noPadding className="p-4 bg-slate-50/80">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          {/* Previous Report Selector */}
          <div className="md:col-span-3 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Baseline / Previous Report
            </label>
            <select
              value={previousReport}
              onChange={(e) => setPreviousReport(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="REP-BASELINE-2026-03">March 15, 2026 — Comprehensive Lab Panel (St. Jude)</option>
              <option value="REP-BASELINE-2025-10">October 18, 2025 — Annual Health Check (BioReference)</option>
              <option value="REP-BASELINE-2025-06">June 02, 2025 — Prior Metabolic Screen (Quest)</option>
            </select>
          </div>

          {/* Divider icon */}
          <div className="md:col-span-1 flex justify-center text-slate-400">
            <div className="p-2 rounded-full bg-white border border-slate-200 shadow-2xs">
              <GitCompare className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* Current Report Selector */}
          <div className="md:col-span-3 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Follow-Up / Current Report
            </label>
            <select
              value={currentReport}
              onChange={(e) => setCurrentReport(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="REP-FOLLOWUP-2026-08">August 26, 2026 — CBC & Metabolic Re-check (St. Jude)</option>
              <option value="REP-FOLLOWUP-2026-09">September 01, 2026 — Post-Intervention Lipid Panel</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Safety Notice: Strictly No Medical Conclusions from Changes */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-sky-950 font-semibold block">
            Objective Variance Analysis Notice:
          </strong>
          <p className="text-sky-900/90 leading-relaxed">
            The changes tabulated below represent mathematical differences between laboratory values and respective report reference ranges. MedLens does not interpret trends as disease progression, therapeutic efficacy, or diagnostic conclusions. Clinical evaluation remains required.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-slate-900">
              Longitudinal Biomarker Comparison ({comparisonItems.length} metrics analyzed)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Comparing {patient.name} ({patient.id})
            </span>
          </div>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Test</th>
                <th className="px-5 py-3.5">Previous Value</th>
                <th className="px-5 py-3.5">Current Value</th>
                <th className="px-5 py-3.5">Previous Ref Range</th>
                <th className="px-5 py-3.5">Current Ref Range</th>
                <th className="px-5 py-3.5 text-right">Mathematical Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    <div>{item.testName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.unit}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-700">
                    <span className="font-semibold">{item.previousValue}</span> {item.unit}
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.previousDate}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-blue-900">
                    <span className="font-bold">{item.currentValue}</span> {item.unit}
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.currentDate}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 bg-slate-50/40">
                    {item.previousRange}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 bg-slate-50/40">
                    {item.currentRange}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-xs">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${
                      item.trend === 'decreased'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : item.trend === 'increased'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.trend === 'increased' && <TrendingUp className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />}
                      {item.trend === 'decreased' && <TrendingDown className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />}
                      {item.trend === 'unchanged' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{item.delta}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
