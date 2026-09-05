/**
 * Express Route: POST /api/conflicts
 * Cross-references newly uploaded clinical records against existing patient records
 * using Claude LLM and strict factual inconsistency detection rules.
 */

const express = require('express');
const router = express.Router();

const CLINICAL_CONFLICT_SYSTEM_PROMPT = `You compare two sets of patient-reported clinical data (allergies, medications, 
demographics, history) drawn from different source documents, and flag 
factual inconsistencies ONLY — not clinical judgments about severity or 
correctness.

Rules:
- Only flag a conflict when two sources make genuinely incompatible claims 
  (e.g., "No known allergies" vs. "Penicillin allergy noted").
- Do not flag paraphrasing differences as conflicts.
- Never state which source is "correct" — only that human adjudication is needed.
- Return ONLY valid JSON array matching this schema:

[
  {
    "category": "Allergy" | "Medication" | "History" | "Demographic",
    "title": string,
    "description": string,
    "source1": {"name": string, "date": string, "claim": string},
    "source2": {"name": string, "date": string, "claim": string}
  }
]

If no conflicts are found, return an empty array [].`;

router.post('/conflicts', async (req, res) => {
  try {
    const { source1, source2, patient, report, tests } = req.body || {};

    let src1Name = source1?.name || `Patient Chart (${patient?.name || 'Documented'})`;
    let src1Date = source1?.date || patient?.updatedAt || patient?.createdAt || 'Documented Intake';
    let src1Data = source1?.data || {
      demographics: { name: patient?.name, age: patient?.age, sex: patient?.sex, dob: patient?.dob },
      allergies: patient?.allergies || [],
      medications: patient?.medications || [],
      conditions: patient?.conditions || [],
      symptoms: patient?.symptoms || [],
      notes: patient?.notes || ''
    };

    let src2Name = source2?.name || report?.fileName || report?.reportType || 'Uploaded Medical Report';
    let src2Date = source2?.date || report?.reportDate || report?.uploadDate || new Date().toISOString().split('T')[0];
    let src2Data = source2?.data || {
      reportType: report?.reportType,
      sourceFacility: report?.sourceFacility,
      documentText: report?.extractedText || '',
      tests: (tests || []).map(t => ({
        testName: t.testName,
        value: t.value,
        unit: t.unit,
        status: t.status,
        referenceRange: t.referenceRange,
        observation: t.observation
      }))
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'ANTHROPIC_API_KEY environment variable is not configured on the server.',
        details: 'Claude API key required for live inconsistency detection.'
      });
    }

    const userPrompt = `Source 1 (${src1Name}, ${src1Date}): ${JSON.stringify(src1Data, null, 2)}
Source 2 (${src2Name}, ${src2Date}): ${JSON.stringify(src2Data, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0,
        system: CLINICAL_CONFLICT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(502).json({
        error: `Claude API responded with HTTP ${response.status}`,
        details: errorBody
      });
    }

    const responseJson = await response.json();
    const rawContent = responseJson?.content?.[0]?.text?.trim() || '[]';

    // Parse JSON array
    let conflicts = [];
    try {
      const cleanJson = rawContent.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      conflicts = JSON.parse(cleanJson);
    } catch (parseErr) {
      return res.status(502).json({
        error: 'LLM returned non-compliant JSON for clinical conflicts.',
        details: parseErr.message,
        rawResponse: rawContent
      });
    }

    if (!Array.isArray(conflicts)) {
      conflicts = [];
    }

    // Validate categories and format
    const validCategories = ['Allergy', 'Medication', 'History', 'Demographic'];
    const validatedConflicts = conflicts.map(c => ({
      category: validCategories.includes(c.category) ? c.category : 'History',
      title: String(c.title || 'Potential clinical inconsistency').trim(),
      description: String(c.description || '').trim(),
      source1: {
        name: String(c.source1?.name || src1Name).trim(),
        date: String(c.source1?.date || src1Date).trim(),
        claim: String(c.source1?.claim || '').trim()
      },
      source2: {
        name: String(c.source2?.name || src2Name).trim(),
        date: String(c.source2?.date || src2Date).trim(),
        claim: String(c.source2?.claim || '').trim()
      }
    }));

    return res.status(200).json({
      conflicts: validatedConflicts,
      checkedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error while detecting clinical conflicts.',
      details: err.message
    });
  }
});

module.exports = router;