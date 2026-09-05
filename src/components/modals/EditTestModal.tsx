import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LabResult, LabStatus } from '../../types/clinical';
import { Check, Edit3 } from 'lucide-react';

interface EditTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LabResult | null;
  onSave: (updatedItem: LabResult) => void;
}

export const EditTestModal: React.FC<EditTestModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave
}) => {
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [status, setStatus] = useState<LabStatus>('normal');

  useEffect(() => {
    if (item) {
      setTestName(item.testName);
      setValue(item.value);
      setUnit(item.unit);
      setReferenceRange(item.referenceRange);
      setStatus(item.status);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LabResult = {
      ...item,
      testName,
      value,
      numericValue: parseFloat(value) || item.numericValue,
      unit,
      referenceRange,
      status,
      verificationStatus: 'verified'
    };
    onSave(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Extracted Laboratory Value"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={<Check className="w-4 h-4" />} onClick={handleSave}>
            Save & Confirm Verification
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Test Name
          </label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Extracted Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Source Report Reference Range
          </label>
          <input
            type="text"
            value={referenceRange}
            onChange={(e) => setReferenceRange(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Must reflect the exact reference range printed on the source laboratory report.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status Indicator (relative to source range)
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LabStatus)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="unavailable">Range unavailable</option>
          </select>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          Source Document: <strong className="text-slate-800">{item.sourceDocument}</strong>
        </div>
      </form>
    </Modal>
  );
};
