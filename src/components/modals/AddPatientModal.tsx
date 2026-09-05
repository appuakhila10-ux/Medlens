import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient } from '../../types/clinical';
import { generatePatientId } from '../../utils/storage';
import { UserPlus, AlertCircle, Info, Sparkles } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> & { customId?: string }) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient
}) => {
  const [generatedId, setGeneratedId] = useState<string>('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');

  // Form field-level validation errors
  const [errors, setErrors] = useState<{ name?: string; age?: string; form?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setGeneratedId(generatePatientId());
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: { name?: string; age?: string; form?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Patient name is required.';
    }

    if (!age.trim()) {
      newErrors.age = 'Age is required.';
    } else {
      const num = Number(age);
      if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 130) {
        newErrors.age = 'Please enter a valid age between 0 and 130.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse comma or newline separated strings into clean arrays
    const parseList = (val: string): string[] =>
      val
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);

    const parsedSymptoms = parseList(symptoms);
    const parsedConditions = parseList(conditions);
    const parsedAllergies = parseList(allergies);
    const parsedMedications = parseList(medications);

    onAddPatient({
      customId: generatedId,
      name: name.trim(),
      age: parseInt(age, 10),
      sex,
      symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : ['Initial clinical intake'],
      conditions: parsedConditions.length > 0 ? parsedConditions : ['None documented'],
      allergies: parsedAllergies.length > 0 ? parsedAllergies : ['No Known Drug Allergies (NKDA)'],
      medications: parsedMedications.length > 0 ? parsedMedications : ['None reported'],
      notes: notes.trim() || undefined
    });

    // Reset fields
    setName('');
    setAge('');
    setSex('Female');
    setSymptoms('');
    setConditions('');
    setAllergies('');
    setMedications('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Patient Information Intake"
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Save Patient Record
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informative provenance banner */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p>
            Information entered below will be recorded with the <strong>"User provided"</strong> provenance badge. Required fields are marked with an asterisk (<span className="text-rose-600 font-bold">*</span>).
          </p>
        </div>

        {errors.form && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Patient ID (Auto-generated) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient ID <span className="text-slate-400 font-normal">(Auto-generated)</span>
            </label>
            <input
              type="text"
              value={generatedId}
              readOnly
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-100 text-blue-900 border border-slate-300 rounded-lg cursor-not-allowed select-all"
              title="Automatically generated identifier"
            />
          </div>

          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 58"
              value={age}
              min="0"
              max="130"
              onChange={(e) => {
                setAge(e.target.value);
                if (errors.age) setErrors(prev => ({ ...prev, age: undefined }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.age ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              }`}
            />
            {errors.age && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.age}
              </p>
            )}
          </div>

          {/* Biological Sex */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biological Sex <span className="text-rose-600">*</span>
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reported Symptoms <span className="text-slate-400 font-normal">(comma-separated or one per line)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Fatigue, Mild exertional shortness of breath, Cold sensitivity"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Existing Conditions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Existing Documented Conditions <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Essential Hypertension, Type 2 Diabetes Mellitus, Osteopenia"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Documented Allergies <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Sulfa, Latex (or NKDA)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Medications */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Medications <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Metformin HCl 500mg, Lisinopril 10mg"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Additional Notes <span className="text-slate-400 font-normal">(optional clinical context)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Document patient dietary observations, baseline notes, or special considerations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};