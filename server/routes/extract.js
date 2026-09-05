/**
 * Express Route: POST /api/extract
 * Ingests a medical report (PDF, JPG, PNG), performs OCR via pdf-parse or Tesseract.js,
 * queries Anthropic Claude API for structured lab test extraction using the specified
 * clinical extraction prompt, and returns a validated ExtractedReportBundle.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  sanitizeFilename,
  validateFileExtension,
  validateMagicBytes,
  sanitizeInput
} = require('../middleware/security');

const router = express.Router();

// 1. Configure Multer for In-Memory File Handling (25MB Limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];
    const isExtAllowed = validateFileExtension(file.originalname);
    if (allowedMimeTypes.includes(file.mimetype) || isExtAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype || path.extname(file.originalname)}. Only PDF, JPG, JPEG, PNG, and TXT are supported.`));
    }
  }
});

// System Prompt specified for clinical document extraction
const CLINICAL_EXTRACTION_SYSTEM_PROMPT = `You are a clinical document extraction engine. You extract structured lab test 
data from raw OCR'd text of medical reports. You do not diagnose, interpret, 
or add clinical judgment.

Rules:
- Extract ONLY values explicitly present in the text. Never infer or estimate 
  a value, unit, or reference range that is not written in the source.
- If a reference range is missing or unclear, set referenceRange to 
  "Reference range unavailable — status not determined." and status to 
  "Range unavailable".
- If a value cannot be parsed as numeric, set status to "Not determined".
- Determine status (Normal/Low/High) ONLY by comparing the numeric value to 
  the reference range found in the same document — never use external medical 
  knowledge of "normal" ranges.
- Assign a confidence score (0-1) per test reflecting how clearly it was 
  stated in the source text (e.g., clean tabular format = high confidence, 
  ambiguous OCR = lower).
- Return ONLY valid JSON matching this exact schema, no prose, no markdown 
  fences:

{
  "reportType": string,
  "reportDate": string (YYYY-MM-DD),
  "sourceFacility": string,
  "tests": [
    {
      "testName": string,
      "value": string,
      "numericValue": number | null,
      "unit": string,
      "referenceRange": string,
      "status": "Normal" | "Low" | "High" | "Range unavailable" | "Not determined",
      "observation": string | null,
      "confidence": number
    }
  ]
}`;

// Helper: Format file size in human-readable units
function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

// Helper: Extract text from file buffer using appropriate OCR engine
async function extractTextFromBuffer(fileBuffer, mimeType, fileName) {
  const ext = path.extname(fileName).toLowerCase();

  // 1. PDF Documents -> pdf-parse
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(fileBuffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text.trim();
      }
      throw new Error('PDF contains no extractable text stream (may be a scanned image).');
    } catch (pdfErr) {
      throw new Error(`PDF parsing failed: ${pdfErr.message}`);
    }
  }

  // 2. Image Documents (JPG, PNG) -> Tesseract.js OCR
  if (mimeType.startsWith('image/') || ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    try {
      const Tesseract = require('tesseract.js');
      const result = await Tesseract.recognize(fileBuffer, 'eng', {
        logger: () => {}
      });
      if (result && result.data && result.data.text && result.data.text.trim().length > 0) {
        return result.data.text.trim();
      }
      throw new Error('OCR recognition produced no readable text.');
    } catch (ocrErr) {
      throw new Error(`Image OCR failed: ${ocrErr.message}`);
    }
  }

  // 3. Fallback: UTF-8 plain text
  return fileBuffer.toString('utf-8').trim();
}

// Helper: Call Claude API with the extracted OCR text
async function callClaudeClinicalExtraction(rawExtractedText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set on the server.');
  }

  const userPrompt = `Extract structured lab data from the following OCR'd report text:\n\n<<<${rawExtractedText}>>>`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0,
      system: CLINICAL_EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API responded with HTTP ${response.status}: ${errorBody}`);
  }

  const responseJson = await response.json();
  const rawTextContent = responseJson?.content?.[0]?.text;

  if (!rawTextContent || typeof rawTextContent !== 'string') {
    throw new Error('Claude API returned an empty or invalid content block.');
  }

  return rawTextContent.trim();
}

// Route Handler: POST /api/extract
router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    // Step 1: Validate file presence
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded.',
        details: 'A multipart form file named "file" (PDF, JPG, JPEG, or PNG) is required.'
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const cleanFilename = sanitizeFilename(originalname);

    // Defense-in-depth: Validate file content against binary magic bytes signature
    if (!validateMagicBytes(buffer, cleanFilename)) {
      return res.status(400).json({
        error: 'Invalid file signature.',
        details: 'File header magic bytes do not match the expected document structure. Uploads of disguised binaries or scripts are prohibited.'
      });
    }

    const fileExtension = path.extname(cleanFilename).replace('.', '').toUpperCase() || 'DOCUMENT';
    const formattedSize = formatFileSize(size);

    // Step 2: Run OCR / text extraction
    let rawExtractedText = '';
    try {
      rawExtractedText = await extractTextFromBuffer(buffer, mimetype, cleanFilename);
    } catch (ocrErr) {
      return res.status(422).json({
        error: 'Document text extraction failed.',
        details: ocrErr.message
      });
    }

    if (!rawExtractedText || rawExtractedText.length < 5) {
      return res.status(422).json({
        error: 'OCR produced insufficient readable text.',
        details: 'The document appears blank or could not be deciphered by the OCR engine.'
      });
    }

    // Step 3: Send extracted text to Claude's API using clinical prompt
    let rawLlmOutput = '';
    try {
      rawLlmOutput = await callClaudeClinicalExtraction(rawExtractedText);
    } catch (llmErr) {
      return res.status(502).json({
        error: 'Clinical LLM extraction failed.',
        details: llmErr.message
      });
    }

    // Step 4: Parse and validate JSON response against ExtractedReportBundle shape
    let parsedLlmJson = null;
    try {
      const cleanJson = rawLlmOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      parsedLlmJson = JSON.parse(cleanJson);
    } catch (jsonErr) {
      return res.status(502).json({
        error: 'LLM returned malformed or non-compliant JSON.',
        details: jsonErr.message,
        rawResponse: rawLlmOutput
      });
    }

    if (!parsedLlmJson || typeof parsedLlmJson !== 'object' || !Array.isArray(parsedLlmJson.tests)) {
      return res.status(502).json({
        error: 'Invalid extraction schema returned by LLM.',
        details: 'Missing or invalid "tests" array in the LLM response JSON.',
        rawResponse: rawLlmOutput
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const reportDate = parsedLlmJson.reportDate || todayDate;
    const reportType = parsedLlmJson.reportType || 'Clinical Laboratory Panel';
    const sourceFacility = parsedLlmJson.sourceFacility || 'Pathology Laboratory';

    const validStatuses = ['Normal', 'Low', 'High', 'Range unavailable', 'Not determined'];

    const validatedTests = parsedLlmJson.tests.map((t, idx) => {
      let status = validStatuses.includes(t.status) ? t.status : 'Not determined';
      const refRange = (t.referenceRange || '').trim();
      if (!refRange || refRange.toLowerCase().includes('unavailable')) {
        status = 'Range unavailable';
      }

      let conf = typeof t.confidence === 'number' && !isNaN(t.confidence) ? t.confidence : 0.95;
      if (conf > 1.0) conf = conf / 100.0;
      conf = Math.min(Math.max(conf, 0.0), 1.0);

      return {
        testName: String(t.testName || `Biomarker ${idx + 1}`).trim(),
        value: String(t.value || '').trim(),
        numericValue: typeof t.numericValue === 'number' ? t.numericValue : parseFloat(String(t.value).replace(/[^\d.-]/g, '')) || undefined,
        unit: String(t.unit || '').trim(),
        referenceRange: refRange || 'Reference range unavailable — status not determined.',
        status: status,
        date: reportDate,
        observation: t.observation ? String(t.observation).trim() : undefined,
        source: 'Extracted from report',
        confidence: Number(conf.toFixed(2))
      };
    });

    const meanConfidence =
      validatedTests.length > 0
        ? Number(
            (
              validatedTests.reduce((sum, t) => sum + (t.confidence || 0.9), 0) /
              validatedTests.length
            ).toFixed(2)
          )
        : 0.95;

    const reportBundle = {
      fileName: cleanFilename,
      fileType: fileExtension,
      fileSize: formattedSize,
      reportDate: reportDate,
      reportType: reportType,
      sourceFacility: sourceFacility,
      rawExtractedText: rawExtractedText,
      meanConfidence: meanConfidence,
      tests: validatedTests
    };

    return res.status(200).json(reportBundle);
  } catch (unexpectedErr) {
    return res.status(500).json({
      error: 'Unexpected internal server error during document extraction.',
      details: unexpectedErr.message
    });
  }
});

module.exports = router;