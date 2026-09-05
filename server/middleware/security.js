/**
 * MedLens Security Middleware & Defensive Controls
 * Implements:
 * 1. HTTP Security Headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
 * 2. Sliding-Window Rate Limiting for API protection
 * 3. Filename Sanitization against Directory Path Traversal
 * 4. File Extension and Magic Bytes Validation
 * 5. Input Sanitization against Cross-Site Scripting (XSS)
 */

const path = require('path');

// 1. Path traversal neutralization, null-byte stripping, and character restriction
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return 'unnamed_file';
  // Strip null bytes and ASCII control characters (0x00 - 0x1F, 0x7F)
  let clean = filename.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
  // Normalize backslashes to forward slashes for cross-platform compatibility
  clean = clean.replace(/\\/g, '/');
  // Strip directory path traversal sequences (e.g. ../, ..\)
  const base = path.basename(clean);
  // Restrict to safe characters: alphanumeric, dots, underscores, hyphens
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized || 'unnamed_file';
}

// 2. Extension whitelisting
function validateFileExtension(filename) {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.txt'];
  const ext = path.extname(filename).toLowerCase();
  return allowed.includes(ext);
}

// 3. File magic bytes validation
function validateMagicBytes(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!buffer || buffer.length < 4) return false;

  // PDF check: starts with %PDF- (0x25 0x50 0x44 0x46)
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

// 4. Input sanitization for XSS prevention (escapes HTML tags, scripts, pseudo-protocols)
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/data:/gi, 'blocked:');
}

// 5. In-Memory Sliding-Window Rate Limiter
class SimpleRateLimiter {
  constructor(limit = 60, windowMs = 60000) {
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

// 6. Express Middleware for HTTP Security Headers & Request Tracking
function securityHeaders(req, res, next) {
  const requestId = req.headers['x-request-id'] || `medlens-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  res.setHeader('X-Request-Id', requestId);
  req.requestId = requestId;

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' http://localhost:* http://127.0.0.1:* https://api.anthropic.com;"
  );
  res.removeHeader('X-Powered-By');
  next();
}

// 7. Express Middleware Factory for Rate Limiting
function rateLimiterMiddleware(options = {}) {
  const limit = options.limit || 60;
  const windowMs = options.windowMs || 60000;
  const limiter = new SimpleRateLimiter(limit, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!limiter.isAllowed(ip)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a moment before sending another clinical extraction request.'
      });
    }
    next();
  };
}

module.exports = {
  sanitizeFilename,
  validateFileExtension,
  validateMagicBytes,
  sanitizeInput,
  SimpleRateLimiter,
  securityHeaders,
  rateLimiterMiddleware
};
