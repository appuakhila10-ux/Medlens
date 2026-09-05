import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Patient } from '../../types/clinical';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onConfirmDelete
}) => {
  if (!patient) return null;

  const handleConfirm = () => {
    onConfirmDelete(patient.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Patient Record"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={handleConfirm}
          >
            Yes, Delete Record
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-semibold text-sm text-rose-950">
              Are you sure you want to delete this patient record?
            </strong>
            <p className="text-rose-900/90 leading-relaxed">
              This action will remove <strong>{patient.name}</strong> ({patient.id}) from the local clinical registry and stored diagnostic ledger. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
          <div><strong>Patient:</strong> {patient.name}</div>
          <div><strong>Patient ID:</strong> <span className="font-mono">{patient.id}</span></div>
          <div><strong>Age / Sex:</strong> {patient.age} years • {patient.sex}</div>
        </div>
      </div>
    </Modal>
  );
};