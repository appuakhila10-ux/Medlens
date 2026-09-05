import { Patient, LabResult, MedicalReport, ClinicalConflict, TimelineEvent, ComparisonItem } from '../types/clinical';
import { DEFAULT_INITIAL_PATIENTS } from '../utils/storage';

export const MOCK_PATIENTS: Patient[] = DEFAULT_INITIAL_PATIENTS;

export const MOCK_LAB_RESULTS: LabResult[] = [
  // Eleanor Vance (ML-1042)
  {
    id: "LAB-801",
    testName: "Hemoglobin",
    value: "10.2",
    numericValue: 10.2,
    unit: "g/dL",
    referenceRange: "12.0 – 16.0 g/dL",
    status: "low",
    source: "extracted_from_report",
    sourceDocument: "Complete Blood Count (CBC) - St. Jude Pathology",
    sourceDate: "2026-08-26",
    category: "Hematology",
    verificationStatus: "pending",
    confidence: 0.96
  },
  {
    id: "LAB-802",
    testName: "Hematocrit",
    value: "31.4",
    numericValue: 31.4,
    unit: "%",
    referenceRange: "37.0 – 48.0 %",
    status: "low",
    source: "extracted_from_report",
    sourceDocument: "Complete Blood Count (CBC) - St. Jude Pathology",
    sourceDate: "2026-08-26",
    category: "Hematology",
    verificationStatus: "pending",
    confidence: 0.98
  },
  {
    id: "LAB-803",
    testName: "White Blood Cells (WBC)",
    value: "6.8",
    numericValue: 6.8,
    unit: "x10^3/uL",
    referenceRange: "4.5 – 11.0 x10^3/uL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Complete Blood Count (CBC) - St. Jude Pathology",
    sourceDate: "2026-08-26",
    category: "Hematology",
    verificationStatus: "verified",
    confidence: 0.99
  },
  {
    id: "LAB-804",
    testName: "Platelets",
    value: "264",
    numericValue: 264,
    unit: "x10^3/uL",
    referenceRange: "150 – 450 x10^3/uL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Complete Blood Count (CBC) - St. Jude Pathology",
    sourceDate: "2026-08-26",
    category: "Hematology",
    verificationStatus: "verified",
    confidence: 0.97
  },
  {
    id: "LAB-805",
    testName: "Serum Ferritin",
    value: "14",
    numericValue: 14,
    unit: "ng/mL",
    referenceRange: "15 – 150 ng/mL",
    status: "low",
    source: "extracted_from_report",
    sourceDocument: "Iron Studies Panel - LabCorp",
    sourceDate: "2026-08-26",
    category: "Hematology",
    verificationStatus: "pending",
    confidence: 0.94
  },
  {
    id: "LAB-806",
    testName: "Fasting Blood Glucose",
    value: "138",
    numericValue: 138,
    unit: "mg/dL",
    referenceRange: "70 – 99 mg/dL",
    status: "high",
    source: "extracted_from_report",
    sourceDocument: "Comprehensive Metabolic Panel - Quest",
    sourceDate: "2026-08-26",
    category: "Metabolic",
    verificationStatus: "verified",
    confidence: 0.95
  },
  {
    id: "LAB-807",
    testName: "Hemoglobin A1c",
    value: "7.1",
    numericValue: 7.1,
    unit: "%",
    referenceRange: "< 5.7 %",
    status: "high",
    source: "extracted_from_report",
    sourceDocument: "Comprehensive Metabolic Panel - Quest",
    sourceDate: "2026-08-26",
    category: "Metabolic",
    verificationStatus: "verified",
    confidence: 0.99
  },
  {
    id: "LAB-808",
    testName: "Serum Creatinine",
    value: "0.88",
    numericValue: 0.88,
    unit: "mg/dL",
    referenceRange: "0.59 – 1.04 mg/dL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Comprehensive Metabolic Panel - Quest",
    sourceDate: "2026-08-26",
    category: "Metabolic",
    verificationStatus: "verified",
    confidence: 0.99
  },
  {
    id: "LAB-809",
    testName: "Estimated GFR (eGFR)",
    value: "82",
    numericValue: 82,
    unit: "mL/min/1.73m2",
    referenceRange: "> 60 mL/min/1.73m2",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Comprehensive Metabolic Panel - Quest",
    sourceDate: "2026-08-26",
    category: "Metabolic",
    verificationStatus: "verified",
    confidence: 0.98
  },
  {
    id: "LAB-810",
    testName: "Estimated Mean Glucose (eAG)",
    value: "157",
    numericValue: 157,
    unit: "mg/dL",
    referenceRange: "Source report provides no discrete reference bounds",
    status: "unavailable",
    source: "ai_generated",
    sourceDocument: "Algorithmic conversion from HbA1c 7.1%",
    sourceDate: "2026-08-26",
    category: "Metabolic",
    verificationStatus: "pending",
    confidence: 0.91
  },

  // Marcus Chen (ML-1043)
  {
    id: "LAB-811",
    testName: "Total Cholesterol",
    value: "184",
    numericValue: 184,
    unit: "mg/dL",
    referenceRange: "< 200 mg/dL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Lipid Profile Panel - BioReference",
    sourceDate: "2026-09-01",
    category: "Lipid",
    verificationStatus: "verified",
    confidence: 0.98
  },
  {
    id: "LAB-812",
    testName: "LDL-C (Calculated)",
    value: "108",
    numericValue: 108,
    unit: "mg/dL",
    referenceRange: "< 100 mg/dL",
    status: "high",
    source: "extracted_from_report",
    sourceDocument: "Lipid Profile Panel - BioReference",
    sourceDate: "2026-09-01",
    category: "Lipid",
    verificationStatus: "verified",
    confidence: 0.97
  },
  {
    id: "LAB-813",
    testName: "HDL-C",
    value: "52",
    numericValue: 52,
    unit: "mg/dL",
    referenceRange: "> 40 mg/dL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Lipid Profile Panel - BioReference",
    sourceDate: "2026-09-01",
    category: "Lipid",
    verificationStatus: "verified",
    confidence: 0.99
  },
  {
    id: "LAB-814",
    testName: "Triglycerides",
    value: "120",
    numericValue: 120,
    unit: "mg/dL",
    referenceRange: "< 150 mg/dL",
    status: "normal",
    source: "extracted_from_report",
    sourceDocument: "Lipid Profile Panel - BioReference",
    sourceDate: "2026-09-01",
    category: "Lipid",
    verificationStatus: "verified",
    confidence: 0.98
  },

  // Sophia Rodriguez (ML-1044)
  {
    id: "LAB-815",
    testName: "Thyroid Stimulating Hormone (TSH)",
    value: "0.04",
    numericValue: 0.04,
    unit: "uIU/mL",
    referenceRange: "0.45 – 4.50 uIU/mL",
    status: "low",
    source: "extracted_from_report",
    sourceDocument: "Specialty Thyroid Panel - Univ Hospital Lab",
    sourceDate: "2026-09-03",
    category: "Thyroid",
    verificationStatus: "in_review",
    confidence: 0.96
  },
  {
    id: "LAB-816",
    testName: "Free Thyroxine (FT4)",
    value: "2.8",
    numericValue: 2.8,
    unit: "ng/dL",
    referenceRange: "0.82 – 1.77 ng/dL",
    status: "high",
    source: "extracted_from_report",
    sourceDocument: "Specialty Thyroid Panel - Univ Hospital Lab",
    sourceDate: "2026-09-03",
    category: "Thyroid",
    verificationStatus: "in_review",
    confidence: 0.97
  }
];

export const MOCK_REPORTS: MedicalReport[] = [
  {
    id: "REP-4091",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    reportName: "CBC_Differential_Report_Aug26.pdf",
    reportType: "Complete Blood Count",
    date: "2026-08-26",
    uploadDate: "2026-08-26 13:42",
    fileSize: "1.4 MB",
    fileType: "PDF",
    processingStatus: "Completed",
    extractedEntitiesCount: 16,
    extractionConfidence: 0.96,
    sourceFacility: "St. Jude Regional Pathology Laboratory"
  },
  {
    id: "REP-4092",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    reportName: "Metabolic_Panel_CMP_Aug26.pdf",
    reportType: "Comprehensive Metabolic Panel",
    date: "2026-08-26",
    uploadDate: "2026-08-26 13:45",
    fileSize: "2.1 MB",
    fileType: "PDF",
    processingStatus: "Completed",
    extractedEntitiesCount: 14,
    extractionConfidence: 0.98,
    sourceFacility: "Quest Diagnostic Services"
  },
  {
    id: "REP-4093",
    patientId: "ML-1043",
    patientName: "Marcus Chen",
    reportName: "Annual_Lipid_Panel_Sep01.pdf",
    reportType: "Lipid Profile",
    date: "2026-09-01",
    uploadDate: "2026-09-01 09:12",
    fileSize: "890 KB",
    fileType: "PDF",
    processingStatus: "Completed",
    extractedEntitiesCount: 8,
    extractionConfidence: 0.98,
    sourceFacility: "BioReference Laboratories"
  },
  {
    id: "REP-4094",
    patientId: "ML-1044",
    patientName: "Sophia Rodriguez",
    reportName: "Endocrine_Thyroid_Screen_Sep03.jpg",
    reportType: "Endocrine Panel",
    date: "2026-09-03",
    uploadDate: "2026-09-03 15:55",
    fileSize: "3.6 MB",
    fileType: "JPG",
    processingStatus: "Pending Review",
    extractedEntitiesCount: 11,
    extractionConfidence: 0.94,
    sourceFacility: "University Hospital Diagnostic Labs"
  },
  {
    id: "REP-4095",
    patientId: "ML-1046",
    patientName: "Aisha Patel",
    reportName: "Iron_CBC_Workup_Sep04.png",
    reportType: "Complete Blood Count",
    date: "2026-09-04",
    uploadDate: "2026-09-04 14:30",
    fileSize: "2.8 MB",
    fileType: "PNG",
    processingStatus: "Pending Review",
    extractedEntitiesCount: 12,
    extractionConfidence: 0.95,
    sourceFacility: "Apex Health Diagnostics"
  },
  {
    id: "REP-4096",
    patientId: "ML-1045",
    patientName: "James Wilson",
    reportName: "Renal_Electrolytes_Aug29.pdf",
    reportType: "Comprehensive Metabolic Panel",
    date: "2026-08-29",
    uploadDate: "2026-08-29 10:14",
    fileSize: "1.9 MB",
    fileType: "PDF",
    processingStatus: "Completed",
    extractedEntitiesCount: 15,
    extractionConfidence: 0.99,
    sourceFacility: "Mercy General Laboratory"
  }
];

export const MOCK_COMPARISONS: Record<string, ComparisonItem[]> = {
  "ML-1042": [
    {
      testName: "Hemoglobin",
      previousValue: "11.6",
      currentValue: "10.2",
      previousRange: "12.0 – 16.0 g/dL",
      currentRange: "12.0 – 16.0 g/dL",
      unit: "g/dL",
      delta: "-1.4 g/dL",
      trend: "decreased",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    },
    {
      testName: "Hematocrit",
      previousValue: "34.8",
      currentValue: "31.4",
      previousRange: "37.0 – 48.0 %",
      currentRange: "37.0 – 48.0 %",
      unit: "%",
      delta: "-3.4 %",
      trend: "decreased",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    },
    {
      testName: "Serum Ferritin",
      previousValue: "32",
      currentValue: "14",
      previousRange: "15 – 150 ng/mL",
      currentRange: "15 – 150 ng/mL",
      unit: "ng/mL",
      delta: "-18 ng/mL",
      trend: "decreased",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    },
    {
      testName: "Hemoglobin A1c",
      previousValue: "6.8",
      currentValue: "7.1",
      previousRange: "< 5.7 %",
      currentRange: "< 5.7 %",
      unit: "%",
      delta: "+0.3 %",
      trend: "increased",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    },
    {
      testName: "Fasting Glucose",
      previousValue: "124",
      currentValue: "138",
      previousRange: "70 – 99 mg/dL",
      currentRange: "70 – 99 mg/dL",
      unit: "mg/dL",
      delta: "+14 mg/dL",
      trend: "increased",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    },
    {
      testName: "Serum Creatinine",
      previousValue: "0.85",
      currentValue: "0.88",
      previousRange: "0.59 – 1.04 mg/dL",
      currentRange: "0.59 – 1.04 mg/dL",
      unit: "mg/dL",
      delta: "+0.03 mg/dL",
      trend: "unchanged",
      previousDate: "2026-03-15",
      currentDate: "2026-08-26"
    }
  ],
  "ML-1043": [
    {
      testName: "Total Cholesterol",
      previousValue: "228",
      currentValue: "184",
      previousRange: "< 200 mg/dL",
      currentRange: "< 200 mg/dL",
      unit: "mg/dL",
      delta: "-44 mg/dL",
      trend: "decreased",
      previousDate: "2025-10-18",
      currentDate: "2026-09-01"
    },
    {
      testName: "LDL-C (Calculated)",
      previousValue: "148",
      currentValue: "108",
      previousRange: "< 100 mg/dL",
      currentRange: "< 100 mg/dL",
      unit: "mg/dL",
      delta: "-40 mg/dL",
      trend: "decreased",
      previousDate: "2025-10-18",
      currentDate: "2026-09-01"
    },
    {
      testName: "HDL-C",
      previousValue: "49",
      currentValue: "52",
      previousRange: "> 40 mg/dL",
      currentRange: "> 40 mg/dL",
      unit: "mg/dL",
      delta: "+3 mg/dL",
      trend: "increased",
      previousDate: "2025-10-18",
      currentDate: "2026-09-01"
    },
    {
      testName: "Triglycerides",
      previousValue: "155",
      currentValue: "120",
      previousRange: "< 150 mg/dL",
      currentRange: "< 150 mg/dL",
      unit: "mg/dL",
      delta: "-35 mg/dL",
      trend: "decreased",
      previousDate: "2025-10-18",
      currentDate: "2026-09-01"
    }
  ]
};

export const MOCK_CONFLICTS: ClinicalConflict[] = [
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

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "EVT-901",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    date: "2026-08-26",
    timestamp: "13:42 EST",
    eventType: "report_uploaded",
    title: "Complete Blood Count Report Uploaded",
    description: "Uploaded CBC_Differential_Report_Aug26.pdf (1.4 MB). 16 entities queued for OCR extraction.",
    source: "Upload System (Web Client)",
    actor: "Nurse Practitioner J. Miller"
  },
  {
    id: "EVT-902",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    date: "2026-08-26",
    timestamp: "13:48 EST",
    eventType: "ai_summary_generated",
    title: "Algorithmic Information Organization Generated",
    description: "Organized multi-source clinical data from 4 historical records into structured narrative card.",
    source: "MedLens Organizing Pipeline v1.2",
    actor: "Automated System"
  },
  {
    id: "EVT-903",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    date: "2026-08-26",
    timestamp: "14:10 EST",
    eventType: "report_verified",
    title: "Laboratory Panel Verified",
    description: "Confirmed WBC, Platelets, and Creatinine values against source document. Flagged Ferritin and Hemoglobin for physician oversight.",
    source: "Verification Screen",
    actor: "Dr. Sarah Lin, MD"
  },
  {
    id: "EVT-904",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    date: "2026-08-26",
    timestamp: "14:22 EST",
    eventType: "record_edited",
    title: "Conflict Flag Created for Allergy Record",
    description: "System flagged discrepancy between St. Jude Admission record ('Penicillin Allergy') and Blood Requisition ('NKDA').",
    source: "Cross-Record Reconciliation Engine",
    actor: "Automated System"
  },
  {
    id: "EVT-905",
    patientId: "ML-1042",
    patientName: "Eleanor Vance",
    date: "2026-08-28",
    timestamp: "10:15 EST",
    eventType: "patient_updated",
    title: "Patient Demographic and Symptom Notes Updated",
    description: "Added cold sensitivity and exertional fatigue reported during routine telemedicine check-in.",
    source: "Clinical Chart Update",
    actor: "Dr. Sarah Lin, MD"
  },
  {
    id: "EVT-906",
    patientId: "ML-1043",
    patientName: "Marcus Chen",
    date: "2026-09-01",
    timestamp: "09:12 EST",
    eventType: "report_uploaded",
    title: "Annual Lipid Profile Uploaded",
    description: "Annual_Lipid_Panel_Sep01.pdf ingested and verified with 0 conflicts detected.",
    source: "Upload System",
    actor: "Clinical Assistant T. Rogers"
  },
  {
    id: "EVT-907",
    patientId: "ML-1044",
    patientName: "Sophia Rodriguez",
    date: "2026-09-03",
    timestamp: "15:55 EST",
    eventType: "report_uploaded",
    title: "Endocrine Thyroid Screen Uploaded",
    description: "Endocrine_Thyroid_Screen_Sep03.jpg scanned from paper printout. Queued for human verification.",
    source: "Mobile Scan Capture",
    actor: "Reception Intake Staff"
  }
];