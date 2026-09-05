import { Patient, MedicalTest, MedicalReport } from '../types/clinical';

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[-/ ]/);
    if (parts.length >= 3) {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Generates an objective, patient-friendly clinical information summary based
 * strictly on structured verified records using deterministic clinical templates.
 * Used as the primary reliable fallback if LLM synthesis is offline or unavailable.
 */
export function generateTemplatePatientAISummary(
  patient: Patient,
  tests: MedicalTest[] = [],
  reports: MedicalReport[] = []
): string {
  const patientTests = tests.filter(t => t.patientId === patient.id);
  const patientReports = reports.filter(r => r.patientId === patient.id);

  if (patientTests.length === 0) {
    return `Baseline profile documented for ${patient.name} (${patient.id}). At present, no external laboratory tests have been verified into the clinical record. User-provided intake information is currently recorded. This summary organizes reported values and does not provide a diagnosis or medical recommendation.`;
  }

  const sentences: string[] = [];

  // 1. Identify latest report or test date
  const latestDateRaw =
    patientReports[0]?.reportDate ||
    patientReports[0]?.uploadDate ||
    patientTests[0]?.date;
  const formattedDate = formatDisplayDate(latestDateRaw);

  const reportCountStr =
    patientReports.length === 1
      ? 'The uploaded report'
      : patientReports.length > 1
      ? `The ${patientReports.length} uploaded medical reports`
      : 'The verified record';

  const dateSnippet = formattedDate ? ` from ${formattedDate}` : '';
  sentences.push(
    `${reportCountStr} contains ${patientTests.length} recorded laboratory ${patientTests.length === 1 ? 'test' : 'tests'}${dateSnippet}.`
  );

  // 2. Classify tests by their source-reported bounds
  const highTests = patientTests.filter(t => t.status === 'High');
  const lowTests = patientTests.filter(t => t.status === 'Low');
  const normalTests = patientTests.filter(t => t.status === 'Normal');
  const unavailableTests = patientTests.filter(
    t => t.status === 'Range unavailable' || t.status === 'Not determined'
  );

  // High tests
  for (const t of highTests) {
    if (t.referenceRange && !t.referenceRange.toLowerCase().includes('unavailable')) {
      sentences.push(
        `${t.testName} is recorded as ${t.value} ${t.unit}, which is above the source report's reference range of ${t.referenceRange}.`
      );
    } else {
      sentences.push(
        `${t.testName} is recorded as ${t.value} ${t.unit}. Reference range was not provided in the source report.`
      );
    }
  }

  // Low tests
  for (const t of lowTests) {
    if (t.referenceRange && !t.referenceRange.toLowerCase().includes('unavailable')) {
      sentences.push(
        `${t.testName} is recorded as ${t.value} ${t.unit}, which is below the source report's reference range of ${t.referenceRange}.`
      );
    } else {
      sentences.push(
        `${t.testName} is recorded as ${t.value} ${t.unit}. Reference range was not provided in the source report.`
      );
    }
  }

  // Normal tests
  if (normalTests.length > 0) {
    const normalNames = normalTests.map(t => t.testName);
    if (normalNames.length === 1) {
      sentences.push(`${normalNames[0]} was recorded within its reference range.`);
    } else if (normalNames.length <= 4) {
      const last = normalNames[normalNames.length - 1];
      const others = normalNames.slice(0, -1).join(', ');
      sentences.push(`${others}, and ${last} were recorded within their respective reference ranges.`);
    } else {
      const firstThree = normalNames.slice(0, 3).join(', ');
      const remainingCount = normalNames.length - 3;
      sentences.push(
        `${firstThree}, and ${remainingCount} other tests were recorded within their respective reference ranges.`
      );
    }
  }

  // Tests with missing reference ranges in source document
  if (unavailableTests.length > 0) {
    if (unavailableTests.length === 1) {
      sentences.push(
        `Reference range was not provided in the source report for ${unavailableTests[0].testName}.`
      );
    } else {
      const unavNames = unavailableTests.map(t => t.testName).join(', ');
      sentences.push(
        `Reference ranges were not provided in the source report for ${unavailableTests.length} tests (${unavNames}).`
      );
    }
  }

  // Recorded observations
  const observations = patientTests
    .filter(t => t.observation && t.observation.trim().length > 0 && !t.observation.toLowerCase().includes('unavailable'))
    .map(t => `${t.testName}: ${t.observation}`);
  if (observations.length > 0 && observations.length <= 2) {
    sentences.push(`Recorded observations note: ${observations.join('; ')}.`);
  }

  // Mandatory non-diagnostic closing statement
  sentences.push(
    'This summary organizes reported values and does not provide a diagnosis or medical recommendation.'
  );

  return sentences.join(' ');
}

/**
 * Reactive Loading State for Clinical AI Summarization
 */
export let isAISummaryLoading = false;
const loadingSubscribers = new Set<(loading: boolean) => void>();

export function isSummaryGenerating(): boolean {
  return isAISummaryLoading;
}

export function subscribeToSummaryLoading(cb: (loading: boolean) => void): () => void {
  loadingSubscribers.add(cb);
  return () => loadingSubscribers.delete(cb);
}

function setSummaryLoadingState(loading: boolean) {
  isAISummaryLoading = loading;
  loadingSubscribers.forEach(cb => {
    try { cb(loading); } catch { /* ignore subscriber error */ }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('medlens:summary-loading', { detail: { loading } }));
  }
}

const MANDATORY_CLOSING_SENTENCE =
  'This summary organizes reported values and does not provide a diagnosis or medical recommendation.';

/**
 * Generates an objective, patient-friendly clinical information summary based
 * strictly on structured verified records.
 *
 * Calls Claude LLM via the backend API endpoint (/api/summarize) passing the
 * patient's verified tests and reports as JSON.
 *
 * Preserves the exact function signature and return type (string) so App.tsx's
 * handleRegenerateAISummary doesn't need changes.
 *
 * Implements a loading state and an error fallback that returns the template-based
 * summary if the API call fails or times out.
 */
export function generatePatientAISummary(
  patient: Patient,
  tests: MedicalTest[] = [],
  reports: MedicalReport[] = []
): string {
  const patientTests = tests.filter(t => t.patientId === patient.id);
  const patientReports = reports.filter(r => r.patientId === patient.id);

  if (patientTests.length === 0) {
    return generateTemplatePatientAISummary(patient, tests, reports);
  }

  // Attempt live LLM synthesis via backend endpoint
  if (typeof XMLHttpRequest !== 'undefined') {
    try {
      setSummaryLoadingState(true);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/summarize', false); // Synchronous to maintain identical return type
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 10000;

      const payload = {
        name: patient.name,
        id: patient.id,
        patient: { name: patient.name, id: patient.id },
        tests: patientTests,
        reports: patientReports,
        patientTestsJson: JSON.stringify(
          patientTests.map(t => ({
            testName: t.testName,
            value: t.value,
            unit: t.unit,
            referenceRange: t.referenceRange || 'Reference range unavailable',
            status: t.status,
            date: t.date,
            observation: t.observation || undefined
          }))
        ),
        patientReportsJson: JSON.stringify(
          patientReports.map(r => ({
            fileName: r.fileName || r.reportName || 'Medical Report',
            reportType: r.reportType || 'Clinical Laboratory',
            reportDate: r.reportDate || r.date || r.uploadDate,
            sourceFacility: r.sourceFacility || 'Pathology Laboratory'
          }))
        )
      };

      xhr.send(JSON.stringify(payload));

      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data && typeof data.summary === 'string' && data.summary.trim().length > 0) {
          let summary = data.summary.trim();
          if (!summary.includes(MANDATORY_CLOSING_SENTENCE)) {
            summary = `${summary} ${MANDATORY_CLOSING_SENTENCE}`;
          }
          return summary;
        }
      } else {
        console.warn(`[MedLens AI Summary] Backend returned status ${xhr.status}. Falling back to template summary.`);
      }
    } catch (apiError) {
      console.warn('[MedLens AI Summary] Live LLM call failed, falling back to clinical template:', apiError);
    } finally {
      setSummaryLoadingState(false);
    }
  }

  // Fallback: Return template-based summary
  return generateTemplatePatientAISummary(patient, tests, reports);
}

/**
 * Asynchronous variant for callers that prefer a Promise-based workflow.
 * Gracefully falls back to template summary on any network or LLM error.
 */
export async function generatePatientAISummaryAsync(
  patient: Patient,
  tests: MedicalTest[] = [],
  reports: MedicalReport[] = []
): Promise<string> {
  const patientTests = tests.filter(t => t.patientId === patient.id);
  const patientReports = reports.filter(r => r.patientId === patient.id);

  if (patientTests.length === 0) {
    return generateTemplatePatientAISummary(patient, tests, reports);
  }

  setSummaryLoadingState(true);
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: patient.name,
        id: patient.id,
        patient: { name: patient.name, id: patient.id },
        tests: patientTests,
        reports: patientReports,
        patientTestsJson: JSON.stringify(
          patientTests.map(t => ({
            testName: t.testName,
            value: t.value,
            unit: t.unit,
            referenceRange: t.referenceRange || 'Reference range unavailable',
            status: t.status,
            date: t.date,
            observation: t.observation || undefined
          }))
        ),
        patientReportsJson: JSON.stringify(
          patientReports.map(r => ({
            fileName: r.fileName || r.reportName || 'Medical Report',
            reportType: r.reportType || 'Clinical Laboratory',
            reportDate: r.reportDate || r.date || r.uploadDate,
            sourceFacility: r.sourceFacility || 'Pathology Laboratory'
          }))
        )
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.summary) {
        let summary = data.summary.trim();
        if (!summary.includes(MANDATORY_CLOSING_SENTENCE)) {
          summary = `${summary} ${MANDATORY_CLOSING_SENTENCE}`;
        }
        return summary;
      }
    }
  } catch (err) {
    console.warn('[MedLens AI Summary Async] LLM call failed, falling back to clinical template:', err);
  } finally {
    setSummaryLoadingState(false);
  }

  return generateTemplatePatientAISummary(patient, tests, reports);
}
