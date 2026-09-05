/**
 * Express REST Route: /api/tests
 * Provides full CRUD operations for lab tests backed by SQLite.
 */

const express = require('express');
const { getDb, formatTestRow } = require('../db/database');
const { sanitizeInput } = require('../middleware/security');

const router = express.Router();

// 1. GET /api/tests - List tests (optional ?patientId=... &reportId=...)
router.get('/tests', (req, res) => {
  try {
    const db = getDb();
    const { patientId, reportId } = req.query;
    let rows;
    if (patientId && reportId) {
      rows = db.prepare('SELECT * FROM medical_tests WHERE patient_id = ? AND report_id = ? ORDER BY date DESC').all(patientId, reportId);
    } else if (patientId) {
      rows = db.prepare('SELECT * FROM medical_tests WHERE patient_id = ? ORDER BY date DESC').all(patientId);
    } else if (reportId) {
      rows = db.prepare('SELECT * FROM medical_tests WHERE report_id = ? ORDER BY date DESC').all(reportId);
    } else {
      rows = db.prepare('SELECT * FROM medical_tests ORDER BY date DESC').all();
    }
    res.json(rows.map(formatTestRow));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve medical tests.', details: err.message });
  }
});

// 2. GET /api/tests/:id - Retrieve single test
router.get('/tests/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM medical_tests WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: `Medical test not found with ID ${req.params.id}` });
    }
    res.json(formatTestRow(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve test.', details: err.message });
  }
});

// Helper to insert single test
function insertSingleTest(db, t) {
  const testId = t.id || `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const numericVal = t.numericValue !== undefined ? t.numericValue : (parseFloat(t.value) || null);

  db.prepare(`
    INSERT INTO medical_tests (
      id, report_id, patient_id, test_name, value, numeric_value,
      unit, reference_range, status, date, observation, source,
      confidence, verified
    ) VALUES (
      @id, @reportId, @patientId, @testName, @value, @numericValue,
      @unit, @referenceRange, @status, @date, @observation, @source,
      @confidence, @verified
    )
  `).run({
    id: testId,
    reportId: t.reportId || null,
    patientId: t.patientId,
    testName: sanitizeInput(t.testName),
    value: sanitizeInput(String(t.value)),
    numericValue: numericVal,
    unit: sanitizeInput(t.unit || ''),
    referenceRange: sanitizeInput(t.referenceRange || ''),
    status: t.status || 'Not determined',
    date: t.date || new Date().toISOString().split('T')[0],
    observation: t.observation ? sanitizeInput(t.observation) : null,
    source: t.source ? sanitizeInput(t.source) : 'Extracted from report',
    confidence: t.confidence !== undefined ? t.confidence : 0.95,
    verified: t.verified ? 1 : 0
  });

  return testId;
}

// 3. POST /api/tests - Create test(s) (supports single object or array)
router.post('/tests', (req, res) => {
  try {
    const db = getDb();
    const body = req.body;

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return res.status(400).json({ error: 'Empty tests array.' });
      }
      const createdIds = [];
      const insertMany = db.transaction((tests) => {
        for (const t of tests) {
          createdIds.push(insertSingleTest(db, t));
        }
      });
      insertMany(body);

      const placeholders = createdIds.map(() => '?').join(',');
      const rows = db.prepare(`SELECT * FROM medical_tests WHERE id IN (${placeholders})`).all(...createdIds);
      return res.status(201).json(rows.map(formatTestRow));
    }

    if (!body || !body.patientId || !body.testName) {
      return res.status(400).json({ error: 'patientId and testName are required.' });
    }

    const testId = insertSingleTest(db, body);
    const created = db.prepare('SELECT * FROM medical_tests WHERE id = ?').get(testId);
    res.status(201).json(formatTestRow(created));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create test.', details: err.message });
  }
});

// 4. PUT /api/tests/:id - Update test
router.put('/tests/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM medical_tests WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Medical test not found with ID ${req.params.id}` });
    }

    const updates = req.body || {};
    const numericVal = updates.numericValue !== undefined ? updates.numericValue : (updates.value ? parseFloat(updates.value) : current.numeric_value);

    db.prepare(`
      UPDATE medical_tests SET
        test_name = COALESCE(@testName, test_name),
        value = COALESCE(@value, value),
        numeric_value = @numericValue,
        unit = COALESCE(@unit, unit),
        reference_range = COALESCE(@referenceRange, reference_range),
        status = COALESCE(@status, status),
        observation = COALESCE(@observation, observation),
        verified = COALESCE(@verified, verified)
      WHERE id = @id
    `).run({
      id: req.params.id,
      testName: updates.testName ? sanitizeInput(updates.testName) : null,
      value: updates.value ? sanitizeInput(String(updates.value)) : null,
      numericValue: numericVal,
      unit: updates.unit !== undefined ? sanitizeInput(updates.unit) : null,
      referenceRange: updates.referenceRange !== undefined ? sanitizeInput(updates.referenceRange) : null,
      status: updates.status || null,
      observation: updates.observation !== undefined ? sanitizeInput(updates.observation) : null,
      verified: updates.verified !== undefined ? (updates.verified ? 1 : 0) : null
    });

    const updated = db.prepare('SELECT * FROM medical_tests WHERE id = ?').get(req.params.id);
    res.json(formatTestRow(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test.', details: err.message });
  }
});

// 5. DELETE /api/tests/:id - Delete test
router.delete('/tests/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT id FROM medical_tests WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Medical test not found with ID ${req.params.id}` });
    }

    db.prepare('DELETE FROM medical_tests WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Test ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test.', details: err.message });
  }
});

module.exports = router;
