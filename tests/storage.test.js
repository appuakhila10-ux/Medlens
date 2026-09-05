import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock storage implementation matching MedLens storage contract
class MockClinicalStorage {
  constructor() {
    this.patients = [];
    this.conflicts = [];
    this.reports = [];
    this.tests = [];
  }

  createPatient(patient) {
    const newP = { ...patient, id: patient.id || `ML-${Date.now()}`, conflictCount: 0, reportCount: 0 };
    this.patients.push(newP);
    return newP;
  }

  getPatient(id) {
    return this.patients.find(p => p.id === id);
  }

  updatePatient(id, updates) {
    const p = this.getPatient(id);
    if (!p) return null;
    Object.assign(p, updates);
    return p;
  }

  deletePatient(id) {
    const idx = this.patients.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.patients.splice(idx, 1);
    return true;
  }

  createConflict(conflict) {
    const isDuplicate = this.conflicts.some(
      c => c.patientId === conflict.patientId && c.title === conflict.title && c.status === 'active'
    );
    if (isDuplicate) return;

    this.conflicts.push(conflict);
    const activeCount = this.conflicts.filter(c => c.patientId === conflict.patientId && c.status === 'active').length;
    this.updatePatient(conflict.patientId, { conflictCount: activeCount });
  }

  updateConflict(id, updates) {
    const c = this.conflicts.find(item => item.id === id);
    if (!c) return null;
    Object.assign(c, updates);
    const activeCount = this.conflicts.filter(item => item.patientId === c.patientId && item.status === 'active').length;
    this.updatePatient(c.patientId, { conflictCount: activeCount });
    return c;
  }
}

describe('Storage & State Management', () => {
  let storage;

  beforeEach(() => {
    storage = new MockClinicalStorage();
  });

  it('creates and retrieves a patient record', () => {
    const p = storage.createPatient({ name: 'Marcus Chen', age: 44, sex: 'Male' });
    assert.ok(p.id);
    assert.strictEqual(storage.getPatient(p.id).name, 'Marcus Chen');
  });

  it('updates a patient record', () => {
    const p = storage.createPatient({ name: 'Eleanor Vance', age: 58 });
    storage.updatePatient(p.id, { age: 59, notes: 'Annual wellness completed' });
    const updated = storage.getPatient(p.id);
    assert.strictEqual(updated.age, 59);
    assert.strictEqual(updated.notes, 'Annual wellness completed');
  });

  it('deletes a patient record', () => {
    const p = storage.createPatient({ name: 'Sophia Rodriguez' });
    assert.strictEqual(storage.deletePatient(p.id), true);
    assert.strictEqual(storage.getPatient(p.id), undefined);
  });

  it('creates a clinical conflict and updates patient conflictCount', () => {
    const p = storage.createPatient({ name: 'Eleanor Vance' });
    assert.strictEqual(p.conflictCount, 0);

    storage.createConflict({
      id: 'CONF-1',
      patientId: p.id,
      title: 'Penicillin contradiction',
      category: 'Allergy',
      status: 'active'
    });

    assert.strictEqual(storage.getPatient(p.id).conflictCount, 1);
  });

  it('prevents duplicate active conflicts from inflating conflictCount', () => {
    const p = storage.createPatient({ name: 'Eleanor Vance' });

    storage.createConflict({
      id: 'CONF-1',
      patientId: p.id,
      title: 'Penicillin contradiction',
      category: 'Allergy',
      status: 'active'
    });

    storage.createConflict({
      id: 'CONF-2',
      patientId: p.id,
      title: 'Penicillin contradiction',
      category: 'Allergy',
      status: 'active'
    });

    assert.strictEqual(storage.conflicts.length, 1, 'Duplicate active conflict should not be added');
    assert.strictEqual(storage.getPatient(p.id).conflictCount, 1);
  });

  it('resolving a conflict decrements active conflictCount', () => {
    const p = storage.createPatient({ name: 'Sophia Rodriguez' });

    storage.createConflict({
      id: 'CONF-1',
      patientId: p.id,
      title: 'Propranolol dosage discrepancy',
      status: 'active'
    });
    assert.strictEqual(storage.getPatient(p.id).conflictCount, 1);

    storage.updateConflict('CONF-1', {
      status: 'resolved',
      resolutionNotes: 'Verified 20mg TID with attending cardiologist'
    });

    assert.strictEqual(storage.getPatient(p.id).conflictCount, 0);
    assert.strictEqual(storage.conflicts[0].status, 'resolved');
  });
});