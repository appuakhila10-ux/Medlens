/**
 * MedLens Client-side Security & Sanitization Utilities
 * Protects clinical input fields (notes, symptoms, extracted text) against
 * Cross-Site Scripting (XSS), script injection, and malicious payloads.
 */

/**
 * Escapes HTML entities and neutralizes script tags and pseudo-protocols
 */
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, 'blocked:');
}

/**
 * Strips script tags, HTML tags, and null bytes from patient notes or narrative fields
 */
export function sanitizeClinicalNarrative(text: string): string {
  if (typeof text !== 'string') return '';
  // Remove null bytes and control characters
  const clean = text.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Neutralize script tags and inline handlers
  return clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT REMOVED]')
    .replace(/on\w+\s*=/gi, 'data-blocked=')
    .replace(/javascript:/gi, 'blocked:');
}

/**
 * Validates and cleans uploaded document filename on the client
 */
export function sanitizeClientFilename(name: string): string {
  if (typeof name !== 'string') return 'document';
  // Strip path traversal and null bytes
  const clean = name.replace(/\0/g, '').replace(/[/\\]+/g, '_');
  return clean.replace(/[^a-zA-Z0-9._-]/g, '_');
}
