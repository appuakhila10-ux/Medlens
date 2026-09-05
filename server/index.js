/**
 * MedLens Backend Service Entrypoint
 * Runs an Express server on port 3001 for OCR and LLM clinical extraction.
 */

const express = require('express');
const cors = require('cors');
const extractRouter = require('./routes/extract');
const summarizeRouter = require('./routes/summarize');
const conflictsRouter = require('./routes/conflicts');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for development frontend on port 5173
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount Endpoints
app.use('/api', extractRouter);
app.use('/api', summarizeRouter);
app.use('/api', conflictsRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MedLens Clinical Intelligence Extraction API',
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[MedLens Backend] Clinical Extraction server listening on port ${PORT}`);
});

module.exports = app;