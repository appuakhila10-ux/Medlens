import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper function implementing clinical safety summary validation matching MedLens clinical specs
function generateClinicalSummary(patient, tests = [], reports = []) {
  const patientTests = tests.filter(t => t.patientId === patient.id);
  const patientReports = reports.filter(r => r.patientId === patient.id);

  if (patientTests.length === 0) {
    return `Baseline profile documented for ${patient.name} (${patient.id}). At present, no external laboratory tests have been verified into the clinical record. User-provided intake information is currently recorded. This summary organizes reported values and does not provide a diagnosis or medical recommendation.`;
  }

  const sentences = [];
  const latestDate = patientReports[0]?.reportDate || patientTests[0]?.date || 'Recent';
  const reportCountStr = patientReports.length <= 1 ? 'The uploaded report' : `The ${patientReports.length} uploaded medical reports`;
  sentences.push(`${reportCountStr} contains ${patientTests.length} recorded laboratory ${patientTests.length === 1 ? 'test' : 'tests'} from ${latestDate}.`);

  const highTests = patientTests.filter(t => t.status === 'High');
  const lowTests = patientTests.filter(t => t.status === 'Low');
  const normalTests = patientTests.filter(t => t.status === 'Normal');
  const unavailableTests = patientTests.filter(t => t.status === 'Range unavailable' || t.status === 'Not determined');

  for (const t of highTests) {
    if (t.referenceRange && !t.referenceRange.toLowerCase().includes('unavailable')) {
      sentences.push(`${t.testName} is recorded as ${t.value} ${t.unit}, which is above the source report's reference range of ${t.referenceRange}.`);
    } else {
      sentences.push(`${t.testName} is recorded as ${t.value} ${t.unit}. Reference range was not provided in the source report.`);
    }
  }

  for (const t of lowTests) {
    if (t.referenceRange && !t.referenceRange.toLowerCase().includes('unavailable')) {
      sentences.push(`${t.testName} is recorded as ${t.value} ${t.unit}, which is below the source report's reference range of ${t.referenceRange}.`);
    } else {
      sentences.push(`${t.testName} is recorded as ${t.value} ${t.unit}. Reference range was not provided in the source report.`);
    }
  }

  if (normalTests.length > 0) {
    const names = normalTests.map(t => t.testName).join(', ');
    sentences.push(`${names} were recorded within their respective reference ranges.`);
  }

  if (unavailableTests.length > 0) {
    for (const t of unavailableTests) {
      sentences.push(`Reference range was not provided in the source report for ${t.testName}.`);
    }
  }

  sentences.push('This summary organizes reported values and does not provide a diagnosis or medical recommendation.');
  return sentences.join(' ');
}

describe('Clinical Safety & AI Summary Constraints', () => {
  const mockPatient = {
    id: 'ML-1042',
    name: 'Eleanor Vance',
    age: 58,
    sex: 'Female',
    allergies: ['Penicillin'],
    medications: ['Metformin 500mg']
  };

  const mockTests = [
    {
      id: 'TEST-1',
      patientId: 'ML-1042',
      testName: 'Hemoglobin',
      value: '10.2',
      numericValue: 10.2,
      unit: 'g/dL',
      referenceRange: '12.0 – 16.0 g/dL',
      status: 'Low',
      date: '2026-09-04'
    },
    {
      id: 'TEST-2',
      patientId: 'ML-1042',
      testName: 'Fasting Blood Glucose',
      value: '138',
      numericValue: 138,
      unit: 'mg/dL',
      referenceRange: '70 – 99 mg/dL',
      status: 'High',
      date: '2026-09-04'
    },
    {
      id: 'TEST-3',
      patientId: 'ML-1042',
      testName: 'Platelet Count',
      value: '264',
      numericValue: 264,
      unit: 'x10^3/uL',
      referenceRange: '150 – 450 x10^3/uL',
      status: 'Normal',
      date: '2026-09-04'
    },
    {
      id: 'TEST-4',
      patientId: 'ML-1042',
      testName: 'RBC Morphology Index',
      value: 'Marked Microcytosis',
      unit: 'Qualitative',
      referenceRange: 'Reference range unavailable',
      status: 'Range unavailable',
      date: '2026-09-04'
    }
  ];

  const mockReports = [
    {
      id: 'REP-101',
      patientId: 'ML-1042',
      fileName: 'CBC_Panel.pdf',
      reportType: 'Complete Blood Count',
      reportDate: '2026-09-04'
    }
  ];

  it('MUST end with the mandatory non-diagnostic disclaimer', () => {
    const summary = generateClinicalSummary(mockPatient, mockTests, mockReports);
    const mandatorySentence = 'This summary organizes reported values and does not provide a diagnosis or medical recommendation.';
    assert.ok(summary.endsWith(mandatorySentence), 'Summary must terminate with the mandatory clinical disclaimer');
  });

  it('MUST NOT diagnose any diseases or conditions', () => {
    const summary = generateClinicalSummary(mockPatient, mockTests, mockReports).toLowerCase();
    const forbiddenTerms = [
      'diagnosed with',
      'suffers from',
      'has disease',
      'prognosis',
      'patient has diabetes',
      'patient has anemia'
    ];

    for (const term of forbiddenTerms) {
      assert.strictEqual(
        summary.includes(term),
        false,
        `Summary must not contain diagnostic term: "${term}"`
      );
    }
  });

  it('MUST NOT recommend treatment, medication or dosage changes', () => {
    const summary = generateClinicalSummary(mockPatient, mockTests, mockReports).toLowerCase();
    const forbiddenPhrases = [
      'increase dosage',
      'decrease dosage',
      'prescribe',
      'start taking',
      'stop taking',
      'should take insulin',
      'recommend treatment'
    ];

    for (const phrase of forbiddenPhrases) {
      assert.strictEqual(
        summary.includes(phrase),
        false,
        `Summary must not recommend therapy changes: "${phrase}"`
      );
    }
  });

  it('MUST explicitly note when reference ranges are unavailable in source report', () => {
    const summary = generateClinicalSummary(mockPatient, mockTests, mockReports);
    assert.ok(
      summary.includes('Reference range was not provided in the source report for RBC Morphology Index'),
      'Must explicitly state when reference range was omitted in the source document'
    );
  });

  it('MUST accurately state whether values are above, below, or within source ranges', () => {
    const summary = generateClinicalSummary(mockPatient, mockTests, mockReports);
    assert.ok(summary.includes('above the source report\'s reference range of 70 – 99 mg/dL'));
    assert.ok(summary.includes('below the source report\'s reference range of 12.0 – 16.0 g/dL'));
    assert.ok(summary.includes('Platelet Count were recorded within their respective reference ranges'));
  });

  it('MUST handle patient with zero laboratory tests without hallucinating', () => {
    const emptyPatient = { id: 'ML-9999', name: 'New Intake', age: 30, sex: 'Male' };
    const summary = generateClinicalSummary(emptyPatient, [], []);
    assert.ok(summary.includes('no external laboratory tests have been verified into the clinical record'));
    assert.ok(summary.endsWith('This summary organizes reported values and does not provide a diagnosis or medical recommendation.'));
  });
});