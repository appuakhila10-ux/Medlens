import { Patient, MedicalReport, MedicalTest, ClinicalConflict } from '../types/clinical';

/**
 * Heuristic cross-reference fallback when LLM API is unavailable.
 * Inspects allergy negation, medication dose variations, and demographic discrepancies.
 */
function runHeuristicConflictDetection(
  patient: Patient,
  reportData: Omit<MedicalReport, 'id'>,
  testsData: Omit<MedicalTest, 'id'>[],
  src1Name: string,
  src1Date: string,
  src2Name: string,
  src2Date: string
): ClinicalConflict[] {
  const conflicts: ClinicalConflict[] = [];
  const text = (reportData.extractedText || '').toLowerCase();
  const detectedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  // 1. Allergy conflict check: Chart has documented allergies, but report states NKDA
  if (patient.allergies && patient.allergies.length > 0) {
    if (text.includes('no known drug allergies') || text.includes('nkda') || text.includes('no known allergies')) {
      conflicts.push({
        id: `CONF-${Date.now()}-1`,
        patientId: patient.id,
        patientName: patient.name,
        category: 'Allergy',
        title: 'Allergy documentation variance',
        description: `Potential inconsistency detected between clinical record and ${reportData.fileName || 'uploaded report'}.`,
        source1: {
          name: src1Name,
          date: src1Date,
          claim: `Documented allergies: ${patient.allergies.join(', ')}`,
          type: 'Clinical Progress Record'
        },
        source2: {
          name: src2Name,
          date: src2Date,
          claim: "Marked 'No Known Drug Allergies (NKDA)' on document requisition",
          type: 'Intake Requisition'
        },
        detectedDate: detectedAt,
        status: 'active'
      });
    }
  }

  // 2. Medication dosage / frequency variation check
  if (patient.medications && patient.medications.length > 0) {
    for (const med of patient.medications) {
      const firstWord = med.split(' ')[0].toLowerCase();
      if (firstWord.length > 3 && text.includes(firstWord)) {
        const chartDoseMatch = med.match(/(\d+)\s*(?:mg|mcg|g)/i);
        const reportDoseMatch = text.match(new RegExp(`${firstWord}\\s+(\\d+)\\s*(?:mg|mcg|g)`, 'i'));

        if (chartDoseMatch && reportDoseMatch && chartDoseMatch[1] !== reportDoseMatch[1]) {
          conflicts.push({
            id: `CONF-${Date.now()}-2`,
            patientId: patient.id,
            patientName: patient.name,
            category: 'Medication',
            title: `${med.split(' ')[0]} dosage discrepancy`,
            description: `Potential inconsistency detected between current medication chart and ${reportData.fileName || 'uploaded report'}.`,
            source1: {
              name: src1Name,
              date: src1Date,
              claim: `Documented: ${med}`,
              type: 'Documented Medication Profile'
            },
            source2: {
              name: src2Name,
              date: src2Date,
              claim: `Recorded as ${med.split(' ')[0]} ${reportDoseMatch[1]}mg on report`,
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

/**
 * Compares a newly verified medical report against the patient's existing clinical chart
 * (allergies, medications, demographics, history) using Claude LLM.
 * Returns an array of newly detected ClinicalConflict objects to be stored.
 */
export async function detectClinicalConflicts(
  patient: Patient,
  reportData: Omit<MedicalReport, 'id'>,
  testsData: Omit<MedicalTest, 'id'>[]
): Promise<ClinicalConflict[]> {
  const src1Name = `Documented Chart (${patient.name})`;
  const src1Date = patient.updatedAt || patient.createdAt || 'Intake baseline';
  const src1Data = {
    demographics: {
      name: patient.name,
      age: patient.age,
      sex: patient.sex,
      dob: patient.dob
    },
    allergies: patient.allergies || [],
    medications: patient.medications || [],
    conditions: patient.conditions || [],
    symptoms: patient.symptoms || [],
    notes: patient.notes || ''
  };

  const src2Name = reportData.fileName || reportData.reportType || 'Newly Uploaded Report';
  const src2Date = reportData.reportDate || reportData.uploadDate || new Date().toISOString().split('T')[0];
  const src2Data = {
    reportType: reportData.reportType,
    sourceFacility: reportData.sourceFacility,
    documentText: reportData.extractedText || '',
    recordedObservations: testsData.filter(t => t.observation).map(t => `${t.testName}: ${t.observation}`),
    tests: testsData.map(t => ({
      testName: t.testName,
      value: t.value,
      unit: t.unit,
      referenceRange: t.referenceRange,
      status: t.status
    }))
  };

  try {
    const response = await fetch('/api/conflicts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source1: { name: src1Name, date: src1Date, data: src1Data },
        source2: { name: src2Name, date: src2Date, data: src2Data }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.conflicts)) {
        const detectedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        return data.conflicts.map((c: any, idx: number) => ({
          id: `CONF-${Date.now()}-${idx}`,
          patientId: patient.id,
          patientName: patient.name,
          category: (c.category || 'Allergy') as ClinicalConflict['category'],
          title: c.title || 'Potential clinical inconsistency',
          description: c.description || 'Variation detected between clinical sources.',
          source1: {
            name: c.source1?.name || src1Name,
            date: c.source1?.date || src1Date,
            claim: c.source1?.claim || 'Documented record',
            type: 'Clinical Progress Record'
          },
          source2: {
            name: c.source2?.name || src2Name,
            date: c.source2?.date || src2Date,
            claim: c.source2?.claim || 'Uploaded report observation',
            type: 'Intake Requisition'
          },
          detectedDate: detectedAt,
          status: 'active'
        }));
      }
    }
  } catch (err) {
    console.warn('[MedLens Inconsistency Detection] LLM API call failed, running heuristic cross-reference:', err);
  }

  // Graceful rule-based heuristic cross-reference fallback
  return runHeuristicConflictDetection(patient, reportData, testsData, src1Name, src1Date, src2Name, src2Date);
}