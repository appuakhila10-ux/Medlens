# MedLens — AI-Powered Clinical Information Intelligence

MedLens is a modern, responsive web application for organizing, cross-referencing, verifying, and comparing clinical diagnostic information with strict source-provenance tracking.

> **Clinical Safety & Non-Diagnostic Guarantee**: MedLens organizes and summarizes clinical documentation. It does NOT diagnose diseases, prescribe medications, alter dosages, or recommend treatment regimens. All reference ranges are sourced directly from original laboratory reports.

## Features & Navigation

- **🏠 Dashboard**: Clinical stats cards, recent patient roster, recent diagnostic uploads, quick "+ Add Patient" and "Upload Medical Report" actions.
- **👤 Patients Directory**: Searchable, filterable patient cohort with card/table toggles and patient intake modal.
- **📄 Upload Report**: Drag-and-drop ingestion interface for PDF, JPG, and PNG documents with processing telemetry and entity extraction previews.
- **🧪 Medical Records**: Traceable patient information, demographics, symptoms, conditions, allergies, medications, and laboratory results table with source reference intervals and provenance badges (`User provided`, `Extracted from report`, `AI generated`).
- **✨ AI Summary Card**: Structured narrative synthesis with mandatory non-diagnostic clinical disclaimer.
- **✅ Verification Screen**: Human-in-the-loop review interface with extraction confidence ratings (e.g. 96%), Confirm, Edit, and Reject capabilities.
- **📊 Compare Reports**: Longitudinal laboratory variance analysis showing previous vs current values, reference ranges, and objective mathematical deltas without diagnostic conclusions.
- **⚠️ Inconsistencies / Conflicts**: Cross-record inconsistency detection (e.g. allergy or medication discrepancy between sources) with staff adjudication workflows.
- **🕒 Timeline**: Chronological patient audit history tracing document uploads, AI synthesis, verification milestones, and record edits.
- **⚙️ Settings & Security**: Practitioner profile, HIPAA privacy standards, AES-256 encryption posture, and structured JSON cohort export.

## Tech Stack

- **React 18** with **TypeScript**
- **Tailwind CSS** with healthcare-inspired clinical styling
- **Lucide React** clinical iconography
- **Vite 5** high-speed build system

## Running the Application

Double-click `run-medlens.bat` or run:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
