import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient } from '../../types/clinical';
import { Check, AlertCircle, Info } from 'lucide-react';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (updatedFields: Partial<Patient>) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [symptoms, setSymptoms] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  useEffect(() => {
    if (patient && isOpen) {
      setName(patient.name || '');
      setAge(String(patient.age || ''));
      setSex(patient.sex || 'Female');
      setSymptoms(Array.isArray(patient.symptoms) ? patient.symptoms.join(', ') : '');
      setConditions(Array.isArray(patient.conditions) ? patient.conditions.join(', ') : '');
      setAllergies(Array.isArray(patient.allergies) ? patient.allergies.join(', ') : '');
      setMedications(Array.isArray(patient.medications) ? patient.medications.join(', ') : '');
      setNotes(patient.notes || '');
      setErrors({});
    }
  }, [patient, isOpen]);

  if (!patient) return null;

  const validate = (): boolean => {
    const newErrors: { name?: string; age?: string } = {};
    if (!name.trim()) newErrors.name = 'Patient name cannot be empty.';
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

    const parseList = (val: string): string[] =>
      val
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);

    onSave({
      name: name.trim(),
      age: parseInt(age, 10),
      sex,
      symptoms: parseList(symptoms),
      conditions: parseList(conditions),
      allergies: parseList(allergies),
      medications: parseList(medications),
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Patient Information — ${patient.id}`}
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Check className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p>
            Modifying user-provided fields will update the patient record while preserving the <strong>"User provided"</strong> provenance tag and updating the last modified timestamp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              value={patient.id}
              disabled
              className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-100 text-slate-500 border border-slate-300 rounded-lg cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              value={age}
              min="0"
              max="130"
              onChange={(e) => {
                setAge(e.target.value);
                if (errors.age) setErrors(prev => ({ ...prev, age: undefined }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.age ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
              }`}
            />
            {errors.age && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.age}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biological Sex
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Symptoms <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Existing Conditions <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Allergies <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medications <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};