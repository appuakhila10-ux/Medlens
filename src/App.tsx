import React, { useState, useEffect } from 'react';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientRecordPage } from './pages/PatientRecordPage';
import { UploadReportPage } from './pages/UploadReportPage';
import { VerificationPage } from './pages/VerificationPage';
import { CompareReportsPage } from './pages/CompareReportsPage';
import { ConflictsPage } from './pages/ConflictsPage';
import { TimelinePage } from './pages/TimelinePage';
import { SettingsPage } from './pages/SettingsPage';
import { AddPatientModal } from './components/modals/AddPatientModal';
import { EditPatientModal } from './components/modals/EditPatientModal';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { Patient, MedicalReport, MedicalTest } from './types/clinical';
import { ExtractedReportBundle } from './utils/extractor';
import {
  getStoredPatients,
  createStoredPatient,
  updateStoredPatient,
  deleteStoredPatient,
  getStoredReports,
  createStoredReport,
  getStoredMedicalTests,
  createStoredMedicalTests,
  getCurrentTimestamp
} from './utils/storage';
import { generatePatientAISummary } from './utils/aiSummary';
import { CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<NavPage | 'verification'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('ML-1042');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  // Extracted report bundle queued for human verification
  const [activeExtractedBundle, setActiveExtractedBundle] = useState<ExtractedReportBundle | null>(null);

  // Core persistent data stores from localStorage
  const [patients, setPatients] = useState<Patient[]>(() => getStoredPatients());
  const [reports, setReports] = useState<MedicalReport[]>(() => getStoredReports());
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>(() => getStoredMedicalTests());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync selected patient ID on initial load or deletion fallback
  useEffect(() => {
    if (patients.length > 0 && !patients.some(p => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleNavigate = (page: NavPage | 'verification', patientId?: string) => {
    setActivePage(page);
    if (patientId) {
      setSelectedPatientId(patientId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePage('records');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD: Add Patient
  const handleAddPatient = (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> & { customId?: string }) => {
    const newPatient = createStoredPatient(data);
    setPatients(getStoredPatients());
    setSelectedPatientId(newPatient.id);
    showToast(`Patient ${newPatient.name} (${newPatient.id}) successfully created.`);
    setActivePage('records');
  };

  // CRUD: Edit Patient
  const handleSaveEditPatient = (updates: Partial<Patient>) => {
    if (!editingPatient) return;
    const updated = updateStoredPatient(editingPatient.id, updates);
    if (updated) {
      setPatients(getStoredPatients());
      showToast(`Patient ${updated.name} record updated successfully.`);
    }
    setEditingPatient(null);
  };

  // CRUD: Delete Patient
  const handleConfirmDeletePatient = (id: string) => {
    const success = deleteStoredPatient(id);
    if (success) {
      const updatedList = getStoredPatients();
      setPatients(updatedList);
      showToast(`Patient record ${id} was deleted from the clinical registry.`);
      setActivePage('patients');
      if (updatedList.length > 0) {
        setSelectedPatientId(updatedList[0].id);
      }
    }
    setDeletingPatient(null);
  };

  // Workflow: Report uploaded & processed -> send to Verification
  const handleReadyForVerification = (bundle: ExtractedReportBundle, assignedPatientId: string) => {
    setActiveExtractedBundle(bundle);
    setSelectedPatientId(assignedPatientId);
    setActivePage('verification');
    showToast(`Extraction complete (${bundle.tests.length} tests). Ready for clinical verification.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Workflow: Human verification complete -> save to patient record
  const handleSaveToPatientRecord = (
    reportData: Omit<MedicalReport, 'id'>,
    testsData: Omit<MedicalTest, 'id'>[],
    targetPatientId: string
  ) => {
    const newReportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: MedicalReport = {
      ...reportData,
      id: newReportId,
      patientId: targetPatientId
    };

    const newTests: MedicalTest[] = testsData.map((t, idx) => ({
      ...t,
      id: `TEST-${Date.now()}-${idx}`,
      reportId: newReportId,
      patientId: targetPatientId,
      verified: true
    }));

    // Save to persistent storage
    createStoredReport(newReport);
    createStoredMedicalTests(newTests);

    // Automatically generate updated non-diagnostic AI summary from verified records
    const allStoredTests = getStoredMedicalTests();
    const allStoredReports = getStoredReports();
    const targetPatient = getStoredPatients().find(p => p.id === targetPatientId);
    if (targetPatient) {
      const summaryText = generatePatientAISummary(targetPatient, allStoredTests, allStoredReports);
      updateStoredPatient(targetPatientId, {
        aiSummary: {
          text: summaryText,
          generatedAt: getCurrentTimestamp(),
          recordsAnalyzedCount: allStoredTests.filter(t => t.patientId === targetPatientId).length,
          disclaimer: "MedLens summarizes and organizes reported information. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional."
        }
      });
    }

    // Refresh state from storage
    setReports(getStoredReports());
    setMedicalTests(getStoredMedicalTests());
    setPatients(getStoredPatients());

    setActiveExtractedBundle(null);
    setSelectedPatientId(targetPatientId);
    showToast(`Medical report "${reportData.fileName}" and ${newTests.length} tests verified & saved to patient record.`);
    setActivePage('records');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  // Workflow: Manually regenerate AI summary
  const handleRegenerateAISummary = async (patientId: string) => {
    setIsRegeneratingSummary(true);
    try {
      const targetPatient = patients.find(p => p.id === patientId);
      if (!targetPatient) return;
      const summaryText = generatePatientAISummary(targetPatient, medicalTests, reports);
      const updated = updateStoredPatient(patientId, {
        aiSummary: {
          text: summaryText,
          generatedAt: getCurrentTimestamp(),
          recordsAnalyzedCount: medicalTests.filter(t => t.patientId === patientId).length,
          disclaimer: "MedLens summarizes and organizes reported information. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional."
        }
      });
      if (updated) {
        setPatients(getStoredPatients());
        showToast(`AI Summary regenerated for ${targetPatient.name}.`);
      }
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const pendingCount = reports.filter(r => r.verificationStatus === 'pending').length;
  const conflictCount = patients.reduce((acc, p) => acc + (p.conflictCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Persistent Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activePage={activePage === 'verification' ? 'records' : activePage}
          onNavigate={(page) => handleNavigate(page)}
          pendingCount={pendingCount}
          conflictCount={conflictCount}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activePage={activePage === 'verification' ? 'records' : activePage}
        onNavigate={(page) => handleNavigate(page)}
        conflictCount={conflictCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activePage={activePage === 'verification' ? 'records' : activePage}
          onNavigate={(page) => handleNavigate(page)}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              patients={patients}
              reports={reports}
              onNavigate={(page, pid) => handleNavigate(page, pid)}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
            />
          )}

          {activePage === 'patients' && (
            <PatientsPage
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onNavigate={(page) => handleNavigate(page)}
              onOpenAddPatient={() => setIsAddPatientOpen(true)}
              onOpenEditPatient={(patient) => setEditingPatient(patient)}
              onOpenDeletePatient={(patient) => setDeletingPatient(patient)}
            />
          )}

          {activePage === 'upload' && (
            <UploadReportPage
              patients={patients}
              selectedPatientId={selectedPatientId}
              onNavigate={(page, pid) => handleNavigate(page, pid)}
              onReadyForVerification={handleReadyForVerification}
            />
          )}

          {activePage === 'records' && currentPatient && (
            <div className="space-y-4">
              <PatientRecordPage
                patient={currentPatient}
                patientsList={patients}
                medicalTests={medicalTests}
                medicalReports={reports}
                onSelectPatient={setSelectedPatientId}
                onNavigate={(page, pid) => handleNavigate(page, pid)}
                onOpenEditPatient={(p) => setEditingPatient(p)}
                onOpenDeletePatient={(p) => setDeletingPatient(p)}
                onRegenerateSummary={handleRegenerateAISummary}
                isRegeneratingSummary={isRegeneratingSummary}
              />
            </div>
          )}

          {activePage === 'records' && !currentPatient && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-800">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Please select or create a patient to view their clinical record.
              </p>
              <button
                onClick={() => setIsAddPatientOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Add Patient
              </button>
            </div>
          )}

          {activePage === 'verification' && (
            <VerificationPage
              patients={patients}
              preSelectedPatientId={selectedPatientId}
              extractedBundle={activeExtractedBundle}
              onSaveToPatientRecord={handleSaveToPatientRecord}
              onNavigate={(page, pid) => handleNavigate(page, pid)}
            />
          )}

          {activePage === 'compare' && (
            <CompareReportsPage
              patients={patients}
              reports={reports}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          )}

          {activePage === 'conflicts' && (
            <ConflictsPage
              onSelectPatient={handleSelectPatient}
            />
          )}

          {activePage === 'timeline' && (
            <TimelinePage
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              patients={patients}
            />
          )}
        </main>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onSave={handleSaveEditPatient}
      />

      {/* Delete Patient Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        patient={deletingPatient}
        onConfirmDelete={handleConfirmDeletePatient}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;