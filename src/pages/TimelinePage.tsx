import React, { useState } from 'react';
import { TimelineEvent, Patient } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SafetyBanner } from '../components/common/SafetyBanner';
import {
  Clock,
  FileUp,
  FileCheck,
  Sparkles,
  Edit,
  UserCheck,
  Filter,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MOCK_TIMELINE_EVENTS } from '../data/mockData';

interface TimelinePageProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (patientId: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient
}) => {
  const currentPatientId = selectedPatientId || patients[0]?.id || 'ML-1042';
  const patient = patients.find(p => p.id === currentPatientId) || patients[0];

  const [activeFilter, setActiveFilter] = useState<string>('all');

  const events = MOCK_TIMELINE_EVENTS.filter(e => e.patientId === currentPatientId);

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(e => e.eventType === activeFilter);

  const getEventIcon = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'report_uploaded':
        return <FileUp className="w-4 h-4 text-blue-600" />;
      case 'report_verified':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'ai_summary_generated':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'record_edited':
        return <Edit className="w-4 h-4 text-amber-600" />;
      case 'patient_updated':
        return <UserCheck className="w-4 h-4 text-teal-600" />;
    }
  };

  const getEventBadgeLabel = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'report_uploaded':
        return 'Report Uploaded';
      case 'report_verified':
        return 'Report Verified';
      case 'ai_summary_generated':
        return 'AI Summary Synthesized';
      case 'record_edited':
        return 'Record Edited';
      case 'patient_updated':
        return 'Patient Information Updated';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Universal Clinical Safety Banner */}
      <SafetyBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Chronological Patient Timeline</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable audit record of all document uploads, AI synthesis, clinical edits, and verification actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Selected Patient:</span>
          <select
            value={currentPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-2xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card noPadding className="p-2.5 bg-slate-50/80">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Event Type:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter('report_uploaded')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeFilter === 'report_uploaded' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reports Uploaded
          </button>
          <button
            onClick={() => setActiveFilter('report_verified')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeFilter === 'report_verified' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reports Verified
          </button>
          <button
            onClick={() => setActiveFilter('ai_summary_generated')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeFilter === 'ai_summary_generated' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Summaries
          </button>
          <button
            onClick={() => setActiveFilter('record_edited')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeFilter === 'record_edited' ? 'bg-white text-amber-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Record Edits
          </button>
        </div>
      </Card>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        <div className="space-y-6">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline node icon */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center shadow-xs transition-colors">
                {getEventIcon(evt.eventType)}
              </div>

              {/* Event Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{evt.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {getEventBadgeLabel(evt.eventType)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    {evt.date} • {evt.timestamp}
                  </div>
                </div>

                <div className="py-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {evt.description}
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Source:</span>
                    <span className="font-medium text-slate-700">{evt.source}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">User / Action:</span>
                    <span className="font-semibold text-blue-700">{evt.actor}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
