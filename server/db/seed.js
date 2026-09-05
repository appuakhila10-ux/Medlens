/**
 * MedLens Database Seeding Script
 * Migrated from mock constants into a relational database seeding module.
 */

const INITIAL_PATIENTS = [
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

const INITIAL_REPORTS = [
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

const INITIAL_TESTS = [
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

const INITIAL_CONFLICTS = [
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

/**
 * Seed SQLite database if empty
 */
function seedDatabase(db) {
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
  if (patientCount > 0) {
    return false; // Already seeded
  }

  const insertPatient = db.prepare(`
    INSERT INTO patients (
      id, name, age, sex, dob, mrn, symptoms, conditions,
      allergies, medications, notes, created_at, updated_at,
      last_report_date, verification_status, report_count, conflict_count, ai_summary
    ) VALUES (
      @id, @name, @age, @sex, @dob, @mrn, @symptoms, @conditions,
      @allergies, @medications, @notes, @createdAt, @updatedAt,
      @lastReportDate, @verificationStatus, @reportCount, @conflictCount, @aiSummary
    )
  `);

  const insertReport = db.prepare(`
    INSERT INTO reports (
      id, patient_id, file_name, file_type, file_size, report_date,
      upload_date, extracted_text, processing_status, verification_status,
      source, extracted_entities_count, patient_name, source_facility,
      report_name, date, report_type, extraction_confidence
    ) VALUES (
      @id, @patientId, @fileName, @fileType, @fileSize, @reportDate,
      @uploadDate, @extractedText, @processingStatus, @verificationStatus,
      @source, @extractedEntitiesCount, @patientName, @sourceFacility,
      @reportName, @date, @reportType, @extractionConfidence
    )
  `);

  const insertTest = db.prepare(`
    INSERT INTO medical_tests (
      id, report_id, patient_id, test_name, value, numeric_value,
      unit, reference_range, status, date, observation, source,
      confidence, verified
    ) VALUES (
      @id, @reportId, @patientId, @testName, @value, @numericValue,
      @unit, @referenceRange, @status, @date, @observation, @source,
      @confidence, @verified
    )
  `);

  const insertConflict = db.prepare(`
    INSERT INTO clinical_conflicts (
      id, patient_id, patient_name, category, title, description,
      source1, source2, detected_date, status, resolution_notes
    ) VALUES (
      @id, @patientId, @patientName, @category, @title, @description,
      @source1, @source2, @detectedDate, @status, @resolutionNotes
    )
  `);

  const seedTx = db.transaction(() => {
    // 1. Seed Patients
    for (const p of INITIAL_PATIENTS) {
      insertPatient.run({
        id: p.id,
        name: p.name,
        age: p.age ?? null,
        sex: p.sex ?? null,
        dob: p.dob ?? null,
        mrn: p.mrn ?? null,
        symptoms: JSON.stringify(p.symptoms || []),
        conditions: JSON.stringify(p.conditions || []),
        allergies: JSON.stringify(p.allergies || []),
        medications: JSON.stringify(p.medications || []),
        notes: p.notes ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        lastReportDate: p.lastReportDate ?? null,
        verificationStatus: p.verificationStatus ?? 'pending',
        reportCount: p.reportCount ?? 0,
        conflictCount: p.conflictCount ?? 0,
        aiSummary: p.aiSummary ? JSON.stringify(p.aiSummary) : null
      });
    }

    // 2. Seed Reports
    for (const r of INITIAL_REPORTS) {
      insertReport.run({
        id: r.id,
        patientId: r.patientId,
        fileName: r.fileName ?? null,
        fileType: r.fileType || 'PDF',
        fileSize: r.fileSize ?? null,
        reportDate: r.reportDate ?? null,
        uploadDate: r.uploadDate,
        extractedText: r.extractedText ?? null,
        processingStatus: r.processingStatus || 'Completed',
        verificationStatus: r.verificationStatus || 'verified',
        source: r.source ?? null,
        extractedEntitiesCount: r.extractedEntitiesCount ?? 0,
        patientName: r.patientName ?? null,
        sourceFacility: r.sourceFacility ?? null,
        reportName: r.reportName ?? r.fileName ?? null,
        date: r.date ?? r.reportDate ?? null,
        reportType: r.reportType || 'Clinical Laboratory Panel',
        extractionConfidence: r.extractionConfidence ?? 0.95
      });
    }

    // 3. Seed Tests
    for (const t of INITIAL_TESTS) {
      insertTest.run({
        id: t.id,
        reportId: t.reportId ?? null,
        patientId: t.patientId,
        testName: t.testName,
        value: t.value,
        numericValue: t.numericValue !== undefined ? t.numericValue : (parseFloat(t.value) || null),
        unit: t.unit || '',
        referenceRange: t.referenceRange || '',
        status: t.status,
        date: t.date,
        observation: t.observation ?? null,
        source: t.source || 'Extracted from report',
        confidence: t.confidence ?? 0.95,
        verified: t.verified ? 1 : 0
      });
    }

    // 4. Seed Conflicts
    for (const c of INITIAL_CONFLICTS) {
      insertConflict.run({
        id: c.id,
        patientId: c.patientId,
        patientName: c.patientName ?? null,
        category: c.category,
        title: c.title,
        description: c.description ?? null,
        source1: JSON.stringify(c.source1 || {}),
        source2: JSON.stringify(c.source2 || {}),
        detectedDate: c.detectedDate,
        status: c.status || 'active',
        resolutionNotes: c.resolutionNotes ?? null
      });
    }
  });

  seedTx();
  return true;
}

module.exports = {
  INITIAL_PATIENTS,
  INITIAL_REPORTS,
  INITIAL_TESTS,
  INITIAL_CONFLICTS,
  seedDatabase
};
