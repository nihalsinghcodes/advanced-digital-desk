import { FormEvent, useEffect, useState } from 'react';
import { Database, Download, KeyRound, ShieldCheck } from 'lucide-react';
import { apiFetch, formatISTDateTime } from '../../lib/api';
import type { ActivityLogRecord, User } from '../../types';

interface SettingsViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export function SettingsView({ user, onUserUpdated }: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [enrollmentNo, setEnrollmentNo] = useState(user.enrollmentNo || '');
  const [chamberAddress, setChamberAddress] = useState(user.chamberAddress || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(user.reminderLeadMinutes || 60);
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage || 'EN_HI');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [logs, setLogs] = useState<ActivityLogRecord[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ logs: ActivityLogRecord[] }>('/api/auth/activity')
      .then((res) => setLogs(res.logs))
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          enrollmentNo,
          chamberAddress,
          phone,
          reminderLeadMinutes: Number(reminderLeadMinutes),
          preferredLanguage,
        }),
      });
      onUserUpdated(res.user);
      setMessage('Chambers profile and reminder preferences saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiFetch('/api/auth/settings', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password updated securely.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#0F2342]">
          Settings, Backup &amp; Security · सेटिंग्स एवं सुरक्षा
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your advocate profile, in-app reminder timing, password security, and private chambers data backup.
        </p>
      </section>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          {message}
        </div>
      )}
      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Profile & Preferences */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0F2342] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#9A6F1F]" aria-hidden="true" />
            <span>Advocate Profile &amp; Reminder Preferences</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bar Council Enrollment No.
              </label>
              <input
                type="text"
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chamber Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chamber Address</label>
            <input
              type="text"
              value={chamberAddress}
              onChange={(e) => setChamberAddress(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Hearing Reminder Lead Time
              </label>
              <select
                value={reminderLeadMinutes}
                onChange={(e) => setReminderLeadMinutes(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value={30}>30 minutes before hearing</option>
                <option value={60}>1 hour before hearing</option>
                <option value={180}>3 hours before hearing</option>
                <option value={720}>12 hours before hearing</option>
                <option value={1440}>24 hours (1 day) before hearing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Language Preference
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="EN_HI">English + हिन्दी (Bilingual)</option>
                <option value="EN">English Primary</option>
                <option value="HI">हिन्दी Primary</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="min-h-[42px] px-5 py-2 bg-[#0F2342] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Save Profile Settings
          </button>
        </form>

        {/* Password & Backup */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handlePasswordChange} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-bold text-[#0F2342] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
              <span>Change Desk Password</span>
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[40px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F2342] text-xs font-semibold rounded-lg cursor-pointer"
            >
              Update Password
            </button>
          </form>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-bold text-[#0F2342] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
              <span>Chambers Backup &amp; Export</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download a full JSON export of your clients, cases, notes, hearings, tasks, reminders, and bookmarks.
              For full SQLite/PostgreSQL database backup commands, see <span className="font-mono">DEPLOYMENT.md</span>.
            </p>
            <a
              href="/api/auth/export"
              className="w-full min-h-[42px] px-4 py-2 bg-[#0F2342] hover:bg-[#162D54] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Chambers Backup (JSON)</span>
            </a>
          </section>
        </div>
      </div>

      {/* Activity Log */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-bold text-[#0F2342] mb-3">
          Recent Security &amp; Chambers Activity Log · हाल की गतिविधि
        </h2>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-semibold">Date &amp; Time (IST)</th>
                  <th className="py-2 pr-4 font-semibold">Action</th>
                  <th className="py-2 font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-4 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {formatISTDateTime(log.createdAt)}
                    </td>
                    <td className="py-2 pr-4 font-mono font-semibold text-[#0F2342] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2 text-slate-700">{log.summary.replace('|||', ' → ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
