export type ProvenanceType =
  | 'USER_PROVIDED'
  | 'user_provided'
  | 'REPORT_EXTRACTED'
  | 'extracted_from_report'
  | 'AI_GENERATED'
  | 'ai_generated';

export type LabStatus = 'normal' | 'low' | 'high' | 'unavailable';

export type VerificationStatus = 'verified' | 'pending' | 'in_review' | 'rejected';

export type MedicalTestStatus = 'Normal' | 'Low' | 'High' | 'Range unavailable' | 'Not determined';

export interface MedicalTest {
  id: string;
  reportId?: string;
  patientId: string;
  testName: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: MedicalTestStatus;
  date: string;
  observation?: string;
  source: string; // e.g. "Extracted from report" or "User provided"
  confidence?: number;
  verified?: boolean;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  fileName?: string;
  fileType: string;
  fileSize?: string;
  reportDate?: string;
  uploadDate: string;
  extractedText?: string;
  processingStatus: 'Completed' | 'Pending Review' | 'Processing' | 'Failed';
  verificationStatus?: VerificationStatus;
  source?: string;
  extractedEntitiesCount: number;
  patientName?: string;
  sourceFacility?: string;
  reportName?: string;
  date?: string;
  reportType?: string;
  extractionConfidence?: number;
}

export interface PatientAISummary {
  text: string;
  generatedAt: string;
  recordsAnalyzedCount: number;
  isAvailable?: boolean;
  disclaimer: string;
}

export interface Patient {
  id: string; // e.g. "ML-1042"
  name: string;
  age: number;
  sex: 'Female' | 'Male' | 'Other';
  symptoms: string[];
  conditions: string[];
  allergies: string[];
  medications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Auxiliary fields for clinical tabs and backward compatibility
  mrn?: string;
  dob?: string;
  lastReportDate?: string;
  verificationStatus?: VerificationStatus;
  reportCount?: number;
  conflictCount?: number;
  aiSummary?: PatientAISummary;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: LabStatus;
  source: ProvenanceType;
  sourceDocument: string;
  sourceDate: string;
  category: 'Hematology' | 'Metabolic' | 'Lipid' | 'Thyroid' | 'Urinalysis' | 'Other';
  verificationStatus: VerificationStatus;
  confidence: number;
}

export interface ComparisonItem {
  testName: string;
  previousValue: string;
  currentValue: string;
  previousRange: string;
  currentRange: string;
  unit: string;
  delta: string;
  trend: 'increased' | 'decreased' | 'unchanged' | 'not_comparable';
  previousDate: string;
  currentDate: string;
}

export interface ClinicalConflict {
  id: string;
  patientId: string;
  patientName: string;
  category: 'Allergy' | 'Medication' | 'History' | 'Demographic';
  title: string;
  description: string;
  source1: {
    name: string;
    date: string;
    claim: string;
    type: string;
  };
  source2: {
    name: string;
    date: string;
    claim: string;
    type: string;
  };
  detectedDate: string;
  status: 'active' | 'resolved' | 'acknowledged';
  resolutionNotes?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  timestamp: string;
  eventType: 'patient_updated' | 'report_uploaded' | 'report_verified' | 'ai_summary_generated' | 'record_edited';
  title: string;
  description: string;
  source: string;
  actor: string;
}