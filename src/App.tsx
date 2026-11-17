import { useCallback, useEffect, useState } from 'react';
import { AuthPages } from './components/AuthPages';
import { PublicLanding } from './components/PublicLanding';
import { BookmarksView } from './components/desk/BookmarksView';
import { CalendarView } from './components/desk/CalendarView';
import { CasesView } from './components/desk/CasesView';
import { CertificatesView } from './components/desk/CertificatesView';
import { ClientsView } from './components/desk/ClientsView';
import { CourtServicesView } from './components/desk/CourtServicesView';
import { DashboardView } from './components/desk/DashboardView';
import { DeskLayout } from './components/desk/DeskLayout';
import { DocumentsView } from './components/desk/DocumentsView';
import { LandRecordsView } from './components/desk/LandRecordsView';
import { SettingsView } from './components/desk/SettingsView';
import { TasksRemindersView } from './components/desk/TasksRemindersView';
import { apiFetch } from './lib/api';
import type { DashboardData, DeskSection, PortalCategory, User } from './types';

function setRobotsMeta(noindex: boolean) {
  let meta = document.querySelector('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [section, setSection] = useState<DeskSection>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [portalCategories, setPortalCategories] = useState<PortalCategory[]>([]);

  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load current session and official portal directory on boot
  useEffect(() => {
    Promise.all([
      apiFetch<{ user: User }>('/api/auth/me')
        .then((res) => setUser(res.user))
        .catch(() => setUser(null)),
      apiFetch<{ categories: PortalCategory[] }>('/api/portals')
        .then((res) => setPortalCategories(res.categories))
        .catch(() => {}),
    ]).finally(() => setAuthChecked(true));
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setDashboardLoading(true);
    try {
      const res = await apiFetch<DashboardData>('/api/dashboard');
      setDashboardData(res);
    } catch {
      // handled gracefully
    } finally {
      setDashboardLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  // Dynamic SEO title & robots meta for public vs private pages
  useEffect(() => {
    const isPrivate =
      pathname.startsWith('/desk') || pathname === '/login' || pathname === '/register';
    setRobotsMeta(isPrivate);

    if (pathname === '/') {
      document.title = 'Advocate Digital Desk – Uttar Pradesh | All Essential Legal Services in One Place';
    } else if (pathname === '/login') {
      document.title = 'Sign In | Advocate Digital Desk – Uttar Pradesh';
    } else if (pathname === '/register') {
      document.title = 'Create Chambers Account | Advocate Digital Desk – Uttar Pradesh';
    } else {
      document.title = 'Chambers Desk | Advocate Digital Desk – Uttar Pradesh';
    }
  }, [pathname]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setSection('dashboard');
    navigate('/desk');
  };

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setDashboardData(null);
    navigate('/');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Loading Advocate Digital Desk...</p>
      </div>
    );
  }

  // Protected /desk route guard
  if (pathname.startsWith('/desk')) {
    if (!user) {
      return <AuthPages mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }

    return (
      <DeskLayout
        user={user}
        activeSection={section}
        unreadRemindersCount={dashboardData?.metrics.unreadRemindersCount ?? 0}
        onSelectSection={setSection}
        onLogout={handleLogout}
      >
        {section === 'dashboard' && (
          <DashboardView
            user={user}
            data={dashboardData}
            loading={dashboardLoading}
            onNavigateSection={setSection}
            onRefresh={loadDashboard}
          />
        )}
        {section === 'court-services' && (
          <CourtServicesView categories={portalCategories} onPortalOpened={loadDashboard} />
        )}
        {section === 'cases' && <CasesView onDataChanged={loadDashboard} />}
        {section === 'clients' && <ClientsView onDataChanged={loadDashboard} />}
        {section === 'land-records' && (
          <LandRecordsView categories={portalCategories} onPortalOpened={loadDashboard} />
        )}
        {section === 'certificates' && (
          <CertificatesView categories={portalCategories} onPortalOpened={loadDashboard} />
        )}
        {section === 'documents' && <DocumentsView />}
        {section === 'calendar' && <CalendarView onDataChanged={loadDashboard} />}
        {section === 'tasks' && <TasksRemindersView onDataChanged={loadDashboard} />}
        {section === 'bookmarks' && <BookmarksView />}
        {section === 'settings' && <SettingsView user={user} onUserUpdated={setUser} />}
      </DeskLayout>
    );
  }

  if (pathname === '/login') {
    if (user) {
      navigate('/desk');
      return null;
    }
    return <AuthPages mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
  }

  if (pathname === '/register') {
    if (user) {
      navigate('/desk');
      return null;
    }
    return <AuthPages mode="register" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
  }

  return <PublicLanding onNavigate={navigate} isAuthenticated={Boolean(user)} />;
}
