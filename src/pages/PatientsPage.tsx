import React, { useState, useMemo } from 'react';
import { Patient } from '../types/clinical';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Search,
  Filter,
  UserPlus,
  FileText,
  AlertTriangle,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Users
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface PatientsPageProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigate: (page: NavPage) => void;
  onOpenAddPatient: () => void;
  onOpenEditPatient: (patient: Patient) => void;
  onOpenDeletePatient: (patient: Patient) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  onSelectPatient,
  onNavigate,
  onOpenAddPatient,
  onOpenEditPatient,
  onOpenDeletePatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sexFilter, setSexFilter] = useState<'All' | 'Female' | 'Male' | 'Other'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        (patient.mrn && patient.mrn.toLowerCase().includes(query)) ||
        (Array.isArray(patient.conditions) && patient.conditions.some(c => c.toLowerCase().includes(query))) ||
        (Array.isArray(patient.symptoms) && patient.symptoms.some(s => s.toLowerCase().includes(query)));

      if (!matchesSearch) return false;

      if (sexFilter !== 'All') {
        if (patient.sex !== sexFilter) return false;
      }

      return true;
    });
  }, [patients, searchQuery, sexFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Patients Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Clinical registry with structured intake data and source-traceable records ({filteredPatients.length} of {patients.length} patients)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={onOpenAddPatient}
          >
            + Add Patient
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, Patient ID (e.g. ML-1042), or clinical condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> Sex:
              </span>
              {(['All', 'Female', 'Male', 'Other'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSexFilter(filter)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    sexFilter === filter ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Toggle Table/Cards */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State when NO patients exist in storage at all */}
      {patients.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
            <Users className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No patients added yet.</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Add your first patient to begin building a structured medical record.
          </p>
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={onOpenAddPatient}
            className="shadow-sm"
          >
            + Add Patient
          </Button>
        </Card>
      )}

      {/* Empty State when filter yields 0 results */}
      {patients.length > 0 && filteredPatients.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No matching patients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search terms or clearing the sex filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSexFilter('All'); }}
          >
            Reset Filters
          </Button>
        </Card>
      )}

      {/* Table View */}
      {filteredPatients.length > 0 && viewMode === 'table' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table aria-label="Patient Cohort Directory" className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Patient ID</th>
                  <th scope="col" className="px-5 py-3.5">Name</th>
                  <th scope="col" className="px-5 py-3.5">Age / Sex</th>
                  <th scope="col" className="px-5 py-3.5">Key Conditions</th>
                  <th scope="col" className="px-5 py-3.5">Last Updated</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-blue-800">
                      {patient.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{patient.mrn || 'Auto-registered'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {patient.age} yrs • {patient.sex}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(patient.conditions) && patient.conditions.length > 0 ? (
                          patient.conditions.slice(0, 2).map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">None documented</span>
                        )}
                        {Array.isArray(patient.conditions) && patient.conditions.length > 2 && (
                          <span className="text-[11px] text-slate-400">+{patient.conditions.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {patient.updatedAt || patient.createdAt || 'Recent'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => onSelectPatient(patient.id)}
                          title="View patient record"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => onOpenEditPatient(patient)}
                          title="Edit patient details"
                          className="hover:text-blue-700 hover:border-blue-400"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          onClick={() => onOpenDeletePatient(patient)}
                          title="Delete patient record"
                          className="hover:bg-rose-50 text-rose-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cards View */}
      {filteredPatients.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    {patient.id}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{patient.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{patient.mrn || 'Clinical Chart'}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-700">
                  {patient.sex}
                </span>
              </div>

              <div className="py-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-semibold text-slate-800">{patient.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Modified:</span>
                  <span className="font-medium text-slate-700">{patient.updatedAt || patient.createdAt}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block text-[11px] mb-1">Key Conditions:</span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(patient.conditions) && patient.conditions.slice(0, 3).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex-1"
                >
                  View Record
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => onOpenEditPatient(patient)}
                  title="Edit patient"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={() => onOpenDeletePatient(patient)}
                  title="Delete patient"
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};