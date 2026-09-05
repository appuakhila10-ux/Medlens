import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

// Security utilities matching MedLens security layer
function sanitizeFilename(filename) {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function validateFileExtension(filename) {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.txt'];
  const ext = path.extname(filename).toLowerCase();
  return allowed.includes(ext);
}

function validateMagicBytes(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!buffer || buffer.length < 4) return false;

  // PDF check: starts with %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (ext === '.pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // PNG check: starts with 0x89 0x50 0x4E 0x47
  if (ext === '.png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }

  // JPEG check: starts with 0xFF 0xD8 0xFF
  if (ext === '.jpg' || ext === '.jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }

  if (ext === '.txt') {
    return true;
  }

  return false;
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

class SimpleRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map();
  }

  isAllowed(ip, now = Date.now()) {
    const record = this.hits.get(ip) || [];
    const recent = record.filter(time => now - time < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(ip, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(ip, recent);
    return true;
  }
}

describe('Security Layer & Defensive Controls', () => {
  it('neutralizes directory path traversal in uploaded filenames', () => {
    assert.strictEqual(sanitizeFilename('../../etc/passwd'), 'passwd');
    assert.strictEqual(sanitizeFilename('../..\\windows\\system32\\cmd.exe'), 'cmd.exe');
    assert.strictEqual(sanitizeFilename('normal_report.pdf'), 'normal_report.pdf');
    assert.strictEqual(sanitizeFilename('report with spaces and @!#.png'), 'report_with_spaces_and____.png');
  });

  it('validates allowed document extensions and rejects dangerous ones', () => {
    assert.strictEqual(validateFileExtension('lab_panel.pdf'), true);
    assert.strictEqual(validateFileExtension('scan.png'), true);
    assert.strictEqual(validateFileExtension('photo.jpg'), true);
    assert.strictEqual(validateFileExtension('notes.txt'), true);

    assert.strictEqual(validateFileExtension('malware.exe'), false);
    assert.strictEqual(validateFileExtension('exploit.sh'), false);
    assert.strictEqual(validateFileExtension('script.bat'), false);
    assert.strictEqual(validateFileExtension('payload.js'), false);
    assert.strictEqual(validateFileExtension('shell.php'), false);
  });

  it('validates file magic bytes for PDFs and images', () => {
    // Valid PDF buffer: %PDF-1.4
    const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');
    assert.strictEqual(validateMagicBytes(validPdfBuffer, 'test.pdf'), true);

    // Fake PDF buffer containing executable/shell script
    const fakePdfBuffer = Buffer.from('#!/bin/bash echo malicious');
    assert.strictEqual(validateMagicBytes(fakePdfBuffer, 'test.pdf'), false);

    // Valid PNG buffer
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    assert.strictEqual(validateMagicBytes(validPngBuffer, 'scan.png'), true);

    // Valid JPEG buffer
    const validJpgBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    assert.strictEqual(validateMagicBytes(validJpgBuffer, 'image.jpg'), true);
  });

  it('rate limiter enforces request thresholds within window', () => {
    const limiter = new SimpleRateLimiter(3, 1000); // 3 requests per second
    const ip = '192.168.1.10';
    const now = 1000000;

    assert.strictEqual(limiter.isAllowed(ip, now), true);
    assert.strictEqual(limiter.isAllowed(ip, now + 100), true);
    assert.strictEqual(limiter.isAllowed(ip, now + 200), true);
    assert.strictEqual(limiter.isAllowed(ip, now + 300), false, '4th request must be blocked');

    // After window expires
    assert.strictEqual(limiter.isAllowed(ip, now + 1500), true, 'Request should be allowed after window reset');
  });

  it('sanitizes user input and OCR text against XSS injection', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert.strictEqual(sanitized.includes('<script>'), false);
  });
});