import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { getISTDayBounds } from '../lib/ist.ts';

const router = Router();

// Public/shared official portal directory
router.get('/portals', async (_req, res) => {
  const categories = await prisma.portalCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      links: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  res.json({ categories });
});

// Track recently accessed official portals for authenticated advocate
router.post('/portals/track', requireAuth, async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    title: z.string().min(1).max(200),
    url: z.string().url(),
    portalLinkId: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid portal tracking payload.' });
    return;
  }

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'PORTAL_OPEN',
      entityType: 'PORTAL_LINK',
      entityId: parsed.data.portalLinkId || parsed.data.url,
      summary: `${parsed.data.title}|||${parsed.data.url}`,
      ipAddress: req.ip || null,
    },
  });

  res.json({ ok: true });
});

router.get('/dashboard', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const { start: todayStart, end: todayEnd, dateKey } = getISTDayBounds(now);
  const nextWeekEnd = new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalCases,
    pendingCases,
    totalClients,
    pendingTasks,
    overdueTasks,
    todaysHearings,
    upcomingHearings,
    activeReminders,
    featuredPortals,
    recentPortalLogs,
  ] = await Promise.all([
    prisma.case.count({ where: { userId, isArchived: false } }),
    prisma.case.count({ where: { userId, isArchived: false, status: 'PENDING' } }),
    prisma.client.count({ where: { userId, isArchived: false } }),
    prisma.task.count({ where: { userId, isCompleted: false } }),
    prisma.task.count({ where: { userId, isCompleted: false, dueDate: { lt: now } } }),
    prisma.hearing.findMany({
      where: {
        userId,
        hearingDate: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        case: {
          select: { id: true, title: true, caseNumber: true, courtName: true, courtType: true },
        },
      },
      orderBy: { hearingDate: 'asc' },
    }),
    prisma.hearing.findMany({
      where: {
        userId,
        hearingDate: { gt: todayEnd, lte: nextWeekEnd },
        status: 'SCHEDULED',
      },
      include: {
        case: {
          select: { id: true, title: true, caseNumber: true, courtName: true, courtType: true },
        },
      },
      orderBy: { hearingDate: 'asc' },
      take: 8,
    }),
    prisma.reminder.findMany({
      where: {
        userId,
        isDismissed: false,
      },
      include: {
        case: {
          select: { id: true, title: true, caseNumber: true },
        },
      },
      orderBy: [{ isRead: 'asc' }, { remindAt: 'asc' }],
      take: 10,
    }),
    prisma.portalLink.findMany({
      where: { isFeatured: true },
      include: { category: { select: { slug: true, nameEn: true } } },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }),
    prisma.activityLog.findMany({
      where: { userId, action: 'PORTAL_OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ]);

  // Deduplicate recently accessed portals
  const seenUrls = new Set<string>();
  const recentServices: { title: string; url: string; accessedAt: string }[] = [];
  for (const log of recentPortalLogs) {
    const [title, url] = log.summary.split('|||');
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      recentServices.push({
        title: title || url,
        url,
        accessedAt: log.createdAt.toISOString(),
      });
    }
    if (recentServices.length >= 5) break;
  }

  res.json({
    istDateKey: dateKey,
    metrics: {
      totalCases,
      pendingCases,
      totalClients,
      pendingTasks,
      overdueTasks,
      todaysHearingsCount: todaysHearings.length,
      unreadRemindersCount: activeReminders.filter((r) => !r.isRead).length,
    },
    todaysHearings,
    upcomingHearings,
    activeReminders,
    featuredPortals,
    recentServices,
  });
});

export default router;
