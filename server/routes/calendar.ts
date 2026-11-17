import { Router } from 'express';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { hearingSchema, reminderSchema, taskSchema } from '../lib/validation.ts';

const router = Router();
router.use(requireAuth);

// --- HEARINGS ---
router.get('/hearings', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const from = typeof req.query.from === 'string' ? new Date(req.query.from) : null;
  const to = typeof req.query.to === 'string' ? new Date(req.query.to) : null;
  const caseId = typeof req.query.caseId === 'string' ? req.query.caseId : null;

  const where: Record<string, unknown> = { userId };
  if (caseId) where.caseId = caseId;
  if (from || to) {
    where.hearingDate = {
      ...(from && !isNaN(from.getTime()) ? { gte: from } : {}),
      ...(to && !isNaN(to.getTime()) ? { lte: to } : {}),
    };
  }

  const hearings = await prisma.hearing.findMany({
    where,
    include: {
      case: {
        select: {
          id: true,
          internalCode: true,
          title: true,
          caseNumber: true,
          courtName: true,
          courtType: true,
          status: true,
        },
      },
    },
    orderBy: { hearingDate: 'asc' },
  });

  res.json({ hearings });
});

router.post('/hearings', async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = hearingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid hearing data.' });
      return;
    }

    const userId = req.user!.id;
    const d = parsed.data;
    const targetCase = await prisma.case.findFirst({ where: { id: d.caseId, userId } });
    if (!targetCase) {
      res.status(404).json({ error: 'Selected case not found.' });
      return;
    }

    const hearingDate = new Date(d.hearingDate);
    if (isNaN(hearingDate.getTime())) {
      res.status(400).json({ error: 'Invalid hearing date format.' });
      return;
    }

    const hearing = await prisma.hearing.create({
      data: {
        userId,
        caseId: targetCase.id,
        hearingDate,
        courtRoom: d.courtRoom || null,
        benchOrJudge: d.benchOrJudge || null,
        purpose: d.purpose,
        outcomeNotes: d.outcomeNotes || null,
        status: d.status,
      },
      include: {
        case: { select: { id: true, title: true, caseNumber: true, courtName: true, courtType: true } },
      },
    });

    // Keep case nextHearingDate synchronized if scheduled in future or newer
    if (d.status === 'SCHEDULED') {
      await prisma.case.update({
        where: { id: targetCase.id },
        data: {
          previousHearingDate: targetCase.nextHearingDate,
          nextHearingDate: hearingDate,
        },
      });

      const leadMs = req.user!.reminderLeadMinutes * 60 * 1000;
      await prisma.reminder.create({
        data: {
          userId,
          caseId: targetCase.id,
          hearingId: hearing.id,
          title: `Hearing Reminder: ${targetCase.title}`,
          message: `${d.purpose} — ${targetCase.courtName}`,
          remindAt: new Date(hearingDate.getTime() - leadMs),
          channel: 'IN_APP',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'HEARING_CREATE',
        entityType: 'HEARING',
        entityId: hearing.id,
        summary: `Scheduled hearing for ${targetCase.internalCode}`,
        ipAddress: req.ip || null,
      },
    });

    res.status(201).json({ hearing });
  } catch (err) {
    console.error('Create hearing error:', err);
    res.status(500).json({ error: 'Unable to schedule hearing.' });
  }
});

router.patch('/hearings/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.hearing.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Hearing not found.' });
    return;
  }

  const parsed = hearingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid hearing update.' });
    return;
  }

  const d = parsed.data;
  const hearing = await prisma.hearing.update({
    where: { id: existing.id },
    data: {
      ...(d.hearingDate ? { hearingDate: new Date(d.hearingDate) } : {}),
      ...(d.courtRoom !== undefined ? { courtRoom: d.courtRoom || null } : {}),
      ...(d.benchOrJudge !== undefined ? { benchOrJudge: d.benchOrJudge || null } : {}),
      ...(d.purpose !== undefined ? { purpose: d.purpose } : {}),
      ...(d.outcomeNotes !== undefined ? { outcomeNotes: d.outcomeNotes || null } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
    },
    include: {
      case: { select: { id: true, title: true, caseNumber: true, courtName: true, courtType: true } },
    },
  });

  res.json({ hearing });
});

router.delete('/hearings/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.hearing.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Hearing not found.' });
    return;
  }
  await prisma.hearing.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

// --- TASKS ---
router.get('/tasks', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const status = typeof req.query.status === 'string' ? req.query.status : 'all';
  const now = new Date();

  const where: Record<string, unknown> = { userId };
  if (status === 'pending') where.isCompleted = false;
  if (status === 'completed') where.isCompleted = true;
  if (status === 'overdue') {
    where.isCompleted = false;
    where.dueDate = { lt: now };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      case: { select: { id: true, title: true, internalCode: true } },
      client: { select: { id: true, fullName: true } },
    },
    orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
  });

  res.json({ tasks });
});

router.post('/tasks', async (req: AuthenticatedRequest, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid task data.' });
    return;
  }

  const userId = req.user!.id;
  const d = parsed.data;
  const dueDate = new Date(d.dueDate);
  if (isNaN(dueDate.getTime())) {
    res.status(400).json({ error: 'Invalid due date.' });
    return;
  }

  if (d.caseId) {
    const c = await prisma.case.findFirst({ where: { id: d.caseId, userId } });
    if (!c) {
      res.status(400).json({ error: 'Selected case not found.' });
      return;
    }
  }
  if (d.clientId) {
    const cl = await prisma.client.findFirst({ where: { id: d.clientId, userId } });
    if (!cl) {
      res.status(400).json({ error: 'Selected client not found.' });
      return;
    }
  }

  const task = await prisma.task.create({
    data: {
      userId,
      caseId: d.caseId || null,
      clientId: d.clientId || null,
      title: d.title,
      description: d.description || null,
      dueDate,
      priority: d.priority,
    },
    include: {
      case: { select: { id: true, title: true, internalCode: true } },
      client: { select: { id: true, fullName: true } },
    },
  });

  res.status(201).json({ task });
});

router.patch('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  const { isCompleted, title, description, dueDate, priority } = req.body as {
    isCompleted?: boolean;
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: string;
  };

  const updateData: Record<string, unknown> = {};
  if (typeof isCompleted === 'boolean') {
    updateData.isCompleted = isCompleted;
    updateData.completedAt = isCompleted ? new Date() : null;
  }
  if (typeof title === 'string' && title.trim().length >= 2) updateData.title = title.trim();
  if (typeof description === 'string') updateData.description = description.trim() || null;
  if (typeof dueDate === 'string' && !isNaN(new Date(dueDate).getTime())) {
    updateData.dueDate = new Date(dueDate);
  }
  if (priority && ['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    updateData.priority = priority;
  }

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: updateData,
    include: {
      case: { select: { id: true, title: true, internalCode: true } },
      client: { select: { id: true, fullName: true } },
    },
  });

  res.json({ task });
});

router.delete('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  await prisma.task.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

// --- IN-APP REMINDERS ---
router.get('/reminders', async (req: AuthenticatedRequest, res) => {
  const reminders = await prisma.reminder.findMany({
    where: {
      userId: req.user!.id,
      isDismissed: false,
    },
    include: {
      case: { select: { id: true, title: true, internalCode: true } },
    },
    orderBy: [{ isRead: 'asc' }, { remindAt: 'asc' }],
  });
  res.json({ reminders });
});

router.post('/reminders', async (req: AuthenticatedRequest, res) => {
  const parsed = reminderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid reminder.' });
    return;
  }

  const userId = req.user!.id;
  const d = parsed.data;
  const remindAt = new Date(d.remindAt);
  if (isNaN(remindAt.getTime())) {
    res.status(400).json({ error: 'Invalid reminder date/time.' });
    return;
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      caseId: d.caseId || null,
      hearingId: d.hearingId || null,
      taskId: d.taskId || null,
      title: d.title,
      message: d.message,
      remindAt,
      channel: 'IN_APP',
    },
  });

  res.status(201).json({ reminder });
});

router.patch('/reminders/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.reminder.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const { isRead, isDismissed } = req.body as { isRead?: boolean; isDismissed?: boolean };
  const reminder = await prisma.reminder.update({
    where: { id: existing.id },
    data: {
      ...(typeof isRead === 'boolean' ? { isRead } : {}),
      ...(typeof isDismissed === 'boolean' ? { isDismissed } : {}),
    },
  });

  res.json({ reminder });
});

export default router;
