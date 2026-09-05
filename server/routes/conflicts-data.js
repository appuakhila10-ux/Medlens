/**
 * Express REST Route: /api/conflicts-data (and mounted for conflict CRUD)
 * Backed by SQLite clinical_conflicts table with active conflict recalculation.
 */

const express = require('express');
const { getDb, formatConflictRow } = require('../db/database');
const { sanitizeInput } = require('../middleware/security');

const router = express.Router();

function updatePatientConflictCount(db, patientId) {
  if (!patientId) return;
  const activeCount = db.prepare(
    "SELECT COUNT(*) as count FROM clinical_conflicts WHERE patient_id = ? AND status = 'active'"
  ).get(patientId).count;

  db.prepare("UPDATE patients SET conflict_count = ? WHERE id = ?").run(activeCount, patientId);
}

// 1. GET /api/conflicts - List stored conflicts
router.get('/conflicts', (req, res) => {
  try {
    const db = getDb();
    const { patientId, status } = req.query;
    let rows;
    if (patientId && status) {
      rows = db.prepare('SELECT * FROM clinical_conflicts WHERE patient_id = ? AND status = ? ORDER BY detected_date DESC').all(patientId, status);
    } else if (patientId) {
      rows = db.prepare('SELECT * FROM clinical_conflicts WHERE patient_id = ? ORDER BY detected_date DESC').all(patientId);
    } else {
      rows = db.prepare('SELECT * FROM clinical_conflicts ORDER BY detected_date DESC').all();
    }
    res.json(rows.map(formatConflictRow));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve clinical conflicts.', details: err.message });
  }
});

// Alias: GET /api/conflicts-data
router.get('/conflicts-data', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM clinical_conflicts ORDER BY detected_date DESC').all();
    res.json(rows.map(formatConflictRow));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve clinical conflicts.', details: err.message });
  }
});

// 2. GET /api/conflicts/:id
router.get('/conflicts/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM clinical_conflicts WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: `Clinical conflict not found with ID ${req.params.id}` });
    }
    res.json(formatConflictRow(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve clinical conflict.', details: err.message });
  }
});

// Helper: Insert conflict with duplicate protection
function insertConflictRecord(db, body) {
  // Prevent duplicate active conflict with identical title and patient
  const existing = db.prepare(
    "SELECT id FROM clinical_conflicts WHERE patient_id = ? AND title = ? AND status = 'active'"
  ).get(body.patientId, body.title);

  if (existing) {
    return { duplicate: true, id: existing.id };
  }

  const conflictId = body.id || `CONF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const detectedDate = body.detectedDate || new Date().toISOString().replace('T', ' ').substring(0, 16);

  db.prepare(`
    INSERT INTO clinical_conflicts (
      id, patient_id, patient_name, category, title, description,
      source1, source2, detected_date, status, resolution_notes
    ) VALUES (
      @id, @patientId, @patientName, @category, @title, @description,
      @source1, @source2, @detectedDate, @status, @resolutionNotes
    )
  `).run({
    id: conflictId,
    patientId: body.patientId,
    patientName: body.patientName ? sanitizeInput(body.patientName) : '',
    category: body.category || 'History',
    title: sanitizeInput(body.title),
    description: body.description ? sanitizeInput(body.description) : '',
    source1: JSON.stringify(body.source1 || {}),
    source2: JSON.stringify(body.source2 || {}),
    detectedDate,
    status: body.status || 'active',
    resolutionNotes: body.resolutionNotes ? sanitizeInput(body.resolutionNotes) : null
  });

  updatePatientConflictCount(db, body.patientId);
  return { duplicate: false, id: conflictId };
}

// 3. POST /api/conflicts-data
router.post('/conflicts-data', (req, res) => {
  try {
    const db = getDb();
    const body = req.body;
    if (!body || !body.patientId || !body.title) {
      return res.status(400).json({ error: 'patientId and title are required for clinical conflicts.' });
    }

    const { id } = insertConflictRecord(db, body);
    const created = db.prepare('SELECT * FROM clinical_conflicts WHERE id = ?').get(id);
    res.status(201).json(formatConflictRow(created));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create clinical conflict.', details: err.message });
  }
});

// 4. PUT /api/conflicts/:id (e.g. resolve)
router.put('/conflicts/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM clinical_conflicts WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Clinical conflict not found with ID ${req.params.id}` });
    }

    const updates = req.body || {};
    db.prepare(`
      UPDATE clinical_conflicts SET
        status = COALESCE(@status, status),
        resolution_notes = COALESCE(@resolutionNotes, resolution_notes)
      WHERE id = @id
    `).run({
      id: req.params.id,
      status: updates.status || null,
      resolutionNotes: updates.resolutionNotes !== undefined ? sanitizeInput(updates.resolutionNotes) : null
    });

    updatePatientConflictCount(db, current.patient_id);

    const updated = db.prepare('SELECT * FROM clinical_conflicts WHERE id = ?').get(req.params.id);
    res.json(formatConflictRow(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update clinical conflict.', details: err.message });
  }
});

// 5. DELETE /api/conflicts/:id
router.delete('/conflicts/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM clinical_conflicts WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Clinical conflict not found with ID ${req.params.id}` });
    }

    db.prepare('DELETE FROM clinical_conflicts WHERE id = ?').run(req.params.id);
    updatePatientConflictCount(db, current.patient_id);

    res.json({ success: true, message: `Clinical conflict ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete clinical conflict.', details: err.message });
  }
});

module.exports = {
  router,
  insertConflictRecord,
  updatePatientConflictCount
};
