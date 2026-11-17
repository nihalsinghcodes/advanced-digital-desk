import { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { apiFetch, formatISTDate, formatISTTime, getISTDateKey } from '../../lib/api';
import type { CaseRecord, HearingRecord } from '../../types';

interface CalendarViewProps {
  onDataChanged: () => void;
}

export function CalendarView({ onDataChanged }: CalendarViewProps) {
  const [hearings, setHearings] = useState<HearingRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'upcoming'>('month');
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => getISTDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [courtRoom, setCourtRoom] = useState('');
  const [benchOrJudge, setBenchOrJudge] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCalendar = async () => {
    setLoading(true);
    setError('');
    try {
      const [hRes, cRes] = await Promise.all([
        apiFetch<{ hearings: HearingRecord[] }>('/api/hearings'),
        apiFetch<{ cases: CaseRecord[] }>('/api/cases?archived=false'),
      ]);
      setHearings(hRes.hearings);
      setCases(cRes.cases);
      if (cRes.cases.length > 0 && !caseId) {
        setCaseId(cRes.cases[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load hearing calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const handleCreateHearing = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/hearings', {
        method: 'POST',
        body: JSON.stringify({
          caseId,
          hearingDate: `${hearingDate}:00+05:30`,
          courtRoom,
          benchOrJudge,
          purpose,
          status: 'SCHEDULED',
        }),
      });
      setModalOpen(false);
      setPurpose('');
      setCourtRoom('');
      setBenchOrJudge('');
      await loadCalendar();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to schedule hearing.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (h: HearingRecord, status: string) => {
    await apiFetch(`/api/hearings/${h.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadCalendar();
    onDataChanged();
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/hearings/${id}`, { method: 'DELETE' });
    await loadCalendar();
    onDataChanged();
  };

  // Group hearings by IST date key YYYY-MM-DD
  const byDay = hearings.reduce<Record<string, HearingRecord[]>>((acc, h) => {
    const k = getISTDateKey(h.hearingDate);
    if (!acc[k]) acc[k] = [];
    acc[k].push(h);
    return acc;
  }, {});

  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(new Date(year, month, d));

  // Weekly dates around selectedDayKey
  const selectedRef = new Date(`${selectedDayKey}T12:00:00+05:30`);
  const weekStart = new Date(selectedRef);
  weekStart.setDate(selectedRef.getDate() - selectedRef.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const dayHearings = byDay[selectedDayKey] || [];
  const todayKey = getISTDateKey(new Date());
  const upcomingHearings = hearings.filter(
    (h) => getISTDateKey(h.hearingDate) >= todayKey && h.status === 'SCHEDULED'
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2342]">Hearing Calendar · सुनवाई कैलेंडर</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            All hearing dates &amp; timings strictly aligned to Indian Standard Time (Asia/Kolkata).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'month', label: 'Monthly' },
              { id: 'week', label: 'Weekly' },
              { id: 'day', label: 'Daily' },
              { id: 'upcoming', label: 'Upcoming' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id as typeof viewMode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  viewMode === tab.id ? 'bg-white text-[#0F2342] shadow-sm' : 'text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setHearingDate(`${selectedDayKey}T10:30`);
              setModalOpen(true);
            }}
            disabled={cases.length === 0}
            className="min-h-[42px] px-4 py-2 bg-[#0F2342] hover:bg-[#162D54] disabled:opacity-50 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Schedule Hearing</span>
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          Loading hearing schedule...
        </div>
      ) : (
        <>
          {viewMode === 'month' && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0F2342]">
                  {anchorDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setAnchorDate(new Date(year, month - 1, 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setAnchorDate(now);
                      setSelectedDayKey(getISTDateKey(now));
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-[#0F2342] cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setAnchorDate(new Date(year, month + 1, 1))}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} className="min-h-[72px] bg-slate-50/50 rounded-lg" />;
                  const key = `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(
                    cell.getDate()
                  ).padStart(2, '0')}`;
                  const items = byDay[key] || [];
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDayKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDayKey(key)}
                      className={`min-h-[76px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#0F2342] bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span
                        className={`text-xs font-bold tabular-nums inline-flex w-6 h-6 items-center justify-center rounded ${
                          isToday ? 'bg-[#0F2342] text-white' : 'text-slate-700'
                        }`}
                      >
                        {cell.getDate()}
                      </span>
                      {items.length > 0 && (
                        <span className="text-[11px] font-semibold text-[#9A6F1F] tabular-nums truncate">
                          {items.length} hearing{items.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {viewMode === 'week' && (
            <section className="grid sm:grid-cols-7 gap-3">
              {weekDays.map((d) => {
                const key = getISTDateKey(d);
                const items = byDay[key] || [];
                const isSelected = key === selectedDayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDayKey(key)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected ? 'border-[#0F2342] bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs text-slate-500">
                      {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className="text-base font-bold text-[#0F2342] tabular-nums">
                      {d.getDate()} {d.toLocaleDateString('en-IN', { month: 'short' })}
                    </p>
                    <p className="text-xs text-[#9A6F1F] font-semibold mt-2 tabular-nums">
                      {items.length} Hearing(s)
                    </p>
                  </button>
                );
              })}
            </section>
          )}

          {(viewMode === 'month' || viewMode === 'week' || viewMode === 'day') && (
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#0F2342]">
                  Schedule for {formatISTDate(`${selectedDayKey}T12:00:00+05:30`)} (IST)
                </h2>
                {viewMode === 'day' && (
                  <input
                    type="date"
                    value={selectedDayKey}
                    onChange={(e) => setSelectedDayKey(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>

              {dayHearings.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No hearings recorded for this date.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dayHearings.map((h) => (
                    <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#9A6F1F] tabular-nums">
                          {formatISTTime(h.hearingDate)} IST · {h.status}
                          {h.courtRoom ? ` · ${h.courtRoom}` : ''}
                        </p>
                        <p className="text-sm font-bold text-[#0F2342] mt-0.5">{h.case?.title}</p>
                        <p className="text-xs text-slate-600">
                          {h.case?.courtName} · Purpose: {h.purpose}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label="Hearing status"
                          value={h.status}
                          onChange={(e) => handleStatusChange(h, e.target.value)}
                          className="min-h-[36px] px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="ADJOURNED">Adjourned</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id)}
                          aria-label="Delete hearing"
                          className="p-2 border border-slate-200 hover:border-red-600 rounded-lg text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {viewMode === 'upcoming' && (
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-bold text-[#0F2342] mb-4">
                All Upcoming Scheduled Hearings ({upcomingHearings.length})
              </h2>
              {upcomingHearings.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No upcoming hearings scheduled.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingHearings.map((h) => (
                    <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-[#9A6F1F] tabular-nums">
                          {formatISTDate(h.hearingDate)} · {formatISTTime(h.hearingDate)} IST
                        </p>
                        <p className="text-sm font-bold text-[#0F2342] mt-0.5">{h.case?.title}</p>
                        <p className="text-xs text-slate-600">
                          {h.case?.courtName} · {h.purpose}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{h.case?.caseNumber || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0F2342]">Schedule Hearing Date</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHearing} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Case *</label>
                <select
                  required
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.internalCode} · {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hearing Date &amp; Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Arguments / Evidence / Admission"
                  className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Court Room</label>
                  <input
                    type="text"
                    value={courtRoom}
                    onChange={(e) => setCourtRoom(e.target.value)}
                    placeholder="Court No. 14"
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bench / Judge</label>
                  <input
                    type="text"
                    value={benchOrJudge}
                    onChange={(e) => setBenchOrJudge(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[40px] px-4 py-2 bg-[#0F2342] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Hearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
