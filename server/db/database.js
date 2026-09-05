/**
 * MedLens SQLite Database Connection & Initialization
 * Uses better-sqlite3 for synchronous, high-performance embedded database operations.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { seedDatabase } = require('./seed');

let dbInstance = null;

function initDatabase(customPath) {
  const dbPath = customPath || process.env.DB_PATH || path.join(__dirname, '../data/medlens.sqlite');
  
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Seed if newly initialized
  seedDatabase(db);

  dbInstance = db;
  return db;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

// Format SQLite row back to Patient TypeScript interface
function formatPatientRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    sex: row.sex,
    dob: row.dob || undefined,
    mrn: row.mrn || undefined,
    symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
    conditions: row.conditions ? JSON.parse(row.conditions) : [],
    allergies: row.allergies ? JSON.parse(row.allergies) : [],
    medications: row.medications ? JSON.parse(row.medications) : [],
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastReportDate: row.last_report_date || undefined,
    verificationStatus: row.verification_status || 'pending',
    reportCount: row.report_count || 0,
    conflictCount: row.conflict_count || 0,
    aiSummary: row.ai_summary ? JSON.parse(row.ai_summary) : undefined
  };
}

// Format SQLite row back to MedicalReport TypeScript interface
function formatReportRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    patientId: row.patient_id,
    fileName: row.file_name || undefined,
    fileType: row.file_type,
    fileSize: row.file_size || undefined,
    reportDate: row.report_date || undefined,
    uploadDate: row.upload_date,
    extractedText: row.extracted_text || undefined,
    processingStatus: row.processing_status,
    verificationStatus: row.verification_status || undefined,
    source: row.source || undefined,
    extractedEntitiesCount: row.extracted_entities_count || 0,
    patientName: row.patient_name || undefined,
    sourceFacility: row.source_facility || undefined,
    reportName: row.report_name || undefined,
    date: row.date || undefined,
    reportType: row.report_type || undefined,
    extractionConfidence: row.extraction_confidence !== null ? row.extraction_confidence : undefined
  };
}

// Format SQLite row back to MedicalTest TypeScript interface
function formatTestRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    reportId: row.report_id || undefined,
    patientId: row.patient_id,
    testName: row.test_name,
    value: row.value,
    numericValue: row.numeric_value !== null ? row.numeric_value : undefined,
    unit: row.unit || '',
    referenceRange: row.reference_range || '',
    status: row.status,
    date: row.date,
    observation: row.observation || undefined,
    source: row.source || 'Extracted from report',
    confidence: row.confidence !== null ? row.confidence : undefined,
    verified: Boolean(row.verified)
  };
}

// Format SQLite row back to ClinicalConflict TypeScript interface
function formatConflictRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name || '',
    category: row.category,
    title: row.title,
    description: row.description || '',
    source1: row.source1 ? JSON.parse(row.source1) : { name: '', date: '', claim: '', type: '' },
    source2: row.source2 ? JSON.parse(row.source2) : { name: '', date: '', claim: '', type: '' },
    detectedDate: row.detected_date,
    status: row.status,
    resolutionNotes: row.resolution_notes || undefined
  };
}

module.exports = {
  initDatabase,
  getDb,
  formatPatientRow,
  formatReportRow,
  formatTestRow,
  formatConflictRow
};
