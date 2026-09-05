import { Patient, MedicalTest } from '../types/clinical';

const PATIENTS_STORAGE_KEY = 'medlens_patients_v1';
const TESTS_STORAGE_KEY = 'medlens_medical_tests_v1';

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
    reportCount: 4,
    conflictCount: 1,
    aiSummary: {
      text: "Records reflect an established history of hypertension and type 2 diabetes managed with oral pharmacotherapy. Recent laboratory data exhibits mild microcytic red blood cell indices and low serum ferritin in comparison to previous panels. Renal metabolic parameters remain documented within source report reference boundaries. An allergy discrepancy exists between the outpatient intake record and recent requisition form requiring staff verification.",
      generatedAt: "2026-08-26 14:15",
      recordsAnalyzedCount: 4,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
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
    reportCount: 3,
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
    reportCount: 5,
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
    reportCount: 6,
    conflictCount: 0,
    aiSummary: {
      text: "Longitudinal records summarize glycemic and renal functional indexes. Serum creatinine and estimated GFR (eGFR) have demonstrated stability across consecutive evaluations. Hemoglobin A1c is tracked across the last four quarters without significant acute trajectory shift.",
      generatedAt: "2026-08-29 11:20",
      recordsAnalyzedCount: 6,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
    }
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
    reportCount: 2,
    conflictCount: 0,
    aiSummary: {
      text: "Recent complete blood count extracted on September 4, 2026 exhibits hemoglobin of 9.8 g/dL alongside low MCV and low serum ferritin according to lab-reported reference intervals. Dietary records reinforce strict adherence to a gluten-free regimen.",
      generatedAt: "2026-09-04 15:10",
      recordsAnalyzedCount: 2,
      disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
    }
  }
];

// Helper to format date string
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

export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_PATIENTS));
      return DEFAULT_INITIAL_PATIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return parsed;
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
    id, // protect ID from alteration
    createdAt: patients[index].createdAt, // protect original creation time
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

export function getStoredMedicalTests(): MedicalTest[] {
  try {
    const raw = localStorage.getItem(TESTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read medical tests from localStorage:", err);
    return [];
  }
}

export function getStoredMedicalTestsByPatient(patientId: string): MedicalTest[] {
  const allTests = getStoredMedicalTests();
  return allTests.filter(t => t.patientId === patientId);
}

export function saveStoredMedicalTests(tests: MedicalTest[]): void {
  try {
    localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.error("Failed to save medical tests to localStorage:", err);
  }
}