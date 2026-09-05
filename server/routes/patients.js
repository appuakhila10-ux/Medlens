/**
 * Express REST Route: /api/patients
 * Provides full CRUD operations backed by the SQLite database.
 */

const express = require('express');
const { getDb, formatPatientRow } = require('../db/database');
const { sanitizeInput } = require('../middleware/security');

const router = express.Router();

function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 1. GET /api/patients - List all patients
router.get('/patients', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all();
    const formatted = rows.map(formatPatientRow);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve patients.', details: err.message });
  }
});

// 2. GET /api/patients/:id - Retrieve single patient
router.get('/patients/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: `Patient not found with ID ${req.params.id}` });
    }
    res.json(formatPatientRow(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve patient.', details: err.message });
  }
});

// 3. POST /api/patients - Create new patient
router.post('/patients', (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};
    
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ error: 'Patient name is required.' });
    }

    const timestamp = getCurrentTimestamp();
    const patientId = body.id || body.customId || `ML-${Math.floor(1000 + Math.random() * 9000)}`;
    const mrn = body.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`;

    const stmt = db.prepare(`
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

    stmt.run({
      id: patientId,
      name: sanitizeInput(body.name),
      age: body.age !== undefined ? parseInt(body.age, 10) : null,
      sex: body.sex || 'Other',
      dob: body.dob || null,
      mrn,
      symptoms: JSON.stringify(body.symptoms || []),
      conditions: JSON.stringify(body.conditions || []),
      allergies: JSON.stringify(body.allergies || []),
      medications: JSON.stringify(body.medications || []),
      notes: body.notes ? sanitizeInput(body.notes) : null,
      createdAt: body.createdAt || timestamp,
      updatedAt: timestamp,
      lastReportDate: body.lastReportDate || 'No reports yet',
      verificationStatus: body.verificationStatus || 'pending',
      reportCount: body.reportCount !== undefined ? body.reportCount : 0,
      conflictCount: body.conflictCount !== undefined ? body.conflictCount : 0,
      aiSummary: body.aiSummary ? JSON.stringify(body.aiSummary) : JSON.stringify({
        text: `Patient profile created via clinical intake for ${body.name}. Baseline records established. Pending diagnostic documentation.`,
        generatedAt: timestamp,
        recordsAnalyzedCount: 0,
        disclaimer: "This summary organizes available medical information and is not a medical diagnosis or treatment recommendation."
      })
    });

    const created = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    res.status(201).json(formatPatientRow(created));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient.', details: err.message });
  }
});

// 4. PUT /api/patients/:id - Update existing patient
router.put('/patients/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Patient not found with ID ${req.params.id}` });
    }

    const updates = req.body || {};
    const timestamp = getCurrentTimestamp();

    const name = updates.name !== undefined ? sanitizeInput(updates.name) : current.name;
    const age = updates.age !== undefined ? parseInt(updates.age, 10) : current.age;
    const sex = updates.sex !== undefined ? updates.sex : current.sex;
    const dob = updates.dob !== undefined ? updates.dob : current.dob;
    const mrn = updates.mrn !== undefined ? updates.mrn : current.mrn;
    const symptoms = updates.symptoms !== undefined ? JSON.stringify(updates.symptoms) : current.symptoms;
    const conditions = updates.conditions !== undefined ? JSON.stringify(updates.conditions) : current.conditions;
    const allergies = updates.allergies !== undefined ? JSON.stringify(updates.allergies) : current.allergies;
    const medications = updates.medications !== undefined ? JSON.stringify(updates.medications) : current.medications;
    const notes = updates.notes !== undefined ? sanitizeInput(updates.notes) : current.notes;
    const lastReportDate = updates.lastReportDate !== undefined ? updates.lastReportDate : current.last_report_date;
    const verificationStatus = updates.verificationStatus !== undefined ? updates.verificationStatus : current.verification_status;
    const reportCount = updates.reportCount !== undefined ? updates.reportCount : current.report_count;
    const conflictCount = updates.conflictCount !== undefined ? updates.conflictCount : current.conflict_count;
    const aiSummary = updates.aiSummary !== undefined ? JSON.stringify(updates.aiSummary) : current.ai_summary;

    db.prepare(`
      UPDATE patients SET
        name = @name,
        age = @age,
        sex = @sex,
        dob = @dob,
        mrn = @mrn,
        symptoms = @symptoms,
        conditions = @conditions,
        allergies = @allergies,
        medications = @medications,
        notes = @notes,
        updated_at = @updatedAt,
        last_report_date = @lastReportDate,
        verification_status = @verificationStatus,
        report_count = @reportCount,
        conflict_count = @conflictCount,
        ai_summary = @aiSummary
      WHERE id = @id
    `).run({
      id: req.params.id,
      name,
      age,
      sex,
      dob,
      mrn,
      symptoms,
      conditions,
      allergies,
      medications,
      notes,
      updatedAt: timestamp,
      lastReportDate,
      verificationStatus,
      reportCount,
      conflictCount,
      aiSummary
    });

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    res.json(formatPatientRow(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient.', details: err.message });
  }
});

// 5. DELETE /api/patients/:id - Delete patient
router.delete('/patients/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Patient not found with ID ${req.params.id}` });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Patient ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient.', details: err.message });
  }
});

module.exports = router;
