/**
 * MedLens Backend Service Entrypoint
 * Runs an Express server on port 3001 for OCR and LLM clinical extraction.
 */

// Automatically load .env file from project root or server/ if present
const fs = require('fs');
const path = require('path');
[path.resolve(__dirname, '../.env'), path.resolve(__dirname, '.env')].forEach(envPath => {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          const envKey = key.trim();
          if (!process.env[envKey]) {
            process.env[envKey] = val;
          }
        }
      });
    } catch (e) {
      console.warn(`[MedLens Server] Notice: Could not read ${envPath}: ${e.message}`);
    }
  }
});

const express = require('express');
const cors = require('cors');
const { securityHeaders, rateLimiterMiddleware } = require('./middleware/security');
const extractRouter = require('./routes/extract');
const summarizeRouter = require('./routes/summarize');
const conflictsRouter = require('./routes/conflicts');
const patientsRouter = require('./routes/patients');
const reportsRouter = require('./routes/reports');
const testsRouter = require('./routes/tests');
const { router: conflictsDataRouter } = require('./routes/conflicts-data');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite Database with Schema & Seed data
getDb();

// Harden Express configuration
app.disable('x-powered-by');

// Apply Defensive Security Headers
app.use(securityHeaders);

// Apply General Rate Limiter to protect all API endpoints
app.use('/api', rateLimiterMiddleware({ limit: 60, windowMs: 60000 }));

// Apply Specialized Sliding-Window Rate Limiter for compute-heavy AI & OCR endpoints
const aiEndpointLimiter = rateLimiterMiddleware({ limit: 30, windowMs: 60000 });
app.use('/api/extract', aiEndpointLimiter);
app.use('/api/summarize', aiEndpointLimiter);
app.use('/api/conflicts', aiEndpointLimiter);

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
app.use('/api', patientsRouter);
app.use('/api', reportsRouter);
app.use('/api', testsRouter);
app.use('/api', conflictsDataRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MedLens Clinical Intelligence Extraction API',
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[MedLens Backend] Clinical Extraction server listening on port ${PORT}`);
  });
}

module.exports = app;