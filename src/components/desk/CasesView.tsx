import { FormEvent, useEffect, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  Edit3,
  FileText,
  Info,
  Plus,
  Search,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import {
  apiFetch,
  formatISTDate,
  formatISTDateTime,
  toISTDateInput,
  toISTDateTimeLocalInput,
} from '../../lib/api';
import type { CaseRecord, ClientRecord } from '../../types';

interface CasesViewProps {
  onDataChanged: () => void;
}

const COURT_TYPE_LABELS: Record<string, string> = {
  HIGH_COURT: 'High Court',
  CIVIL_COURT: 'Civil / District Court',
  REVENUE_COURT: 'Revenue / Tehsil Court',
  TRIBUNAL: 'Tribunal',
  OTHER: 'Other Forum',
};

export function CasesView({ onDataChanged }: CasesViewProps) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [courtFilter, setCourtFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Detail & Modal state
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);

  // Case form fields
  const [clientId, setClientId] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [cnrNumber, setCnrNumber] = useState('');
  const [courtName, setCourtName] = useState('Allahabad High Court, Lucknow Bench');
  const [courtType, setCourtType] = useState('HIGH_COURT');
  const [caseCategory, setCaseCategory] = useState('Writ Petition');
  const [petitioner, setPetitioner] = useState('');
  const [respondent, setRespondent] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [previousHearingDate, setPreviousHearingDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [privateNotes, setPrivateNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Inline note & hearing forms inside Case Detail
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [hearingDateInput, setHearingDateInput] = useState('');
  const [hearingPurpose, setHearingPurpose] = useState('');
  const [hearingRoom, setHearingRoom] = useState('');

  const loadCases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (courtFilter !== 'ALL') params.set('courtType', courtFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (upcomingOnly) params.set('upcoming', 'true');
      params.set('archived', String(showArchived));

      const [casesRes, clientsRes] = await Promise.all([
        apiFetch<{ cases: CaseRecord[] }>(`/api/cases?${params.toString()}`),
        apiFetch<{ clients: ClientRecord[] }>('/api/clients?archived=false'),
      ]);
      setCases(casesRes.cases);
      setClients(clientsRes.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [courtFilter, statusFilter, upcomingOnly, showArchived]);

  const loadCaseDetail = async (id: string) => {
    try {
      const res = await apiFetch<{ caseRecord: CaseRecord }>(`/api/cases/${id}`);
      setSelectedCase(res.caseRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open case details.');
    }
  };

  const openCreateModal = () => {
    setEditingCase(null);
    setClientId('');
    setInternalCode(`LKO-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`);
    setTitle('');
    setCaseNumber('');
    setCnrNumber('');
    setCourtName('Allahabad High Court, Lucknow Bench');
    setCourtType('HIGH_COURT');
    setCaseCategory('Writ Petition');
    setPetitioner('');
    setRespondent('');
    setFilingDate('');
    setNextHearingDate('');
    setPreviousHearingDate('');
    setStatus('PENDING');
    setPrivateNotes('');
    setModalOpen(true);
  };

  const openEditModal = (c: CaseRecord) => {
    setEditingCase(c);
    setClientId(c.clientId || '');
    setInternalCode(c.internalCode);
    setTitle(c.title);
    setCaseNumber(c.caseNumber || '');
    setCnrNumber(c.cnrNumber || '');
    setCourtName(c.courtName);
    setCourtType(c.courtType);
    setCaseCategory(c.caseCategory);
    setPetitioner(c.petitioner);
    setRespondent(c.respondent);
    setFilingDate(toISTDateInput(c.filingDate));
    setNextHearingDate(toISTDateTimeLocalInput(c.nextHearingDate));
    setPreviousHearingDate(toISTDateInput(c.previousHearingDate));
    setStatus(c.status);
    setPrivateNotes(c.privateNotes || '');
    setModalOpen(true);
  };

  const handleSaveCase = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        clientId: clientId || null,
        internalCode,
        title,
        caseNumber,
        cnrNumber,
        courtName,
        courtType,
        caseCategory,
        petitioner,
        respondent,
        filingDate: filingDate ? `${filingDate}T00:00:00+05:30` : null,
        nextHearingDate: nextHearingDate ? `${nextHearingDate}:00+05:30` : null,
        previousHearingDate: previousHearingDate ? `${previousHearingDate}T00:00:00+05:30` : null,
        status,
        privateNotes,
      };

      if (editingCase) {
        const res = await apiFetch<{ caseRecord: CaseRecord }>(`/api/cases/${editingCase.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (selectedCase?.id === editingCase.id) {
          await loadCaseDetail(res.caseRecord.id);
        }
      } else {
        await apiFetch('/api/cases', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      await loadCases();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save case.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async (c: CaseRecord) => {
    try {
      await apiFetch(`/api/cases/${c.id}/archive`, { method: 'POST' });
      if (selectedCase?.id === c.id) setSelectedCase(null);
      await loadCases();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to archive case.');
    }
  };

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !noteTitle.trim() || !noteContent.trim()) return;
    try {
      await apiFetch(`/api/cases/${selectedCase.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ title: noteTitle, content: noteContent, isPrivate: true }),
      });
      setNoteTitle('');
      setNoteContent('');
      await loadCaseDetail(selectedCase.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add note.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedCase) return;
    await apiFetch(`/api/cases/${selectedCase.id}/notes/${noteId}`, { method: 'DELETE' });
    await loadCaseDetail(selectedCase.id);
  };

  const handleAddHearingInline = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !hearingDateInput || !hearingPurpose.trim()) return;
    try {
      await apiFetch('/api/hearings', {
        method: 'POST',
        body: JSON.stringify({
          caseId: selectedCase.id,
          hearingDate: `${hearingDateInput}:00+05:30`,
          purpose: hearingPurpose,
          courtRoom: hearingRoom,
          status: 'SCHEDULED',
        }),
      });
      setHearingDateInput('');
      setHearingPurpose('');
      setHearingRoom('');
      await loadCaseDetail(selectedCase.id);
      await loadCases();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add hearing date.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2342]">Case Management · वाद प्रबंधन</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Private chambers case register for High Court, Civil Court, and Revenue matters.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add New Case · नया वाद जोड़ें</span>
          </button>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#0F2342] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Chambers Status vs. Official Court Status:</strong> Status and hearing dates saved here are
            your private diary entries. Always verify official daily cause lists and orders on{' '}
            <span className="font-mono">hclko.allahabadhighcourt.in</span> or{' '}
            <span className="font-mono">services.ecourts.gov.in</span>.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadCases();
            }}
            className="lg:col-span-2 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, case no., CNR, party..."
                className="w-full min-h-[42px] pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
              />
            </div>
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F2342] text-sm font-semibold rounded-lg cursor-pointer"
            >
              Search
            </button>
          </form>

          <select
            aria-label="Filter by court type"
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#0F2342]"
          >
            <option value="ALL">All Courts · सभी न्यायालय</option>
            <option value="HIGH_COURT">High Court</option>
            <option value="CIVIL_COURT">Civil / District Court</option>
            <option value="REVENUE_COURT">Revenue / Tehsil Court</option>
            <option value="TRIBUNAL">Tribunal</option>
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#0F2342]"
          >
            <option value="ALL">All Statuses · सभी स्थिति</option>
            <option value="PENDING">Pending</option>
            <option value="DISPOSED">Disposed</option>
            <option value="STAYED">Stayed</option>
            <option value="RESERVED">Reserved</option>
            <option value="ADJOURNED">Adjourned</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUpcomingOnly((v) => !v)}
              className={`flex-1 min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                upcomingOnly
                  ? 'bg-[#0F2342] text-white border-[#0F2342]'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#0F2342]'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className={`flex-1 min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showArchived
                  ? 'bg-[#9A6F1F] text-white border-[#9A6F1F]'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#0F2342]'
              }`}
            >
              {showArchived ? 'Archived' : 'Archive'}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Case List + Detail Split */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <section className={`${selectedCase ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white border border-slate-200 rounded-xl overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading chambers cases...</div>
          ) : cases.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-base font-semibold text-slate-800">
                {showArchived ? 'No archived cases found.' : 'No matching cases found.'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {showArchived
                  ? 'Cases you archive will appear here.'
                  : 'Click "Add New Case" to record your first matter.'}
              </p>
              {!showArchived && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 min-h-[42px] px-4 py-2 bg-[#0F2342] text-white text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Add First Case
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`p-4 sm:p-5 transition-colors ${
                      isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => loadCaseDetail(c.id)}
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-[#0F2342]">{c.internalCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{COURT_TYPE_LABELS[c.courtType] || c.courtType}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`font-semibold ${
                              c.status === 'PENDING'
                                ? 'text-amber-700'
                                : c.status === 'DISPOSED'
                                  ? 'text-emerald-700'
                                  : 'text-slate-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#0F2342] mt-1">{c.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {c.courtName}
                          {c.caseNumber ? ` · ${c.caseNumber}` : ''}
                          {c.cnrNumber ? ` · CNR: ${c.cnrNumber}` : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 tabular-nums">
                          <span>
                            Next Hearing:{' '}
                            <strong className="text-slate-800">
                              {c.nextHearingDate ? formatISTDateTime(c.nextHearingDate) : 'Not set'}
                            </strong>
                          </span>
                          {c.client && <span>Client: {c.client.fullName}</span>}
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          aria-label={`Edit ${c.title}`}
                          className="min-h-[38px] px-3 py-1.5 border border-slate-200 hover:border-[#0F2342] rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveToggle(c)}
                          aria-label={c.isArchived ? `Restore ${c.title}` : `Archive ${c.title}`}
                          className="min-h-[38px] px-3 py-1.5 border border-slate-200 hover:border-amber-700 rounded-lg text-xs font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {c.isArchived ? (
                            <>
                              <ArchiveRestore className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Restore</span>
                            </>
                          ) : (
                            <>
                              <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Archive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Case Detail Panel */}
        {selectedCase && (
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-mono font-semibold text-[#9A6F1F]">
                  {selectedCase.internalCode} · {selectedCase.status}
                </p>
                <h2 className="text-xl font-bold text-[#0F2342] mt-1">{selectedCase.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{selectedCase.courtName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label="Close case details"
                className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500">Case Number</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  {selectedCase.caseNumber || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">CNR Number</dt>
                <dd className="font-mono font-semibold text-slate-900 mt-0.5">
                  {selectedCase.cnrNumber || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Petitioner / Plaintiff</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedCase.petitioner}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Respondent / Defendant</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{selectedCase.respondent}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Filing Date</dt>
                <dd className="font-medium text-slate-900 mt-0.5 tabular-nums">
                  {formatISTDate(selectedCase.filingDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Next Hearing (IST)</dt>
                <dd className="font-semibold text-[#0F2342] mt-0.5 tabular-nums">
                  {formatISTDateTime(selectedCase.nextHearingDate)}
                </dd>
              </div>
            </dl>

            {selectedCase.privateNotes && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800">Advocate&apos;s Summary Notes</p>
                <p className="text-slate-700 mt-1 whitespace-pre-line">{selectedCase.privateNotes}</p>
              </div>
            )}

            {/* Hearing History & Quick Add */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-sm font-bold text-[#0F2342] flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
                <span>Hearing Dates ({selectedCase.hearings?.length || 0})</span>
              </h3>
              <form onSubmit={handleAddHearingInline} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="datetime-local"
                  required
                  value={hearingDateInput}
                  onChange={(e) => setHearingDateInput(e.target.value)}
                  className="min-h-[40px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  required
                  value={hearingPurpose}
                  onChange={(e) => setHearingPurpose(e.target.value)}
                  placeholder="Purpose (e.g. Arguments)"
                  className="min-h-[40px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-3 py-1.5 bg-[#0F2342] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Add Hearing Date
                </button>
              </form>
              <ul className="divide-y divide-slate-100 text-xs">
                {(selectedCase.hearings || []).map((h) => (
                  <li key={h.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 tabular-nums">
                        {formatISTDateTime(h.hearingDate)}
                      </p>
                      <p className="text-slate-600">{h.purpose}</p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{h.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Private Case Notes */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-sm font-bold text-[#0F2342] flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
                <span>Private Case Notes ({selectedCase.notes?.length || 0})</span>
              </h3>
              <form onSubmit={handleAddNote} className="space-y-2">
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note heading..."
                  className="w-full min-h-[38px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <textarea
                  rows={2}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Confidential legal strategy or client instruction..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="min-h-[38px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F2342] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Save Private Note
                </button>
              </form>
              <ul className="space-y-2">
                {(selectedCase.notes || []).map((n) => (
                  <li key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-[#0F2342]">{n.title}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        aria-label="Delete note"
                        className="text-slate-400 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-700 mt-1 whitespace-pre-line">{n.content}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Linked Documents */}
            {(selectedCase.documents?.length || 0) > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-[#0F2342] flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
                  <span>Attached Documents ({selectedCase.documents?.length})</span>
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {selectedCase.documents?.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between">
                      <span className="text-slate-800 font-medium">{doc.title}</span>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="text-[#0F2342] font-semibold underline"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Add / Edit Case Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0F2342]">
                {editingCase ? 'Edit Case Details' : 'Add New Case · नया वाद जोड़ें'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="mt-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Case ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={internalCode}
                    onChange={(e) => setInternalCode(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Linked Client (Optional)
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Case Title · वाद का शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ram Lal vs. State of U.P."
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Case Number
                  </label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. WRIT-C No. 1234/2026"
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNR Number (16 digits, if available)
                  </label>
                  <input
                    type="text"
                    value={cnrNumber}
                    onChange={(e) => setCnrNumber(e.target.value)}
                    placeholder="e.g. UPLK050003142025"
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Court Type *
                  </label>
                  <select
                    value={courtType}
                    onChange={(e) => setCourtType(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="HIGH_COURT">High Court</option>
                    <option value="CIVIL_COURT">Civil / District Court</option>
                    <option value="REVENUE_COURT">Revenue / Nayab Tehsildar Court</option>
                    <option value="TRIBUNAL">Tribunal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Case Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={caseCategory}
                    onChange={(e) => setCaseCategory(e.target.value)}
                    placeholder="Writ Petition / Civil Suit / Mutation"
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Petitioner / Plaintiff *
                  </label>
                  <input
                    type="text"
                    required
                    value={petitioner}
                    onChange={(e) => setPetitioner(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Respondent / Defendant *
                  </label>
                  <input
                    type="text"
                    required
                    value={respondent}
                    onChange={(e) => setRespondent(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-full min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Previous Hearing
                  </label>
                  <input
                    type="date"
                    value={previousHearingDate}
                    onChange={(e) => setPreviousHearingDate(e.target.value)}
                    className="w-full min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Next Hearing (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={nextHearingDate}
                    onChange={(e) => setNextHearingDate(e.target.value)}
                    className="w-full min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="DISPOSED">Disposed</option>
                    <option value="STAYED">Stayed</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="ADJOURNED">Adjourned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advocate&apos;s Private Notes
                </label>
                <textarea
                  rows={3}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[42px] px-5 py-2 bg-[#0F2342] hover:bg-[#162D54] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCase ? 'Save Changes' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
