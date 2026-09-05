/**
 * MedLens Data Storage Layer
 * Backed by Express REST API and SQLite embedded database.
 * Replaces browser localStorage with real backend persistence.
 */

import { Patient, MedicalTest, MedicalReport, ClinicalConflict } from '../types/clinical';

const API_BASE = typeof window !== 'undefined' 
  ? '' 
  : ((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.TEST_API_URL) || 'http://127.0.0.1:3001');

// In-memory cache for synchronous React component lifecycle rendering
let cachedPatients: Patient[] = [];
let cachedReports: MedicalReport[] = [];
let cachedTests: MedicalTest[] = [];
let cachedConflicts: ClinicalConflict[] = [];
let isInitialized = false;

export const DEFAULT_INITIAL_PATIENTS: Patient[] = [];
export const DEFAULT_INITIAL_REPORTS: MedicalReport[] = [];
export const DEFAULT_INITIAL_TESTS: MedicalTest[] = [];

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
      cachedPatients = data;
      return data;
    }
  } catch (err) {
    console.warn('[MedLens Storage] Unable to fetch patients from backend:', err);
  }
  return cachedPatients;
}

export async function fetchReportsAsync(): Promise<MedicalReport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/reports`);
    if (res.ok) {
      const data = await res.json();
      cachedReports = data;
      return data;
    }
  } catch (err) {
    console.warn('[MedLens Storage] Unable to fetch reports from backend:', err);
  }
  return cachedReports;
}

export async function fetchTestsAsync(): Promise<MedicalTest[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tests`);
    if (res.ok) {
      const data = await res.json();
      cachedTests = data;
      return data;
    }
  } catch (err) {
    console.warn('[MedLens Storage] Unable to fetch tests from backend:', err);
  }
  return cachedTests;
}

export async function fetchConflictsAsync(): Promise<ClinicalConflict[]> {
  try {
    const res = await fetch(`${API_BASE}/api/conflicts`);
    if (res.ok) {
      const data = await res.json();
      cachedConflicts = data;
      return data;
    }
  } catch (err) {
    console.warn('[MedLens Storage] Unable to fetch conflicts from backend:', err);
  }
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
    fetchPatientsAsync().catch(() => {});
  }
  return [...cachedPatients];
}

export function saveStoredPatients(patients: Patient[]): void {
  cachedPatients = [...patients];
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

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPatient)
  }).then(async (res) => {
    if (res.ok) {
      const serverPatient = await res.json();
      const idx = cachedPatients.findIndex(p => p.id === newId);
      if (idx !== -1) cachedPatients[idx] = serverPatient;
    }
  }).catch(err => {
    console.error('[MedLens Storage] Failed to persist patient to SQLite:', err);
  });

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

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(err => {
    console.error('[MedLens Storage] Failed to persist patient update to SQLite:', err);
  });

  return updatedPatient;
}

export function deleteStoredPatient(id: string): boolean {
  const prevLength = cachedPatients.length;
  cachedPatients = cachedPatients.filter(p => p.id !== id);
  const deleted = cachedPatients.length < prevLength;

  if (deleted) {
    fetch(`${API_BASE}/api/patients/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(err => {
      console.error('[MedLens Storage] Failed to delete patient from SQLite:', err);
    });
  }

  return deleted;
}

// ---------------- Reports Storage ----------------

export function getStoredReports(): MedicalReport[] {
  if (cachedReports.length === 0) {
    fetchReportsAsync().catch(() => {});
  }
  return [...cachedReports];
}

export function saveStoredReports(reports: MedicalReport[]): void {
  cachedReports = [...reports];
}

export function getStoredReportsByPatient(patientId: string): MedicalReport[] {
  return getStoredReports().filter(r => r.patientId === patientId);
}

export function createStoredReport(report: MedicalReport): void {
  cachedReports = [report, ...cachedReports.filter(r => r.id !== report.id)];

  // Update patient cache
  const patient = cachedPatients.find(p => p.id === report.patientId);
  if (patient) {
    patient.reportCount = (patient.reportCount || 0) + 1;
    patient.lastReportDate = report.reportDate || patient.lastReportDate;
    patient.verificationStatus = 'verified';
  }

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  }).catch(err => {
    console.error('[MedLens Storage] Failed to persist report to SQLite:', err);
  });
}

// ---------------- Medical Tests Storage ----------------

export function getStoredMedicalTests(): MedicalTest[] {
  if (cachedTests.length === 0) {
    fetchTestsAsync().catch(() => {});
  }
  return [...cachedTests];
}

export function saveStoredMedicalTests(tests: MedicalTest[]): void {
  cachedTests = [...tests];
}

export function getStoredMedicalTestsByPatient(patientId: string): MedicalTest[] {
  return getStoredMedicalTests().filter(t => t.patientId === patientId);
}

export function createStoredMedicalTests(newTests: MedicalTest[]): void {
  cachedTests = [...newTests, ...cachedTests];

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTests)
  }).catch(err => {
    console.error('[MedLens Storage] Failed to persist tests to SQLite:', err);
  });
}

// ---------------- Clinical Conflicts Storage ----------------

export function getStoredConflicts(): ClinicalConflict[] {
  if (cachedConflicts.length === 0) {
    fetchConflictsAsync().catch(() => {});
  }
  return [...cachedConflicts];
}

export function saveStoredConflicts(conflicts: ClinicalConflict[]): void {
  cachedConflicts = [...conflicts];
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

  // Recalculate patient active conflict count
  const activeCount = cachedConflicts.filter(c => c.patientId === conflict.patientId && c.status === 'active').length;
  updateStoredPatient(conflict.patientId, { conflictCount: activeCount });

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/conflicts-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conflict)
  }).catch(err => {
    console.error('[MedLens Storage] Failed to persist conflict to SQLite:', err);
  });
}

export function updateStoredConflict(id: string, updates: Partial<ClinicalConflict>): ClinicalConflict | null {
  const idx = cachedConflicts.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const updatedConflict: ClinicalConflict = { ...cachedConflicts[idx], ...updates };
  cachedConflicts[idx] = updatedConflict;

  // Recalculate patient active conflict count
  const activeCount = cachedConflicts.filter(c => c.patientId === updatedConflict.patientId && c.status === 'active').length;
  updateStoredPatient(updatedConflict.patientId, { conflictCount: activeCount });

  // Persist to backend SQLite
  fetch(`${API_BASE}/api/conflicts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(err => {
    console.error('[MedLens Storage] Failed to update conflict in SQLite:', err);
  });

  return updatedConflict;
}