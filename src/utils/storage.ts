import { Patient, MedicalTest, MedicalReport, ClinicalConflict } from '../types/clinical';
import { MOCK_CONFLICTS } from '../data/mockData';

const PATIENTS_STORAGE_KEY = 'medlens_patients_v1';
const TESTS_STORAGE_KEY = 'medlens_medical_tests_v1';
const REPORTS_STORAGE_KEY = 'medlens_reports_v1';
const CONFLICTS_STORAGE_KEY = 'medlens_conflicts_v1';

export const DEFAULT_INITIAL_PATIENTS: Patient[] = [
  {
    id: "ML-1042",
    name: "Eleanor Vance",
    age: 58,
    sex: "Female",
    dob: "1968-04-12",
    mrn: "MRN-849201",
    symptoms: [
      "Fatigue (intermittent, 3 months)",
      "Mild exertional shortness of breath",
      "Cold sensitivity in extremities"
    ],
    conditions: [
      "Essential Hypertension",
      "Type 2 Diabetes Mellitus",
      "Osteopenia"
    ],
    allergies: [
      "Penicillin (Urticarial rash)",
      "Sulfa Antibiotics (GI distress)"
    ],
    medications: [
      "Metformin HCl 500mg (Twice daily with meals)",
      "Lisinopril 10mg (Once daily in morning)",
      "Cholecalciferol (Vitamin D3) 2000 IU (Once daily)"
    ],
    notes: "Patient reports adherence to low-sodium dietary plan. Prior episode of penicillin allergy confirmed during 2025 admission.",
    createdAt: "2026-08-20 09:30",
    updatedAt: "2026-08-28 14:15",
    lastReportDate: "2026-08-26",
    verificationStatus: "pending",
    reportCount: 2,
    conflictCount: 1,
    aiSummary: {
      text: "The 2 uploaded medical reports contain 8 recorded laboratory tests from August 26, 2026. Fasting Blood Glucose is recorded as 138 mg/dL, which is above the source report's reference range of 70 – 99 mg/dL. Hemoglobin is recorded as 10.2 g/dL, which is below the source report's reference range of 12.0 – 16.0 g/dL. Hematocrit is recorded as 31.4%, which is below the source report's reference range of 37.0 – 48.0%. Serum Ferritin is recorded as 14 ng/mL, which is below the source report's reference range of 15 – 150 ng/mL. White Blood Cells (WBC), Platelets, and Serum Creatinine were recorded within their respective reference ranges. Reference range was not provided in the source report for RBC Morphology Index. Recorded observations note: Hemoglobin: Microcytic presentation on peripheral smear; Hematocrit: Red cell mass reduced. This summary organizes reported values and does not provide a diagnosis or medical recommendation.",
      generatedAt: "2026-08-26 14:15",
      recordsAnalyzedCount: 8,
      disclaimer: "MedLens summarizes and organizes reported information. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional."
    }
  },
  {
    id: "ML-1043",
    name: "Marcus Chen",
    age: 44,
    sex: "Male",
    dob: "1982-11-03",
    mrn: "MRN-639102",
    symptoms: [
      "Asymptomatic routine monitoring",
      "Occasional post-exercise bilateral knee stiffness"
    ],
    conditions: [
      "Hypercholesterolemia",
      "Mild Seasonal Allergic Rhinitis"
    ],
    allergies: [
      "Ragweed / Timothy Grass Pollen (Sneezing, rhinorrhea)"
    ],
    medications: [
      "Atorvastatin Calcium 20mg (Nightly at bedtime)",
      "Fluticasone Propionate 50mcg (1 spray each nostril PRN)"
    ],
    notes: "Follow-up lipid evaluation scheduled for next quarter. Tolerating statin therapy well without myalgias.",
    createdAt: "2026-08-22 11:00",
    updatedAt: "2026-09-02 10:20",
    lastReportDate: "2026-09-01",
    verificationStatus: "verified",
    reportCount: 1,
    conflictCount: 0,
    aiSummary: {
      text: "Organized data from the September 2026 lipid follow-up panel shows LDL-C and Total Cholesterol values shifted lower compared to baseline testing from October 2025. Hepatic transaminases (ALT, AST) are noted within report-specific reference ranges. Medication record lists daily statin adherence.",
      generatedAt: "2026-09-01 09:40",
      recordsAnalyzedCount: 3,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
    }
  },
  {
    id: "ML-1044",
    name: "Sophia Rodriguez",
    age: 32,
    sex: "Female",
    dob: "1994-07-19",
    mrn: "MRN-442198",
    symptoms: [
      "Palpitations (transient, resting)",
      "Weight loss (approx 4 kg over 2 months)",
      "Heat intolerance"
    ],
    conditions: [
      "Thyroiditis under clinical evaluation",
      "Migraine with aura"
    ],
    allergies: [
      "Iodinated Contrast Media (Flushing, pruritus)",
      "Latex (Contact dermatitis)"
    ],
    medications: [
      "Propranolol HCl 20mg (Three times daily)",
      "Sumatriptan 50mg (At onset of migraine)"
    ],
    notes: "Requires endo follow-up with repeated free T4/TSH levels. Patient counseled on hydration.",
    createdAt: "2026-08-25 14:00",
    updatedAt: "2026-09-04 16:45",
    lastReportDate: "2026-09-03",
    verificationStatus: "in_review",
    reportCount: 1,
    conflictCount: 1,
    aiSummary: {
      text: "Comprehensive endocrine panel results from September 2026 document suppressed TSH and elevated Free T4 relative to laboratory reference intervals. Cardiac monitoring report notes resting sinus tachycardia without acute arrhythmia. Thyroid ultrasound report documented diffuse heterogeneity.",
      generatedAt: "2026-09-03 16:30",
      recordsAnalyzedCount: 5,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
    }
  },
  {
    id: "ML-1045",
    name: "James Wilson",
    age: 67,
    sex: "Male",
    dob: "1959-02-28",
    mrn: "MRN-720119",
    symptoms: [
      "Polyuria, polydipsia (mild)",
      "Bilateral lower extremity numbness in distal toes"
    ],
    conditions: [
      "Type 2 Diabetes (Duration 12 yrs)",
      "Chronic Kidney Disease Stage 2",
      "Coronary Artery Disease (s/p Stent 2021)"
    ],
    allergies: [
      "No Known Drug Allergies (NKDA)"
    ],
    medications: [
      "Empagliflozin 10mg (Once daily)",
      "Metformin ER 1000mg (Once daily with dinner)",
      "Aspirin 81mg (Once daily)",
      "Rosuvastatin 10mg (Once daily at bedtime)"
    ],
    notes: "Stable cardiorenal parameters over past 12 months. Regular podiatry exams scheduled.",
    createdAt: "2026-08-15 08:30",
    updatedAt: "2026-08-30 11:20",
    lastReportDate: "2026-08-29",
    verificationStatus: "verified",
    reportCount: 1,
    conflictCount: 0
  },
  {
    id: "ML-1046",
    name: "Aisha Patel",
    age: 26,
    sex: "Female",
    dob: "2000-09-14",
    mrn: "MRN-319502",
    symptoms: [
      "Generalized weakness",
      "Orthostatic lightheadedness",
      "Brittle nails"
    ],
    conditions: [
      "Iron Deficiency under investigation",
      "Celiac Disease (Biopsy Confirmed 2022)"
    ],
    allergies: [
      "Gluten (Dietary - Celiac Disease)"
    ],
    medications: [
      "Ferrous Fumarate 210mg (Alternate days)",
      "Methylcobalamin (B12) 1000mcg (Once weekly sublingual)"
    ],
    notes: "Adhering strictly to gluten-free diet. Monitoring hematologic response to oral iron.",
    createdAt: "2026-08-29 13:15",
    updatedAt: "2026-09-05 14:00",
    lastReportDate: "2026-09-04",
    verificationStatus: "pending",
    reportCount: 1,
    conflictCount: 0
  }
];

export const DEFAULT_INITIAL_REPORTS: MedicalReport[] = [
  {
    id: "REP-4091",
    patientId: "ML-1042",
    fileName: "CBC_Differential_Report_Aug26.pdf",
    fileType: "PDF",
    fileSize: "1.4 MB",
    reportDate: "2026-08-26",
    uploadDate: "2026-08-26 13:42",
    processingStatus: "Completed",
    verificationStatus: "verified",
    source: "St. Jude Regional Pathology Laboratory",
    extractedEntitiesCount: 6,
    patientName: "Eleanor Vance",
    sourceFacility: "St. Jude Regional Pathology Laboratory",
    extractedText: "CBC Panel with Differential. Hemoglobin 10.2 g/dL (Low). Hematocrit 31.4% (Low). WBC 6.8 x10^3/uL (Normal). Platelets 264 x10^3/uL (Normal)."
  },
  {
    id: "REP-4092",
    patientId: "ML-1042",
    fileName: "Metabolic_Panel_CMP_Aug26.pdf",
    fileType: "PDF",
    fileSize: "2.1 MB",
    reportDate: "2026-08-26",
    uploadDate: "2026-08-26 13:45",
    processingStatus: "Completed",
    verificationStatus: "verified",
    source: "Quest Diagnostic Services",
    extractedEntitiesCount: 5,
    patientName: "Eleanor Vance",
    sourceFacility: "Quest Diagnostic Services",
    extractedText: "Comprehensive Metabolic Panel. Fasting Glucose 138 mg/dL (High). Creatinine 0.88 mg/dL (Normal). eGFR 82 mL/min/1.73m2 (Normal)."
  },
  {
    id: "REP-4093",
    patientId: "ML-1043",
    fileName: "Annual_Lipid_Panel_Sep01.pdf",
    fileType: "PDF",
    fileSize: "890 KB",
    reportDate: "2026-09-01",
    uploadDate: "2026-09-01 09:12",
    processingStatus: "Completed",
    verificationStatus: "verified",
    source: "BioReference Laboratories",
    extractedEntitiesCount: 4,
    patientName: "Marcus Chen",
    sourceFacility: "BioReference Laboratories",
    extractedText: "Lipid Profile. Total Cholesterol 184 mg/dL. LDL-C 108 mg/dL. HDL-C 52 mg/dL. Triglycerides 120 mg/dL."
  },
  {
    id: "REP-4094",
    patientId: "ML-1044",
    fileName: "Endocrine_Thyroid_Screen_Sep03.jpg",
    fileType: "JPG",
    fileSize: "3.2 MB",
    reportDate: "2026-09-03",
    uploadDate: "2026-09-03 15:55",
    processingStatus: "Pending Review",
    verificationStatus: "pending",
    source: "University Hospital Diagnostic Labs",
    extractedEntitiesCount: 4,
    patientName: "Sophia Rodriguez",
    sourceFacility: "University Hospital Diagnostic Labs",
    extractedText: "Thyroid Endocrine Panel. TSH 0.04 uIU/mL (Low). FT4 2.8 ng/dL (High). Total T3 215 ng/dL (High)."
  }
];

export const DEFAULT_INITIAL_TESTS: MedicalTest[] = [
  {
    id: "TEST-101",
    reportId: "REP-4091",
    patientId: "ML-1042",
    testName: "Hemoglobin",
    value: "10.2",
    unit: "g/dL",
    referenceRange: "12.0 – 16.0 g/dL",
    status: "Low",
    date: "2026-08-26",
    observation: "Microcytic presentation on peripheral smear",
    source: "Extracted from report",
    confidence: 0.96,
    verified: true
  },
  {
    id: "TEST-102",
    reportId: "REP-4091",
    patientId: "ML-1042",
    testName: "Hematocrit",
    value: "31.4",
    unit: "%",
    referenceRange: "37.0 – 48.0 %",
    status: "Low",
    date: "2026-08-26",
    observation: "Red cell mass reduced",
    source: "Extracted from report",
    confidence: 0.98,
    verified: true
  },
  {
    id: "TEST-103",
    reportId: "REP-4091",
    patientId: "ML-1042",
    testName: "White Blood Cells (WBC)",
    value: "6.8",
    unit: "x10^3/uL",
    referenceRange: "4.5 – 11.0 x10^3/uL",
    status: "Normal",
    date: "2026-08-26",
    observation: "Unremarkable differential",
    source: "Extracted from report",
    confidence: 0.99,
    verified: true
  },
  {
    id: "TEST-104",
    reportId: "REP-4091",
    patientId: "ML-1042",
    testName: "Platelets",
    value: "264",
    unit: "x10^3/uL",
    referenceRange: "150 – 450 x10^3/uL",
    status: "Normal",
    date: "2026-08-26",
    observation: "Adequate thrombocyte count",
    source: "Extracted from report",
    confidence: 0.97,
    verified: true
  },
  {
    id: "TEST-105",
    reportId: "REP-4092",
    patientId: "ML-1042",
    testName: "Fasting Blood Glucose",
    value: "138",
    unit: "mg/dL",
    referenceRange: "70 – 99 mg/dL",
    status: "High",
    date: "2026-08-26",
    observation: "Fasting glucose elevated",
    source: "Extracted from report",
    confidence: 0.98,
    verified: true
  },
  {
    id: "TEST-106",
    reportId: "REP-4092",
    patientId: "ML-1042",
    testName: "Serum Creatinine",
    value: "0.88",
    unit: "mg/dL",
    referenceRange: "0.59 – 1.04 mg/dL",
    status: "Normal",
    date: "2026-08-26",
    observation: "Renal profile within report limits",
    source: "Extracted from report",
    confidence: 0.99,
    verified: true
  },
  {
    id: "TEST-107",
    reportId: "REP-4092",
    patientId: "ML-1042",
    testName: "Serum Ferritin",
    value: "14",
    unit: "ng/mL",
    referenceRange: "15 – 150 ng/mL",
    status: "Low",
    date: "2026-08-26",
    observation: "Low circulating storage iron",
    source: "Extracted from report",
    confidence: 0.84,
    verified: true
  },
  {
    id: "TEST-108",
    reportId: "REP-4092",
    patientId: "ML-1042",
    testName: "RBC Morphology Index",
    value: "Microcytic hypochromic",
    unit: "Qualitative",
    referenceRange: "Reference range unavailable — status not determined.",
    status: "Range unavailable",
    date: "2026-08-26",
    observation: "Reference range unavailable in source document",
    source: "Extracted from report",
    confidence: 0.65,
    verified: true
  },
  // Marcus Chen (ML-1043)
  {
    id: "TEST-201",
    reportId: "REP-4093",
    patientId: "ML-1043",
    testName: "Total Cholesterol",
    value: "184",
    unit: "mg/dL",
    referenceRange: "< 200 mg/dL",
    status: "Normal",
    date: "2026-09-01",
    observation: "Follow-up lipid evaluation",
    source: "Extracted from report",
    confidence: 0.98,
    verified: true
  },
  {
    id: "TEST-202",
    reportId: "REP-4093",
    patientId: "ML-1043",
    testName: "LDL-C (Calculated)",
    value: "108",
    unit: "mg/dL",
    referenceRange: "< 100 mg/dL",
    status: "High",
    date: "2026-09-01",
    observation: "Calculated Friedewald equation",
    source: "Extracted from report",
    confidence: 0.97,
    verified: true
  }
];

export function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function generatePatientId(): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `ML-${randNum}`;
}

// ---------------- Patients Storage ----------------
export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_PATIENTS));
      return DEFAULT_INITIAL_PATIENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INITIAL_PATIENTS;
  } catch (err) {
    console.error("Failed to read patients from localStorage:", err);
    return DEFAULT_INITIAL_PATIENTS;
  }
}

export function saveStoredPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error("Failed to save patients to localStorage:", err);
  }
}

export function createStoredPatient(
  data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> & { customId?: string }
): Patient {
  const patients = getStoredPatients();
  const newId = data.customId || generatePatientId();
  const timestamp = getCurrentTimestamp();

  const newPatient: Patient = {
    ...data,
    id: newId,
    createdAt: timestamp,
    updatedAt: timestamp,
    mrn: data.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
    verificationStatus: data.verificationStatus || 'pending',
    reportCount: data.reportCount || 0,
    conflictCount: data.conflictCount || 0,
    lastReportDate: data.lastReportDate || 'No reports yet',
    aiSummary: data.aiSummary || {
      text: `Patient profile created via clinical intake for ${data.name}. Baseline records established. Pending diagnostic documentation.`,
      generatedAt: timestamp,
      recordsAnalyzedCount: 0,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
    }
  };

  const updated = [newPatient, ...patients];
  saveStoredPatients(updated);
  return newPatient;
}

export function updateStoredPatient(id: string, updates: Partial<Patient>): Patient | null {
  const patients = getStoredPatients();
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) return null;

  const timestamp = getCurrentTimestamp();
  const updatedPatient: Patient = {
    ...patients[index],
    ...updates,
    id,
    createdAt: patients[index].createdAt,
    updatedAt: timestamp
  };

  patients[index] = updatedPatient;
  saveStoredPatients(patients);
  return updatedPatient;
}

export function deleteStoredPatient(id: string): boolean {
  const patients = getStoredPatients();
  const filtered = patients.filter(p => p.id !== id);
  if (filtered.length === patients.length) return false;
  saveStoredPatients(filtered);
  return true;
}

// ---------------- Reports Storage ----------------
export function getStoredReports(): MedicalReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_REPORTS));
      return DEFAULT_INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_REPORTS;
  } catch (err) {
    console.error("Failed to read reports from localStorage:", err);
    return DEFAULT_INITIAL_REPORTS;
  }
}

export function saveStoredReports(reports: MedicalReport[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Failed to save reports to localStorage:", err);
  }
}

export function getStoredReportsByPatient(patientId: string): MedicalReport[] {
  const all = getStoredReports();
  return all.filter(r => r.patientId === patientId);
}

export function createStoredReport(report: MedicalReport): void {
  const existing = getStoredReports();
  const updated = [report, ...existing];
  saveStoredReports(updated);

  // Increment patient reportCount & update lastReportDate
  const patients = getStoredPatients();
  const patient = patients.find(p => p.id === report.patientId);
  if (patient) {
    updateStoredPatient(patient.id, {
      reportCount: (patient.reportCount || 0) + 1,
      lastReportDate: report.reportDate,
      verificationStatus: 'verified'
    });
  }
}

// ---------------- Medical Tests Storage ----------------
export function getStoredMedicalTests(): MedicalTest[] {
  try {
    const raw = localStorage.getItem(TESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_TESTS));
      return DEFAULT_INITIAL_TESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_TESTS;
  } catch (err) {
    console.error("Failed to read medical tests from localStorage:", err);
    return DEFAULT_INITIAL_TESTS;
  }
}

export function saveStoredMedicalTests(tests: MedicalTest[]): void {
  try {
    localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.error("Failed to save medical tests to localStorage:", err);
  }
}

export function getStoredMedicalTestsByPatient(patientId: string): MedicalTest[] {
  const allTests = getStoredMedicalTests();
  return allTests.filter(t => t.patientId === patientId);
}

export function createStoredMedicalTests(newTests: MedicalTest[]): void {
  const existing = getStoredMedicalTests();
  const updated = [...newTests, ...existing];
  saveStoredMedicalTests(updated);
}

// ---------------- Clinical Conflicts Storage ----------------
export function getStoredConflicts(): ClinicalConflict[] {
  try {
    const raw = localStorage.getItem(CONFLICTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFLICTS_STORAGE_KEY, JSON.stringify(MOCK_CONFLICTS));
      return MOCK_CONFLICTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_CONFLICTS;
  } catch (err) {
    console.error("Failed to read clinical conflicts from localStorage:", err);
    return MOCK_CONFLICTS;
  }
}

export function saveStoredConflicts(conflicts: ClinicalConflict[]): void {
  try {
    localStorage.setItem(CONFLICTS_STORAGE_KEY, JSON.stringify(conflicts));
  } catch (err) {
    console.error("Failed to save clinical conflicts to localStorage:", err);
  }
}

export function getStoredConflictsByPatient(patientId: string): ClinicalConflict[] {
  const all = getStoredConflicts();
  return all.filter(c => c.patientId === patientId);
}

export function createStoredConflict(conflict: ClinicalConflict): void {
  const existing = getStoredConflicts();
  // Avoid duplicate active conflict with identical title and patient
  const isDuplicate = existing.some(
    c => c.patientId === conflict.patientId && c.title === conflict.title && c.status === 'active'
  );
  if (isDuplicate) return;

  const updated = [conflict, ...existing];
  saveStoredConflicts(updated);

  // Update patient active conflict count
  const activeCount = updated.filter(c => c.patientId === conflict.patientId && c.status === 'active').length;
  updateStoredPatient(conflict.patientId, { conflictCount: activeCount });
}

export function updateStoredConflict(id: string, updates: Partial<ClinicalConflict>): ClinicalConflict | null {
  const all = getStoredConflicts();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const updatedConflict: ClinicalConflict = { ...all[idx], ...updates };
  all[idx] = updatedConflict;
  saveStoredConflicts(all);

  // Update patient active conflict count
  const activeCount = all.filter(c => c.patientId === updatedConflict.patientId && c.status === 'active').length;
  updateStoredPatient(updatedConflict.patientId, { conflictCount: activeCount });

  return updatedConflict;
}