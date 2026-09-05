import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function detectConflicts(patient, report, tests = []) {
  const conflicts = [];
  const text = (report.extractedText || '').toLowerCase();
  const detectedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  // 1. Allergy Conflict Check
  if (patient.allergies && patient.allergies.length > 0) {
    if (text.includes('no known drug allergies') || text.includes('nkda') || text.includes('no known allergies')) {
      conflicts.push({
        id: `CONF-TEST-1`,
        patientId: patient.id,
        patientName: patient.name,
        category: 'Allergy',
        title: 'Allergy documentation variance',
        description: `Potential inconsistency detected between clinical record and ${report.fileName || 'uploaded report'}.`,
        source1: {
          name: `Documented Chart (${patient.name})`,
          date: patient.updatedAt || 'Baseline',
          claim: `Documented allergies: ${patient.allergies.join(', ')}`,
          type: 'Clinical Progress Record'
        },
        source2: {
          name: report.fileName || 'Uploaded Medical Report',
          date: report.reportDate || 'Recent',
          claim: "Marked 'No Known Drug Allergies (NKDA)' on document requisition",
          type: 'Intake Requisition'
        },
        detectedDate: detectedAt,
        status: 'active'
      });
    }
  }

  // 2. Medication Discrepancy Check
  if (patient.medications && patient.medications.length > 0) {
    for (const med of patient.medications) {
      const firstWord = med.split(' ')[0].toLowerCase();
      if (firstWord.length > 3 && text.includes(firstWord)) {
        const chartDose = med.match(/(\d+)\s*(?:mg|mcg|g)/i);
        const reportDose = text.match(new RegExp(`${firstWord}\\s+(\\d+)\\s*(?:mg|mcg|g)`, 'i'));

        if (chartDose && reportDose && chartDose[1] !== reportDose[1]) {
          conflicts.push({
            id: `CONF-TEST-2`,
            patientId: patient.id,
            patientName: patient.name,
            category: 'Medication',
            title: `${med.split(' ')[0]} dosage discrepancy`,
            description: `Potential inconsistency detected between medication list and ${report.fileName || 'uploaded report'}.`,
            source1: {
              name: `Documented Chart (${patient.name})`,
              date: patient.updatedAt || 'Baseline',
              claim: `Documented: ${med}`,
              type: 'Documented Medication Profile'
            },
            source2: {
              name: report.fileName || 'Uploaded Report',
              date: report.reportDate || 'Recent',
              claim: `Recorded as ${med.split(' ')[0]} ${reportDose[1]}mg on report`,
              type: 'Report Manifest'
            },
            detectedDate: detectedAt,
            status: 'active'
          });
        }
      }
    }
  }

  return conflicts;
}

describe('Clinical Inconsistency Detection', () => {
  const patient = {
    id: 'ML-1042',
    name: 'Eleanor Vance',
    allergies: ['Penicillin (Urticarial rash)', 'Sulfa Antibiotics'],
    medications: ['Propranolol 20mg (Twice daily)', 'Metformin 500mg']
  };

  it('flags an Allergy conflict when report states NKDA for a patient with documented allergies', () => {
    const report = {
      fileName: 'Requisition_Form.pdf',
      reportDate: '2026-09-04',
      extractedText: 'Patient Requisition Manifest: No Known Drug Allergies (NKDA) confirmed by intake nurse.'
    };

    const conflicts = detectConflicts(patient, report);
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].category, 'Allergy');
    assert.strictEqual(conflicts[0].patientId, 'ML-1042');
    assert.ok(conflicts[0].source1.claim.includes('Penicillin'));
    assert.ok(conflicts[0].source2.claim.includes('No Known Drug Allergies'));
  });

  it('flags a Medication conflict when report states conflicting dosage', () => {
    const report = {
      fileName: 'Specialty_Consult.pdf',
      reportDate: '2026-09-04',
      extractedText: 'Current patient reported regimen: Propranolol 10mg once daily in the evening.'
    };

    const conflicts = detectConflicts(patient, report);
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].category, 'Medication');
    assert.ok(conflicts[0].title.includes('Propranolol'));
    assert.ok(conflicts[0].source1.claim.includes('20mg'));
    assert.ok(conflicts[0].source2.claim.includes('10mg'));
  });

  it('returns an empty array when clinical records are completely concordant', () => {
    const report = {
      fileName: 'Routine_Biochemistry.pdf',
      reportDate: '2026-09-04',
      extractedText: 'Allergies: Penicillin documented. Routine biochemical review unremarkable.'
    };

    const conflicts = detectConflicts(patient, report);
    assert.strictEqual(conflicts.length, 0, 'No conflicts should be flagged for concordant records');
  });

  it('produces valid ClinicalConflict schema objects', () => {
    const report = {
      fileName: 'Requisition.pdf',
      reportDate: '2026-09-04',
      extractedText: 'Marked NKDA on manifest.'
    };

    const [conflict] = detectConflicts(patient, report);
    assert.ok(conflict.id);
    assert.ok(conflict.patientId);
    assert.ok(conflict.patientName);
    assert.ok(['Allergy', 'Medication', 'History', 'Demographic'].includes(conflict.category));
    assert.ok(conflict.title);
    assert.ok(conflict.description);
    assert.ok(conflict.source1?.name && conflict.source1?.claim);
    assert.ok(conflict.source2?.name && conflict.source2?.claim);
    assert.strictEqual(conflict.status, 'active');
  });
});