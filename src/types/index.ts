export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  enrollmentNo: string | null;
  chamberAddress: string | null;
  phone: string | null;
  reminderLeadMinutes: number;
  preferredLanguage: 'EN_HI' | 'EN' | 'HI' | string;
}

export interface PortalLink {
  id: string;
  categoryId: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  url: string;
  officialAgency: string;
  requiredInputsEn: string;
  requiredInputsHi: string;
  safetyNoteEn: string | null;
  safetyNoteHi: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

export interface PortalCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  sortOrder: number;
  links: PortalLink[];
}

export interface ClientRecord {
  id: string;
  fullName: string;
  fatherOrSpouseName: string | null;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  address: string | null;
  city: string;
  district: string;
  privateNotes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cases: number;
    documents: number;
  };
  cases?: CaseRecord[];
  documents?: DocumentRecord[];
}

export interface CaseNoteRecord {
  id: string;
  caseId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface HearingRecord {
  id: string;
  caseId: string;
  hearingDate: string;
  courtRoom: string | null;
  benchOrJudge: string | null;
  purpose: string;
  outcomeNotes: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'ADJOURNED' | 'CANCELLED' | string;
  case?: {
    id: string;
    internalCode?: string;
    title: string;
    caseNumber: string | null;
    courtName: string;
    courtType: string;
    status?: string;
  };
}

export interface CaseRecord {
  id: string;
  clientId: string | null;
  internalCode: string;
  title: string;
  caseNumber: string | null;
  cnrNumber: string | null;
  courtName: string;
  courtType: 'HIGH_COURT' | 'CIVIL_COURT' | 'REVENUE_COURT' | 'TRIBUNAL' | 'OTHER' | string;
  caseCategory: string;
  petitioner: string;
  respondent: string;
  filingDate: string | null;
  nextHearingDate: string | null;
  previousHearingDate: string | null;
  status: 'PENDING' | 'DISPOSED' | 'STAYED' | 'RESERVED' | 'ADJOURNED' | string;
  privateNotes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  hearings?: HearingRecord[];
  notes?: CaseNoteRecord[];
  documents?: DocumentRecord[];
  tasks?: TaskRecord[];
  _count?: {
    hearings: number;
    notes: number;
    documents: number;
    tasks: number;
  };
}

export interface DocumentRecord {
  id: string;
  caseId: string | null;
  clientId: string | null;
  title: string;
  category: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  notes: string | null;
  createdAt: string;
  case?: { id: string; title: string; internalCode: string } | null;
  client?: { id: string; fullName: string } | null;
}

export interface TaskRecord {
  id: string;
  caseId: string | null;
  clientId: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  isCompleted: boolean;
  completedAt: string | null;
  case?: { id: string; title: string; internalCode: string } | null;
  client?: { id: string; fullName: string } | null;
}

export interface ReminderRecord {
  id: string;
  caseId: string | null;
  hearingId: string | null;
  taskId: string | null;
  title: string;
  message: string;
  remindAt: string;
  channel: string;
  isRead: boolean;
  isDismissed: boolean;
  case?: { id: string; title: string; internalCode: string } | null;
}

export interface BookmarkRecord {
  id: string;
  portalLinkId: string | null;
  title: string;
  url: string;
  category: string;
  notes: string | null;
  isOfficial: boolean;
  createdAt: string;
}

export interface DashboardData {
  istDateKey: string;
  metrics: {
    totalCases: number;
    pendingCases: number;
    totalClients: number;
    pendingTasks: number;
    overdueTasks: number;
    todaysHearingsCount: number;
    unreadRemindersCount: number;
  };
  todaysHearings: HearingRecord[];
  upcomingHearings: HearingRecord[];
  activeReminders: ReminderRecord[];
  featuredPortals: (PortalLink & { category: { slug: string; nameEn: string } })[];
  recentServices: { title: string; url: string; accessedAt: string }[];
}

export interface ActivityLogRecord {
  id: string;
  action: string;
  entityType: string | null;
  summary: string;
  createdAt: string;
}

export type DeskSection =
  | 'dashboard'
  | 'court-services'
  | 'cases'
  | 'clients'
  | 'land-records'
  | 'certificates'
  | 'documents'
  | 'calendar'
  | 'tasks'
  | 'bookmarks'
  | 'settings';
