import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function calculateStatusFromRange(valueStr, rangeStr) {
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.toLowerCase().includes('unavailable') || rangeStr.trim() === '-') {
    return 'Range unavailable';
  }

  const numVal = parseFloat(String(valueStr).replace(/[^\d.-]/g, ''));
  if (isNaN(numVal)) {
    return 'Not determined';
  }

  // Less than "< X"
  const lessMatch = rangeStr.match(/<\s*([\d.]+)/);
  if (lessMatch) {
    const max = parseFloat(lessMatch[1]);
    return numVal <= max ? 'Normal' : 'High';
  }

  // Greater than "> X"
  const greaterMatch = rangeStr.match(/>\s*([\d.]+)/);
  if (greaterMatch) {
    const min = parseFloat(greaterMatch[1]);
    return numVal >= min ? 'Normal' : 'Low';
  }

  // Interval "X - Y" or "X – Y" or "X to Y"
  const rangeMatch = rangeStr.match(/([\d.]+)\s*(?:–|-|to)\s*([\d.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (numVal < min) return 'Low';
    if (numVal > max) return 'High';
    return 'Normal';
  }

  return 'Not determined';
}

describe('Biomarker Extraction & Status Calculation', () => {
  it('correctly calculates Low status below reference interval', () => {
    const status = calculateStatusFromRange('10.2', '12.0 – 16.0 g/dL');
    assert.strictEqual(status, 'Low');
  });

  it('correctly calculates Normal status within reference interval', () => {
    const status = calculateStatusFromRange('14.5', '12.0 – 16.0 g/dL');
    assert.strictEqual(status, 'Normal');
  });

  it('correctly calculates High status above reference interval', () => {
    const status = calculateStatusFromRange('18.2', '12.0 – 16.0 g/dL');
    assert.strictEqual(status, 'High');
  });

  it('correctly handles less-than "< X" upper bound constraints', () => {
    assert.strictEqual(calculateStatusFromRange('150', '< 200 mg/dL'), 'Normal');
    assert.strictEqual(calculateStatusFromRange('240', '< 200 mg/dL'), 'High');
  });

  it('correctly handles greater-than "> X" lower bound constraints', () => {
    assert.strictEqual(calculateStatusFromRange('82', '> 60 mL/min/1.73m2'), 'Normal');
    assert.strictEqual(calculateStatusFromRange('45', '> 60 mL/min/1.73m2'), 'Low');
  });

  it('returns "Range unavailable" when reference range is absent or explicit unavailable', () => {
    assert.strictEqual(calculateStatusFromRange('14', ''), 'Range unavailable');
    assert.strictEqual(calculateStatusFromRange('14', '-'), 'Range unavailable');
    assert.strictEqual(calculateStatusFromRange('14', 'Reference range unavailable in source document'), 'Range unavailable');
  });

  it('returns "Not determined" when numeric value cannot be parsed', () => {
    assert.strictEqual(calculateStatusFromRange('Trace positive', '12.0 – 16.0'), 'Not determined');
  });
});