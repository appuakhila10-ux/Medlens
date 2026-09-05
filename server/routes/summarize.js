const express = require('express');
const router = express.Router();

const CLINICAL_SUMMARIZER_SYSTEM_PROMPT = `You are a clinical information summarizer, NOT a diagnostician. You write 
short, plain-language summaries of a patient's verified lab records for 
clinical staff review.

Strict constraints:
- NEVER diagnose a disease or condition.
- NEVER suggest, recommend, or imply a treatment, medication, or dosage change.
- NEVER speculate beyond the literal recorded data.
- State reference ranges exactly as sourced from the original report; if a 
  range is missing, say so explicitly rather than guessing.
- End every summary with exactly this sentence: "This summary organizes 
  reported values and does not provide a diagnosis or medical recommendation."
- Keep it to 4-7 sentences, objective and factual in tone.`;

const MANDATORY_CLOSING_SENTENCE =
  'This summary organizes reported values and does not provide a diagnosis or medical recommendation.';

router.post('/summarize', async (req, res) => {
  try {
    const { patient, tests, reports, name, id, patientTestsJson, patientReportsJson } = req.body || {};

    const patientName = patient?.name || name || 'Patient';
    const patientId = patient?.id || id || 'Unknown ID';

    let testsPayload;
    if (typeof patientTestsJson === 'string') {
      try {
        testsPayload = JSON.parse(patientTestsJson);
      } catch {
        testsPayload = patientTestsJson;
      }
    } else if (Array.isArray(tests)) {
      testsPayload = tests
        .filter(t => !patientId || !t.patientId || t.patientId === patientId)
        .map(t => ({
          testName: t.testName,
          value: t.value,
          unit: t.unit,
          referenceRange: t.referenceRange || 'Reference range unavailable',
          status: t.status,
          date: t.date,
          observation: t.observation || undefined
        }));
    } else {
      testsPayload = [];
    }

    let reportsPayload;
    if (typeof patientReportsJson === 'string') {
      try {
        reportsPayload = JSON.parse(patientReportsJson);
      } catch {
        reportsPayload = patientReportsJson;
      }
    } else if (Array.isArray(reports)) {
      reportsPayload = reports
        .filter(r => !patientId || !r.patientId || r.patientId === patientId)
        .map(r => ({
          fileName: r.fileName || r.reportName || 'Medical Report',
          reportType: r.reportType || 'Clinical Laboratory',
          reportDate: r.reportDate || r.date || r.uploadDate,
          sourceFacility: r.sourceFacility || 'Laboratory'
        }));
    } else {
      reportsPayload = [];
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'ANTHROPIC_API_KEY environment variable is not configured on the server.',
        details: 'Claude API key required for live AI summary generation.'
      });
    }

    const userPrompt = `Patient: ${patientName} (${patientId})
Verified lab tests (JSON): ${typeof testsPayload === 'string' ? testsPayload : JSON.stringify(testsPayload, null, 2)}
Recent reports (JSON): ${typeof reportsPayload === 'string' ? reportsPayload : JSON.stringify(reportsPayload, null, 2)}

Write the clinical information summary following the constraints above.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0,
        system: CLINICAL_SUMMARIZER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(502).json({
        error: `Claude API call failed with HTTP ${response.status}`,
        details: errorBody
      });
    }

    const responseJson = await response.json();
    const rawSummary = responseJson?.content?.[0]?.text?.trim();

    if (!rawSummary) {
      return res.status(502).json({
        error: 'Claude API returned empty summary response.',
        details: 'Missing text content block in LLM response.'
      });
    }

    let finalSummary = rawSummary;
    if (!finalSummary.includes(MANDATORY_CLOSING_SENTENCE)) {
      finalSummary = `${finalSummary.trim()} ${MANDATORY_CLOSING_SENTENCE}`;
    }

    return res.status(200).json({
      summary: finalSummary,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error while generating patient AI summary.',
      details: err.message
    });
  }
});

module.exports = router;