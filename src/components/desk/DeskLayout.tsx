import { useState } from 'react';
import {
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  CheckSquare,
  FileBadge,
  FileText,
  Home,
  Landmark,
  LogOut,
  Menu,
  Scale,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { getISTTodayFullLabel } from '../../lib/api';
import type { DeskSection, User } from '../../types';

interface DeskLayoutProps {
  user: User;
  activeSection: DeskSection;
  unreadRemindersCount: number;
  onSelectSection: (section: DeskSection) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: DeskSection;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'मुख्य डैशबोर्ड', icon: Home },
  { id: 'court-services', labelEn: 'Court Services', labelHi: 'न्यायालय सेवाएँ', icon: Scale },
  { id: 'cases', labelEn: 'Case Management', labelHi: 'वाद प्रबंधन', icon: Briefcase },
  { id: 'clients', labelEn: 'Client Management', labelHi: 'मुवक्किल प्रबंधन', icon: Users },
  { id: 'land-records', labelEn: 'UP Land Records', labelHi: 'उ.प्र. भूलेख व राजस्व', icon: Landmark },
  { id: 'certificates', labelEn: 'Govt. Certificates', labelHi: 'ई-डिस्ट्रिक्ट प्रमाणपत्र', icon: FileBadge },
  { id: 'documents', labelEn: 'Document Vault', labelHi: 'दस्तावेज़ प्रबंधन', icon: FileText },
  { id: 'calendar', labelEn: 'Hearing Calendar', labelHi: 'सुनवाई कैलेंडर', icon: Calendar },
  { id: 'tasks', labelEn: 'Tasks & Reminders', labelHi: 'कार्य व रिमाइंडर', icon: CheckSquare },
  { id: 'bookmarks', labelEn: 'Important Websites', labelHi: 'महत्वपूर्ण वेबसाइट्स', icon: Bookmark },
  { id: 'settings', labelEn: 'Settings & Security', labelHi: 'सेटिंग्स एवं सुरक्षा', icon: Settings },
];

export function DeskLayout({
  user,
  activeSection,
  unreadRemindersCount,
  onSelectSection,
  onLogout,
  children,
}: DeskLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentItem = NAV_ITEMS.find((n) => n.id === activeSection) || NAV_ITEMS[0];
  const istToday = getISTTodayFullLabel();

  const handleNavClick = (id: DeskSection) => {
    onSelectSection(id);
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F2342] text-white">
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-white truncate">
            Advocate Digital Desk
          </p>
          <p className="text-xs text-[#D4AF37] truncate mt-0.5">Uttar Pradesh Chambers</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Chambers Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 min-h-[44px] rounded-lg text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0F2342] font-semibold'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#9A6F1F]' : 'text-slate-300'}`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-sm leading-tight truncate">{item.labelEn}</span>
                  <span
                    className={`block text-[11px] leading-tight truncate mt-0.5 ${
                      isActive ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {item.labelHi}
                  </span>
                </span>
              </span>
              {item.id === 'tasks' && unreadRemindersCount > 0 && (
                <span
                  className={`text-xs font-mono tabular-nums font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#0F2342] text-white' : 'bg-[#C59B3B] text-[#0F2342]'
                  }`}
                >
                  {unreadRemindersCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="text-xs text-slate-300 leading-snug">
          <p className="font-semibold text-white truncate">{user.name}</p>
          {user.enrollmentNo && (
            <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
              {user.enrollmentNo}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out · लॉगआउट</span>
        </button>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Private chambers productivity workspace. Not an official court or government website.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[268px] shrink-0 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full z-10">{renderSidebarContent()}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-[#0F2342] hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#0F2342] truncate">
                <span>{currentItem.labelEn}</span>
                <span aria-hidden="true" className="text-slate-300">/</span>
                <span className="font-medium text-slate-600 truncate">{currentItem.labelHi}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden md:inline text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
              {istToday} (IST)
            </span>
            <button
              type="button"
              onClick={() => onSelectSection('tasks')}
              aria-label={`Tasks and Reminders (${unreadRemindersCount} unread)`}
              className="min-h-[40px] px-3 py-1.5 border border-slate-200 hover:border-[#0F2342] rounded-lg text-xs font-semibold text-[#0F2342] inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#9A6F1F]" aria-hidden="true" />
              <span className="tabular-nums">
                {unreadRemindersCount > 0 ? `${unreadRemindersCount} Reminders` : 'Reminders'}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
