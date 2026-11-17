import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password is too long.'),
  name: z.string().trim().min(2, 'Advocate name is required.').max(120),
  enrollmentNo: z.string().trim().max(80).optional().or(z.literal('')),
  chamberAddress: z.string().trim().max(300).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const settingsUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  enrollmentNo: z.string().trim().max(80).nullable().optional(),
  chamberAddress: z.string().trim().max(300).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  reminderLeadMinutes: z.number().int().min(5).max(10080).optional(),
  preferredLanguage: z.enum(['EN_HI', 'EN', 'HI']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export const clientSchema = z.object({
  fullName: z.string().trim().min(2, 'Client full name is required.').max(150),
  fatherOrSpouseName: z.string().trim().max(150).optional().or(z.literal('')),
  phone: z.string().trim().min(6, 'Contact phone number is required.').max(30),
  alternatePhone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email format.').optional().or(z.literal('')),
  address: z.string().trim().max(400).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().default('Lucknow'),
  district: z.string().trim().max(80).optional().default('Lucknow'),
  privateNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const courtTypes = ['HIGH_COURT', 'CIVIL_COURT', 'REVENUE_COURT', 'TRIBUNAL', 'OTHER'] as const;
export const caseStatuses = ['PENDING', 'DISPOSED', 'STAYED', 'RESERVED', 'ADJOURNED'] as const;

export const caseSchema = z.object({
  clientId: z.string().trim().optional().nullable().or(z.literal('')),
  internalCode: z.string().trim().min(2, 'Internal Case ID is required.').max(60),
  title: z.string().trim().min(3, 'Case title is required.').max(250),
  caseNumber: z.string().trim().max(120).optional().or(z.literal('')),
  cnrNumber: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal('')),
  courtName: z.string().trim().min(2, 'Court name is required.').max(200),
  courtType: z.enum(courtTypes),
  caseCategory: z.string().trim().min(2, 'Case category is required.').max(120),
  petitioner: z.string().trim().min(2, 'Petitioner/Plaintiff name is required.').max(200),
  respondent: z.string().trim().min(2, 'Respondent/Defendant name is required.').max(200),
  filingDate: z.string().optional().nullable().or(z.literal('')),
  nextHearingDate: z.string().optional().nullable().or(z.literal('')),
  previousHearingDate: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(caseStatuses).default('PENDING'),
  privateNotes: z.string().trim().max(5000).optional().or(z.literal('')),
});

export const hearingSchema = z.object({
  caseId: z.string().trim().min(1, 'Case selection is required.'),
  hearingDate: z.string().min(1, 'Hearing date and time is required.'),
  courtRoom: z.string().trim().max(120).optional().or(z.literal('')),
  benchOrJudge: z.string().trim().max(150).optional().or(z.literal('')),
  purpose: z.string().trim().min(2, 'Hearing purpose is required.').max(250),
  outcomeNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'ADJOURNED', 'CANCELLED']).default('SCHEDULED'),
});

export const caseNoteSchema = z.object({
  title: z.string().trim().min(2, 'Note title is required.').max(180),
  content: z.string().trim().min(2, 'Note content is required.').max(5000),
  isPrivate: z.boolean().optional().default(true),
});

export const taskSchema = z.object({
  caseId: z.string().trim().optional().nullable().or(z.literal('')),
  clientId: z.string().trim().optional().nullable().or(z.literal('')),
  title: z.string().trim().min(2, 'Task title is required.').max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  dueDate: z.string().min(1, 'Due date is required.'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});

export const reminderSchema = z.object({
  caseId: z.string().trim().optional().nullable().or(z.literal('')),
  hearingId: z.string().trim().optional().nullable().or(z.literal('')),
  taskId: z.string().trim().optional().nullable().or(z.literal('')),
  title: z.string().trim().min(2, 'Reminder title is required.').max(200),
  message: z.string().trim().min(2, 'Reminder message is required.').max(1000),
  remindAt: z.string().min(1, 'Reminder date/time is required.'),
});

export const documentCategories = [
  'PETITION',
  'ORDER',
  'JUDGMENT',
  'KHATAUNI',
  'CERTIFICATE',
  'VAKALATNAMA',
  'EVIDENCE',
  'CORRESPONDENCE',
  'OTHER',
] as const;

export const bookmarkCategories = [
  'HIGH_COURT',
  'CIVIL_COURT',
  'LAND_RECORDS',
  'E_DISTRICT',
  'REVENUE',
  'OTHER',
] as const;

export const bookmarkSchema = z.object({
  title: z.string().trim().min(2, 'Bookmark title is required.').max(160),
  url: z
    .string()
    .trim()
    .url('Please enter a valid URL starting with https:// or http://')
    .refine(
      (val) => val.startsWith('https://') || val.startsWith('http://'),
      'Only HTTP/HTTPS links are permitted.'
    ),
  category: z.enum(bookmarkCategories).default('OTHER'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});
