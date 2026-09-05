import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../server/index.js');

describe('Backend Express API Endpoints & Transport Security', () => {
  let server;
  let baseUrl;

  before(async () => {
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

  it('GET /api/health returns 200 OK with clinical service status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.service, 'MedLens Clinical Intelligence Extraction API');
    assert.strictEqual(typeof data.anthropicConfigured, 'boolean');
    assert.ok(data.timestamp);
  });

  it('GET /api/health enforces protective security headers and request correlation ID', async () => {
    const res = await fetch(`${baseUrl}/api/health`);

    // Verify defensive security headers
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('x-xss-protection'), '1; mode=block');
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('content-security-policy'), 'CSP header must be set');
    assert.ok(res.headers.get('content-security-policy').includes("default-src 'self'"));

    // Verify audit traceability
    const requestId = res.headers.get('x-request-id');
    assert.ok(requestId, 'X-Request-Id header must be present');
    assert.ok(requestId.startsWith('medlens-'));

    // Verify technology fingerprint suppression
    assert.strictEqual(res.headers.get('x-powered-by'), null, 'X-Powered-By must be disabled');
  });

  it('POST /api/extract returns 400 Bad Request when file is missing', async () => {
    const res = await fetch(`${baseUrl}/api/extract`, {
      method: 'POST',
      body: new FormData()
    });
    assert.strictEqual(res.status, 400);

    const data = await res.json();
    assert.strictEqual(data.error, 'No file uploaded.');
  });

  it('POST /api/summarize returns 503 or error response when ANTHROPIC_API_KEY is not configured', async () => {
    const res = await fetch(`${baseUrl}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient: { name: 'Test Patient', id: 'TEST-1' },
        tests: []
      })
    });

    // In an environment without key, it returns 503 Service Unavailable
    if (!process.env.ANTHROPIC_API_KEY) {
      assert.strictEqual(res.status, 503);
      const data = await res.json();
      assert.ok(data.error.includes('ANTHROPIC_API_KEY'));
    } else {
      assert.ok([200, 502, 503].includes(res.status));
    }
  });

  it('POST /api/conflicts returns 503 or error response when ANTHROPIC_API_KEY is not configured', async () => {
    const res = await fetch(`${baseUrl}/api/conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient: { name: 'Test Patient', id: 'TEST-1' }
      })
    });

    if (!process.env.ANTHROPIC_API_KEY) {
      assert.strictEqual(res.status, 503);
      const data = await res.json();
      assert.ok(data.error.includes('ANTHROPIC_API_KEY'));
    } else {
      assert.ok([200, 502, 503].includes(res.status));
    }
  });

  it('error responses in production environment do not leak rawResponse', async () => {
    const origEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      // Attempt extract with malformed/missing payload to verify structure
      const res = await fetch(`${baseUrl}/api/extract`, {
        method: 'POST',
        body: new FormData()
      });
      const data = await res.json();
      assert.strictEqual(data.rawResponse, undefined, 'rawResponse must not be leaked in production');
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });
});
