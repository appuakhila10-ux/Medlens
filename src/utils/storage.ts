/**
 * MedLens Data Storage Layer
 * Backed by Express REST API (SQLite database) with resilient client-side caching.
 * Ensures patients, reports, tests, and conflicts are always immediately available to the UI.
 */

import { Patient, MedicalTest, MedicalReport, ClinicalConflict } from '../types/clinical';

const API_BASE = typeof window !== 'undefined' 
  ? '' 
  : ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.TEST_API_URL) || 'http://127.0.0.1:3001');

const PATIENTS_CACHE_KEY = 'medlens_patients_v1';
const REPORTS_CACHE_KEY = 'medlens_reports_v1';
const TESTS_CACHE_KEY = 'medlens_tests_v1';
const CONFLICTS_CACHE_KEY = 'medlens_conflicts_v1';

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
    numericValue: 10.2,
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
    numericValue: 31.4,
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
    numericValue: 6.8,
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
    numericValue: 264,
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
    numericValue: 138,
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
    numericValue: 0.88,
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
    numericValue: 14,
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
  {
    id: "TEST-201",
    reportId: "REP-4093",
    patientId: "ML-1043",
    testName: "Total Cholesterol",
    value: "184",
    numericValue: 184,
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
    numericValue: 108,
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

export const DEFAULT_INITIAL_CONFLICTS: ClinicalConflict[] = [
  {
    id: "CONF-301",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    category: "Allergy",
    title: "Allergy documentation variance",
    description: "Potential inconsistency detected between inpatient admission record and recent laboratory order requisition sheet.",
    source1: {
      name: "St. Jude Hospital Admission Summary",
      date: "2025-11-14",
      claim: "Documented allergy: Penicillin (Urticaria, facial swelling)",
      type: "Clinical Progress Record"
    },
    source2: {
      name: "Outpatient Blood Requisition Form",
      date: "2026-08-26",
      claim: "Marked: 'No Known Drug Allergies (NKDA)'",
      type: "Intake Requisition"
    },
    detectedDate: "2026-08-26 14:22",
    status: "active"
  },
  {
    id: "CONF-302",
    patientId: "ML-1044",
    patientName: "Sophia Rodriguez",
    category: "Medication",
    title: "Propranolol dosage discrepancy",
    description: "Potential inconsistency detected between pharmacy dispensing feed and outpatient specialty consult note.",
    source1: {
      name: "Endocrine Consultation Note (Dr. S. Kulkarni)",
      date: "2026-09-03",
      claim: "Prescribed Propranolol 20mg orally three times daily",
      type: "Specialty Clinic Note"
    },
    source2: {
      name: "Patient Portal Self-Report Medication List",
      date: "2026-09-04",
      claim: "Entered Propranolol 10mg orally once daily as needed",
      type: "Patient Intake Portal"
    },
    detectedDate: "2026-09-04 09:15",
    status: "active"
  }
];

// Helper to load cache from localStorage if available, or fallback to defaults
function loadInitialCache<T>(key: string, fallback: T[]): T[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore json errors and use fallback
    }
  }
  return [...fallback];
}

// In-memory cache for synchronous React rendering
let cachedPatients: Patient[] = loadInitialCache(PATIENTS_CACHE_KEY, DEFAULT_INITIAL_PATIENTS);
let cachedReports: MedicalReport[] = loadInitialCache(REPORTS_CACHE_KEY, DEFAULT_INITIAL_REPORTS);
let cachedTests: MedicalTest[] = loadInitialCache(TESTS_CACHE_KEY, DEFAULT_INITIAL_TESTS);
let cachedConflicts: ClinicalConflict[] = loadInitialCache(CONFLICTS_CACHE_KEY, DEFAULT_INITIAL_CONFLICTS);
let isInitialized = false;

function saveLocalCache(key: string, data: any) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }
}

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

// ---------------- Async API Synchronization ----------------

export async function fetchPatientsAsync(): Promise<Patient[]> {
  try {
    const res = await fetch(`${API_BASE}/api/patients`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedPatients = data;
        saveLocalCache(PATIENTS_CACHE_KEY, data);
      }
      return cachedPatients;
    }
  } catch (err) {
    // Background fetch failed, continue using resilient local cache
  }
  return cachedPatients;
}

export async function fetchReportsAsync(): Promise<MedicalReport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/reports`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedReports = data;
        saveLocalCache(REPORTS_CACHE_KEY, data);
      }
      return cachedReports;
    }
  } catch (err) {}
  return cachedReports;
}

export async function fetchTestsAsync(): Promise<MedicalTest[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tests`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedTests = data;
        saveLocalCache(TESTS_CACHE_KEY, data);
      }
      return cachedTests;
    }
  } catch (err) {}
  return cachedTests;
}

export async function fetchConflictsAsync(): Promise<ClinicalConflict[]> {
  try {
    const res = await fetch(`${API_BASE}/api/conflicts`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedConflicts = data;
        saveLocalCache(CONFLICTS_CACHE_KEY, data);
      }
      return cachedConflicts;
    }
  } catch (err) {}
  return cachedConflicts;
}

export async function initStorageFromBackend(): Promise<void> {
  await Promise.all([
    fetchPatientsAsync(),
    fetchReportsAsync(),
    fetchTestsAsync(),
    fetchConflictsAsync()
  ]);
  isInitialized = true;
}

// Auto-trigger background initialization in browser
if (typeof window !== 'undefined' && !isInitialized) {
  initStorageFromBackend().catch(() => {});
}

// ---------------- Patients Storage (Synchronous Signatures) ----------------

export function getStoredPatients(): Patient[] {
  if (cachedPatients.length === 0) {
    cachedPatients = [...DEFAULT_INITIAL_PATIENTS];
  }
  return [...cachedPatients];
}

export function saveStoredPatients(patients: Patient[]): void {
  cachedPatients = [...patients];
  saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);
}

export function createStoredPatient(
  data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> & { customId?: string }
): Patient {
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

  cachedPatients = [newPatient, ...cachedPatients.filter(p => p.id !== newId)];
  saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPatient)
  }).then(async (res) => {
    if (res.ok) {
      const serverPatient = await res.json();
      const idx = cachedPatients.findIndex(p => p.id === newId);
      if (idx !== -1) {
        cachedPatients[idx] = serverPatient;
        saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);
      }
    }
  }).catch(() => {});

  return newPatient;
}

export function updateStoredPatient(id: string, updates: Partial<Patient>): Patient | null {
  const index = cachedPatients.findIndex(p => p.id === id);
  if (index === -1) return null;

  const timestamp = getCurrentTimestamp();
  const updatedPatient: Patient = {
    ...cachedPatients[index],
    ...updates,
    id,
    createdAt: cachedPatients[index].createdAt,
    updatedAt: timestamp
  };

  cachedPatients[index] = updatedPatient;
  saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(() => {});

  return updatedPatient;
}

export function deleteStoredPatient(id: string): boolean {
  const prevLength = cachedPatients.length;
  cachedPatients = cachedPatients.filter(p => p.id !== id);
  const deleted = cachedPatients.length < prevLength;

  if (deleted) {
    saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);
    fetch(`${API_BASE}/api/patients/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  }

  return deleted;
}

// ---------------- Reports Storage ----------------

export function getStoredReports(): MedicalReport[] {
  if (cachedReports.length === 0) {
    cachedReports = [...DEFAULT_INITIAL_REPORTS];
  }
  return [...cachedReports];
}

export function saveStoredReports(reports: MedicalReport[]): void {
  cachedReports = [...reports];
  saveLocalCache(REPORTS_CACHE_KEY, cachedReports);
}

export function getStoredReportsByPatient(patientId: string): MedicalReport[] {
  return getStoredReports().filter(r => r.patientId === patientId);
}

export function createStoredReport(report: MedicalReport): void {
  cachedReports = [report, ...cachedReports.filter(r => r.id !== report.id)];
  saveLocalCache(REPORTS_CACHE_KEY, cachedReports);

  // Update patient cache
  const patient = cachedPatients.find(p => p.id === report.patientId);
  if (patient) {
    patient.reportCount = (patient.reportCount || 0) + 1;
    patient.lastReportDate = report.reportDate || patient.lastReportDate;
    patient.verificationStatus = 'verified';
    saveLocalCache(PATIENTS_CACHE_KEY, cachedPatients);
  }

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  }).catch(() => {});
}

// ---------------- Medical Tests Storage ----------------

export function getStoredMedicalTests(): MedicalTest[] {
  if (cachedTests.length === 0) {
    cachedTests = [...DEFAULT_INITIAL_TESTS];
  }
  return [...cachedTests];
}

export function saveStoredMedicalTests(tests: MedicalTest[]): void {
  cachedTests = [...tests];
  saveLocalCache(TESTS_CACHE_KEY, cachedTests);
}

export function getStoredMedicalTestsByPatient(patientId: string): MedicalTest[] {
  return getStoredMedicalTests().filter(t => t.patientId === patientId);
}

export function createStoredMedicalTests(newTests: MedicalTest[]): void {
  cachedTests = [...newTests, ...cachedTests];
  saveLocalCache(TESTS_CACHE_KEY, cachedTests);

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTests)
  }).catch(() => {});
}

// ---------------- Clinical Conflicts Storage ----------------

export function getStoredConflicts(): ClinicalConflict[] {
  if (cachedConflicts.length === 0) {
    cachedConflicts = [...DEFAULT_INITIAL_CONFLICTS];
  }
  return [...cachedConflicts];
}

export function saveStoredConflicts(conflicts: ClinicalConflict[]): void {
  cachedConflicts = [...conflicts];
  saveLocalCache(CONFLICTS_CACHE_KEY, cachedConflicts);
}

export function getStoredConflictsByPatient(patientId: string): ClinicalConflict[] {
  return getStoredConflicts().filter(c => c.patientId === patientId);
}

export function createStoredConflict(conflict: ClinicalConflict): void {
  const isDuplicate = cachedConflicts.some(
    c => c.patientId === conflict.patientId && c.title === conflict.title && c.status === 'active'
  );
  if (isDuplicate) return;

  cachedConflicts = [conflict, ...cachedConflicts];
  saveLocalCache(CONFLICTS_CACHE_KEY, cachedConflicts);

  // Recalculate patient active conflict count
  const activeCount = cachedConflicts.filter(c => c.patientId === conflict.patientId && c.status === 'active').length;
  updateStoredPatient(conflict.patientId, { conflictCount: activeCount });

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/conflicts-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conflict)
  }).catch(() => {});
}

export function updateStoredConflict(id: string, updates: Partial<ClinicalConflict>): ClinicalConflict | null {
  const idx = cachedConflicts.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const updatedConflict: ClinicalConflict = { ...cachedConflicts[idx], ...updates };
  cachedConflicts[idx] = updatedConflict;
  saveLocalCache(CONFLICTS_CACHE_KEY, cachedConflicts);

  // Recalculate patient active conflict count
  const activeCount = cachedConflicts.filter(c => c.patientId === updatedConflict.patientId && c.status === 'active').length;
  updateStoredPatient(updatedConflict.patientId, { conflictCount: activeCount });

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/conflicts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(() => {});

  return updatedConflict;
}