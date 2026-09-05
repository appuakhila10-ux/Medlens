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
 * strictly on structured verified records.
 *
 * Safety Constraints:
 * - NO disease diagnosis or predictions.
 * - NO treatment or medication dosage recommendations.
 * - Reference ranges sourced strictly from original reports; missing reference ranges are explicitly noted.
 */
export function generatePatientAISummary(
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
