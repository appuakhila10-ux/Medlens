-- MedLens SQLite Database Schema
-- Defines relational tables mirroring src/types/clinical.ts interfaces

PRAGMA foreign_keys = ON;

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    sex TEXT CHECK(sex IN ('Female', 'Male', 'Other')),
    dob TEXT,
    mrn TEXT,
    symptoms TEXT, -- JSON array of strings
    conditions TEXT, -- JSON array of strings
    allergies TEXT, -- JSON array of strings
    medications TEXT, -- JSON array of strings
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_report_date TEXT,
    verification_status TEXT CHECK(verification_status IN ('verified', 'pending', 'in_review', 'rejected')),
    report_count INTEGER DEFAULT 0,
    conflict_count INTEGER DEFAULT 0,
    ai_summary TEXT -- JSON object (text, generatedAt, recordsAnalyzedCount, disclaimer)
);

-- 2. Medical Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    file_size TEXT,
    report_date TEXT,
    upload_date TEXT NOT NULL,
    extracted_text TEXT,
    processing_status TEXT CHECK(processing_status IN ('Completed', 'Pending Review', 'Processing', 'Failed')),
    verification_status TEXT CHECK(verification_status IN ('verified', 'pending', 'in_review', 'rejected')),
    source TEXT,
    extracted_entities_count INTEGER DEFAULT 0,
    patient_name TEXT,
    source_facility TEXT,
    report_name TEXT,
    date TEXT,
    report_type TEXT,
    extraction_confidence REAL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 3. Medical Tests Table
CREATE TABLE IF NOT EXISTS medical_tests (
    id TEXT PRIMARY KEY,
    report_id TEXT,
    patient_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    value TEXT NOT NULL,
    numeric_value REAL,
    unit TEXT,
    reference_range TEXT,
    status TEXT CHECK(status IN ('Normal', 'Low', 'High', 'Range unavailable', 'Not determined')),
    date TEXT NOT NULL,
    observation TEXT,
    source TEXT,
    confidence REAL,
    verified INTEGER DEFAULT 0, -- 1 for true, 0 for false
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
);

-- 4. Clinical Conflicts Table
CREATE TABLE IF NOT EXISTS clinical_conflicts (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT,
    category TEXT CHECK(category IN ('Allergy', 'Medication', 'History', 'Demographic')),
    title TEXT NOT NULL,
    description TEXT,
    source1 TEXT, -- JSON object { name, date, claim, type }
    source2 TEXT, -- JSON object { name, date, claim, type }
    detected_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('active', 'resolved', 'acknowledged')) DEFAULT 'active',
    resolution_notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Indices for rapid query access
CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_tests_patient ON medical_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_tests_report ON medical_tests(report_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_patient ON clinical_conflicts(patient_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON clinical_conflicts(status);
