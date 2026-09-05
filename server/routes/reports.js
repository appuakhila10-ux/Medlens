/**
 * Express REST Route: /api/reports
 * Provides full CRUD operations for medical reports backed by SQLite.
 */

const express = require('express');
const { getDb, formatReportRow } = require('../db/database');
const { sanitizeInput } = require('../middleware/security');

const router = express.Router();

// 1. GET /api/reports - List reports (optional ?patientId=...)
router.get('/reports', (req, res) => {
  try {
    const db = getDb();
    const { patientId } = req.query;
    let rows;
    if (patientId) {
      rows = db.prepare('SELECT * FROM reports WHERE patient_id = ? ORDER BY upload_date DESC').all(patientId);
    } else {
      rows = db.prepare('SELECT * FROM reports ORDER BY upload_date DESC').all();
    }
    res.json(rows.map(formatReportRow));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reports.', details: err.message });
  }
});

// 2. GET /api/reports/:id - Retrieve single report
router.get('/reports/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: `Report not found with ID ${req.params.id}` });
    }
    res.json(formatReportRow(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve report.', details: err.message });
  }
});

// 3. POST /api/reports - Create new report
router.post('/reports', (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    if (!body.patientId) {
      return res.status(400).json({ error: 'patientId is required for reports.' });
    }

    const reportId = body.id || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const uploadDate = body.uploadDate || new Date().toISOString().replace('T', ' ').substring(0, 16);

    const stmt = db.prepare(`
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

    stmt.run({
      id: reportId,
      patientId: body.patientId,
      fileName: body.fileName ? sanitizeInput(body.fileName) : null,
      fileType: body.fileType || 'PDF',
      fileSize: body.fileSize || null,
      reportDate: body.reportDate || null,
      uploadDate,
      extractedText: body.extractedText ? sanitizeInput(body.extractedText) : null,
      processingStatus: body.processingStatus || 'Completed',
      verificationStatus: body.verificationStatus || 'pending',
      source: body.source ? sanitizeInput(body.source) : null,
      extractedEntitiesCount: body.extractedEntitiesCount !== undefined ? body.extractedEntitiesCount : 0,
      patientName: body.patientName ? sanitizeInput(body.patientName) : null,
      sourceFacility: body.sourceFacility ? sanitizeInput(body.sourceFacility) : null,
      reportName: body.reportName ? sanitizeInput(body.reportName) : (body.fileName ? sanitizeInput(body.fileName) : null),
      date: body.date || body.reportDate || null,
      reportType: body.reportType ? sanitizeInput(body.reportType) : 'Clinical Laboratory Panel',
      extractionConfidence: body.extractionConfidence !== undefined ? body.extractionConfidence : 0.95
    });

    // Update patient report count & last report date
    db.prepare(`
      UPDATE patients 
      SET report_count = (SELECT COUNT(*) FROM reports WHERE patient_id = @pid),
          last_report_date = COALESCE(@rDate, last_report_date),
          updated_at = @upAt
      WHERE id = @pid
    `).run({
      pid: body.patientId,
      rDate: body.reportDate || null,
      upAt: uploadDate
    });

    const created = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
    res.status(201).json(formatReportRow(created));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create report.', details: err.message });
  }
});

// 4. PUT /api/reports/:id - Update report
router.put('/reports/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Report not found with ID ${req.params.id}` });
    }

    const updates = req.body || {};
    db.prepare(`
      UPDATE reports SET
        verification_status = COALESCE(@verificationStatus, verification_status),
        processing_status = COALESCE(@processingStatus, processing_status),
        extracted_text = COALESCE(@extractedText, extracted_text),
        report_date = COALESCE(@reportDate, report_date)
      WHERE id = @id
    `).run({
      id: req.params.id,
      verificationStatus: updates.verificationStatus,
      processingStatus: updates.processingStatus,
      extractedText: updates.extractedText ? sanitizeInput(updates.extractedText) : null,
      reportDate: updates.reportDate
    });

    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    res.json(formatReportRow(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report.', details: err.message });
  }
});

// 5. DELETE /api/reports/:id - Delete report
router.delete('/reports/:id', (req, res) => {
  try {
    const db = getDb();
    const current = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: `Report not found with ID ${req.params.id}` });
    }

    db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);

    // Update patient count
    db.prepare(`
      UPDATE patients 
      SET report_count = (SELECT COUNT(*) FROM reports WHERE patient_id = ?)
      WHERE id = ?
    `).run(current.patient_id, current.patient_id);

    res.json({ success: true, message: `Report ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report.', details: err.message });
  }
});

module.exports = router;
