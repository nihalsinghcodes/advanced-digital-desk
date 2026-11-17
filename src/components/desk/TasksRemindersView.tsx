import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Bell, Check, CheckCircle2, Info, Plus, Trash2, X } from 'lucide-react';
import { apiFetch, formatISTDateTime } from '../../lib/api';
import type { CaseRecord, ReminderRecord, TaskRecord } from '../../types';

interface TasksRemindersViewProps {
  onDataChanged: () => void;
}

export function TasksRemindersView({ onDataChanged }: TasksRemindersViewProps) {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskCaseId, setTaskCaseId] = useState('');

  // Reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remMessage, setRemMessage] = useState('');
  const [remAt, setRemAt] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, rRes, cRes] = await Promise.all([
        apiFetch<{ tasks: TaskRecord[] }>(`/api/tasks?status=${taskFilter}`),
        apiFetch<{ reminders: ReminderRecord[] }>('/api/reminders'),
        apiFetch<{ cases: CaseRecord[] }>('/api/cases?archived=false'),
      ]);
      setTasks(tRes.tasks);
      setReminders(rRes.reminders);
      setCases(cRes.cases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tasks and reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskFilter]);

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle,
          dueDate: `${taskDueDate}:00+05:30`,
          priority: taskPriority,
          caseId: taskCaseId || null,
        }),
      });
      setTaskTitle('');
      setTaskDueDate('');
      setTaskCaseId('');
      await loadData();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task.');
    }
  };

  const handleToggleTask = async (t: TaskRecord) => {
    await apiFetch(`/api/tasks/${t.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: !t.isCompleted }),
    });
    await loadData();
    onDataChanged();
  };

  const handleDeleteTask = async (id: string) => {
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await loadData();
    onDataChanged();
  };

  const handleAddReminder = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title: remTitle,
          message: remMessage,
          remindAt: `${remAt}:00+05:30`,
        }),
      });
      setRemTitle('');
      setRemMessage('');
      setRemAt('');
      await loadData();
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save reminder.');
    }
  };

  const handleMarkReminderRead = async (r: ReminderRecord) => {
    await apiFetch(`/api/reminders/${r.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: !r.isRead }),
    });
    await loadData();
    onDataChanged();
  };

  const handleDismissReminder = async (id: string) => {
    await apiFetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isDismissed: true }),
    });
    await loadData();
    onDataChanged();
  };

  const nowMs = Date.now();

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#0F2342]">
          Tasks &amp; In-App Reminders · कार्य एवं रिमाइंडर
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Track court filing deadlines, affidavit preparations, and in-app hearing reminders in IST (Asia/Kolkata).
        </p>
        <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#0F2342] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Reminders appear inside this dashboard when you sign in. External SMS, WhatsApp, or email notifications
            are not enabled on this local deployment unless configured with an authorised mail/SMS provider.
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Tasks Column */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#0F2342]">Chambers Tasks · कार्य सूची</h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'completed', label: 'Done' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTaskFilter(tab.id as typeof taskFilter)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    taskFilter === tab.id ? 'bg-white text-[#0F2342] shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="New task (e.g. File Vakalatnama / Apply Certified Copy)"
                className="sm:col-span-2 min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
              <input
                type="datetime-local"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              />
              <div className="flex gap-2">
                <select
                  aria-label="Task priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="flex-1 min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select
                  aria-label="Link case"
                  value={taskCaseId}
                  onChange={(e) => setTaskCaseId(e.target.value)}
                  className="flex-1 min-h-[42px] px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">No Case Link</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.internalCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 bg-[#0F2342] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </form>

          {loading ? (
            <p className="text-sm text-slate-500 py-4 text-center">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No tasks in this view.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {tasks.map((t) => {
                const isOverdue = !t.isCompleted && new Date(t.dueDate).getTime() < nowMs;
                return (
                  <li key={t.id} className="py-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t)}
                        aria-label={t.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        className={`mt-0.5 w-6 h-6 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          t.isCompleted
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'border-slate-300 hover:border-[#0F2342] bg-white'
                        }`}
                      >
                        {t.isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            t.isCompleted ? 'line-through text-slate-400' : 'text-[#0F2342]'
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs mt-1 tabular-nums">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 font-bold text-red-700">
                              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                              OVERDUE · Due {formatISTDateTime(t.dueDate)}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Due {formatISTDateTime(t.dueDate)}
                            </span>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600">{t.priority}</span>
                          {t.case && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[#0F2342]">{t.case.internalCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      aria-label={`Delete ${t.title}`}
                      className="p-2 text-slate-400 hover:text-red-700 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Reminders Column */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-[#0F2342] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#9A6F1F]" aria-hidden="true" />
            <span>In-App Reminders · रिमाइंडर</span>
          </h2>

          <form onSubmit={handleAddReminder} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder="Reminder title..."
              className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
            />
            <input
              type="text"
              required
              value={remMessage}
              onChange={(e) => setRemMessage(e.target.value)}
              placeholder="Reminder details..."
              className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
            />
            <div className="flex gap-2">
              <input
                type="datetime-local"
                required
                value={remAt}
                onChange={(e) => setRemAt(e.target.value)}
                className="flex-1 min-h-[40px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-1.5 bg-[#0F2342] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>

          {reminders.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No active reminders.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {reminders.map((r) => (
                <li key={r.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold ${r.isRead ? 'text-slate-500' : 'text-[#0F2342]'}`}>
                      {r.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMarkReminderRead(r)}
                        aria-label={r.isRead ? 'Mark unread' : 'Mark read'}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissReminder(r.id)}
                        aria-label="Dismiss reminder"
                        className="p-1.5 text-slate-400 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{r.message}</p>
                  <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {formatISTDateTime(r.remindAt)} · {r.isRead ? 'Read' : 'Unread'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
