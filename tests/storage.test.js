import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../server/index.js');
const { getDb } = require('../server/db/database.js');

describe('SQLite Relational Backend & Data Access Layer', () => {
  let server;
  let baseUrl;
  let db;

  before(async () => {
    db = getDb();
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('creates and retrieves a patient record from SQLite', async () => {
    const uniqueId = `ML-TEST-${Date.now()}`;
    const createRes = await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: uniqueId,
        name: 'Marcus Chen Test',
        age: 44,
        sex: 'Male',
        symptoms: ['Knee stiffness'],
        conditions: ['Hypercholesterolemia']
      })
    });
    assert.strictEqual(createRes.status, 201);
    const created = await createRes.json();
    assert.strictEqual(created.id, uniqueId);
    assert.strictEqual(created.name, 'Marcus Chen Test');

    // Retrieve via GET endpoint
    const getRes = await fetch(`${baseUrl}/api/patients/${uniqueId}`);
    assert.strictEqual(getRes.status, 200);
    const fetched = await getRes.json();
    assert.strictEqual(fetched.name, 'Marcus Chen Test');
    assert.strictEqual(fetched.age, 44);
    assert.deepStrictEqual(fetched.symptoms, ['Knee stiffness']);
  });

  it('updates a patient record in SQLite', async () => {
    const uniqueId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: uniqueId,
        name: 'Eleanor Vance Test',
        age: 58
      })
    });

    const updateRes = await fetch(`${baseUrl}/api/patients/${uniqueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: 59,
        notes: 'Annual wellness completed'
      })
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.strictEqual(updated.age, 59);
    assert.strictEqual(updated.notes, 'Annual wellness completed');
  });

  it('deletes a patient record from SQLite', async () => {
    const uniqueId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: uniqueId, name: 'Sophia Rodriguez Test' })
    });

    const delRes = await fetch(`${baseUrl}/api/patients/${uniqueId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(delRes.status, 200);

    const getRes = await fetch(`${baseUrl}/api/patients/${uniqueId}`);
    assert.strictEqual(getRes.status, 404);
  });

  it('creates reports and medical tests associated with a patient', async () => {
    const patientId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: patientId, name: 'Report Test Patient' })
    });

    const reportId = `REP-TEST-${Date.now()}`;
    const reportRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reportId,
        patientId,
        fileName: 'Metabolic_Panel.pdf',
        fileType: 'PDF',
        reportDate: '2026-08-26',
        extractedEntitiesCount: 2
      })
    });
    assert.strictEqual(reportRes.status, 201);

    // Batch insert tests
    const testsRes = await fetch(`${baseUrl}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          reportId,
          patientId,
          testName: 'Fasting Glucose',
          value: '138',
          unit: 'mg/dL',
          referenceRange: '70 – 99 mg/dL',
          status: 'High'
        },
        {
          reportId,
          patientId,
          testName: 'Creatinine',
          value: '0.88',
          unit: 'mg/dL',
          referenceRange: '0.59 – 1.04 mg/dL',
          status: 'Normal'
        }
      ])
    });
    assert.strictEqual(testsRes.status, 201);
    const testsData = await testsRes.json();
    assert.strictEqual(testsData.length, 2);

    // Query tests by patient
    const queryRes = await fetch(`${baseUrl}/api/tests?patientId=${patientId}`);
    assert.strictEqual(queryRes.status, 200);
    const patientTests = await queryRes.json();
    assert.strictEqual(patientTests.length, 2);
  });

  it('creates a clinical conflict and updates patient conflictCount', async () => {
    const patientId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: patientId, name: 'Conflict Patient Test' })
    });

    const conflictId = `CONF-TEST-${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/conflicts-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: conflictId,
        patientId,
        title: 'Penicillin contradiction',
        category: 'Allergy',
        status: 'active'
      })
    });
    assert.strictEqual(res.status, 201);

    const patientRes = await fetch(`${baseUrl}/api/patients/${patientId}`);
    const patient = await patientRes.json();
    assert.strictEqual(patient.conflictCount, 1);
  });

  it('prevents duplicate active conflicts from inflating conflictCount', async () => {
    const patientId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: patientId, name: 'Duplicate Conflict Patient' })
    });

    // Insert first conflict
    await fetch(`${baseUrl}/api/conflicts-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        title: 'Penicillin contradiction',
        category: 'Allergy',
        status: 'active'
      })
    });

    // Attempt insert duplicate conflict
    await fetch(`${baseUrl}/api/conflicts-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        title: 'Penicillin contradiction',
        category: 'Allergy',
        status: 'active'
      })
    });

    const patientRes = await fetch(`${baseUrl}/api/patients/${patientId}`);
    const patient = await patientRes.json();
    assert.strictEqual(patient.conflictCount, 1, 'conflictCount should remain 1');
  });

  it('resolving a conflict decrements active conflictCount in SQLite', async () => {
    const patientId = `ML-TEST-${Date.now()}`;
    await fetch(`${baseUrl}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: patientId, name: 'Resolution Patient Test' })
    });

    const conflictId = `CONF-RES-${Date.now()}`;
    await fetch(`${baseUrl}/api/conflicts-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: conflictId,
        patientId,
        title: 'Propranolol dosage discrepancy',
        category: 'Medication',
        status: 'active'
      })
    });

    // Resolve conflict
    const updateRes = await fetch(`${baseUrl}/api/conflicts/${conflictId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'resolved',
        resolutionNotes: 'Verified 20mg TID with attending physician'
      })
    });
    assert.strictEqual(updateRes.status, 200);

    const patientRes = await fetch(`${baseUrl}/api/patients/${patientId}`);
    const patient = await patientRes.json();
    assert.strictEqual(patient.conflictCount, 0, 'Active conflict count should decrement to 0 upon resolution');
  });
});