import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Users,
} from 'lucide-react';
import { formatISTDate, formatISTDateTime, formatISTTime, getISTTodayFullLabel, openAndTrackOfficialPortal } from '../../lib/api';
import type { DashboardData, DeskSection, User } from '../../types';

interface DashboardViewProps {
  user: User;
  data: DashboardData | null;
  loading: boolean;
  onNavigateSection: (section: DeskSection) => void;
  onRefresh: () => void;
}

export function DashboardView({
  user,
  data,
  loading,
  onNavigateSection,
  onRefresh,
}: DashboardViewProps) {
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white border border-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-white border border-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-[#9A6F1F]">
            {getISTTodayFullLabel()} · Indian Standard Time (IST)
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2342] mt-1">
            Namaste, {user.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Manage your Lucknow High Court, Civil Court, and Tehsil matters, check today’s hearings,
            and open official government websites directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateSection('cases')}
            className="min-h-[44px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add / View Cases</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('court-services')}
            className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-slate-50 text-[#0F2342] border border-slate-300 text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Open Court Portals</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Key Metrics Strip */}
      <section aria-label="Chambers Summary">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigateSection('calendar')}
            className="text-left bg-white border border-slate-200 hover:border-[#0F2342]/40 rounded-xl p-5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Today&apos;s Hearings · आज की सुनवाई</span>
              <Calendar className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-[#0F2342] tabular-nums mt-2">
              {metrics?.todaysHearingsCount ?? 0}
            </p>
            <p className="text-xs text-slate-600 mt-1">Scheduled for today (IST)</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('cases')}
            className="text-left bg-white border border-slate-200 hover:border-[#0F2342]/40 rounded-xl p-5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Saved Cases · कुल वाद</span>
              <Briefcase className="w-4 h-4 text-[#0F2342]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-[#0F2342] tabular-nums mt-2">
              {metrics?.totalCases ?? 0}
            </p>
            <p className="text-xs text-slate-600 mt-1 tabular-nums">
              {metrics?.pendingCases ?? 0} pending in chambers
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('clients')}
            className="text-left bg-white border border-slate-200 hover:border-[#0F2342]/40 rounded-xl p-5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Clients · कुल मुवक्किल</span>
              <Users className="w-4 h-4 text-[#0F2342]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-[#0F2342] tabular-nums mt-2">
              {metrics?.totalClients ?? 0}
            </p>
            <p className="text-xs text-slate-600 mt-1">Active client records</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('tasks')}
            className="text-left bg-white border border-slate-200 hover:border-[#0F2342]/40 rounded-xl p-5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Pending Tasks · लंबित कार्य</span>
              {(metrics?.overdueTasks ?? 0) > 0 ? (
                <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              )}
            </div>
            <p className="text-3xl font-bold text-[#0F2342] tabular-nums mt-2">
              {metrics?.pendingTasks ?? 0}
            </p>
            <p
              className={`text-xs mt-1 tabular-nums font-medium ${
                (metrics?.overdueTasks ?? 0) > 0 ? 'text-red-700' : 'text-slate-600'
              }`}
            >
              {(metrics?.overdueTasks ?? 0) > 0
                ? `${metrics?.overdueTasks} overdue task(s)`
                : 'No overdue tasks'}
            </p>
          </button>
        </div>
      </section>

      {/* Quick-Access Official Government Portals */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F2342]">
              Quick-Access Official Government Portals · प्रमुख आधिकारिक पोर्टल
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              External Official Websites — Opens the genuine government or court website in a new tab.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('court-services')}
            className="text-sm font-semibold text-[#0F2342] hover:underline whitespace-nowrap cursor-pointer"
          >
            View All Official Services →
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data?.featuredPortals || []).map((portal) => (
            <button
              key={portal.id}
              type="button"
              onClick={() => {
                openAndTrackOfficialPortal(portal.titleEn, portal.url, portal.id, true);
                setTimeout(onRefresh, 400);
              }}
              className="text-left p-4 rounded-lg border border-slate-200 hover:border-[#0F2342] hover:bg-slate-50 transition-colors flex flex-col justify-between min-h-[104px] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#9A6F1F] font-semibold">
                  <span>External Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-[#0F2342] mt-1.5 leading-snug">
                  {portal.titleEn}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{portal.titleHi}</p>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-2 truncate">
                {portal.url.replace(/^https?:\/\//, '')}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Two-Column Split: Today's Hearings + Reminders & Upcoming */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Today & Upcoming Hearings */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0F2342]">
                Today&apos;s &amp; Upcoming Hearings · आज और आगामी सुनवाई
              </h2>
              <p className="text-xs text-slate-500">All timings shown in Indian Standard Time (IST)</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('calendar')}
              className="text-xs font-semibold text-[#0F2342] hover:underline cursor-pointer"
            >
              Full Calendar →
            </button>
          </div>

          {(data?.todaysHearings?.length || 0) === 0 && (data?.upcomingHearings?.length || 0) === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-700">No hearings scheduled for the next 7 days.</p>
              <p className="text-xs text-slate-500 mt-1">
                Add a case or schedule a hearing date to see reminders here.
              </p>
              <button
                type="button"
                onClick={() => onNavigateSection('calendar')}
                className="mt-3 min-h-[40px] px-4 py-2 bg-[#0F2342] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Schedule Hearing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(data?.todaysHearings || []).map((h) => (
                <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#9A6F1F]">
                      <span>TODAY (IST)</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatISTTime(h.hearingDate)}</span>
                      {h.courtRoom && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{h.courtRoom}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#0F2342] mt-1">{h.case?.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {h.case?.courtName} {h.case?.caseNumber ? `· ${h.case.caseNumber}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Purpose: {h.purpose}</p>
                  </div>
                </div>
              ))}

              {(data?.upcomingHearings || []).map((h) => (
                <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span className="font-semibold text-slate-700">{formatISTDate(h.hearingDate)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatISTTime(h.hearingDate)}</span>
                      {h.courtRoom && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{h.courtRoom}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#0F2342] mt-1">{h.case?.title}</p>
                    <p className="text-xs text-slate-600">
                      {h.case?.courtName} · {h.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Reminders & Recently Accessed Services */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#0F2342] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
                <span>In-App Reminders · रिमाइंडर</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigateSection('tasks')}
                className="text-xs font-semibold text-[#0F2342] hover:underline cursor-pointer"
              >
                Manage All →
              </button>
            </div>
            {(data?.activeReminders?.length || 0) === 0 ? (
              <p className="text-xs text-slate-500 py-4">No active reminders at the moment.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(data?.activeReminders || []).slice(0, 4).map((r) => (
                  <li key={r.id} className="py-3">
                    <p className="text-sm font-semibold text-[#0F2342]">{r.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{r.message}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1 tabular-nums">
                      {formatISTDateTime(r.remindAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#0F2342] flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Recently Accessed Portals · हाल ही में खोले गए</span>
              </h2>
            </div>
            {(data?.recentServices?.length || 0) === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                Portals you open from this desk will appear here for quick repeat access.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(data?.recentServices || []).map((svc) => (
                  <li key={svc.url + svc.accessedAt} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F2342] truncate">{svc.title}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {formatISTDateTime(svc.accessedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAndTrackOfficialPortal(svc.title, svc.url, undefined, true)}
                      className="min-h-[36px] px-3 py-1.5 border border-slate-200 hover:border-[#0F2342] rounded-lg text-xs font-semibold text-[#0F2342] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
