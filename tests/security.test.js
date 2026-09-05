import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Import production security utilities directly from server/middleware/security.js
const require = createRequire(import.meta.url);
const {
  sanitizeFilename,
  validateFileExtension,
  validateMagicBytes,
  sanitizeInput,
  SimpleRateLimiter
} = require('../server/middleware/security.js');

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