import { Router } from 'express';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { caseNoteSchema, caseSchema } from '../lib/validation.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const courtType = typeof req.query.courtType === 'string' ? req.query.courtType.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const upcoming = req.query.upcoming === 'true';
  const archived = req.query.archived === 'true';

  const where: Record<string, unknown> = {
    userId,
    isArchived: archived,
  };

  if (courtType && courtType !== 'ALL') {
    where.courtType = courtType;
  }
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (upcoming) {
    where.nextHearingDate = { gte: new Date() };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { internalCode: { contains: search } },
      { caseNumber: { contains: search } },
      { cnrNumber: { contains: search } },
      { courtName: { contains: search } },
      { petitioner: { contains: search } },
      { respondent: { contains: search } },
    ];
  }

  const cases = await prisma.case.findMany({
    where,
    include: {
      client: {
        select: { id: true, fullName: true, phone: true },
      },
      _count: {
        select: { hearings: true, notes: true, documents: true, tasks: true },
      },
    },
    orderBy: [{ nextHearingDate: 'asc' }, { updatedAt: 'desc' }],
  });

  res.json({ cases });
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const caseRecord = await prisma.case.findFirst({
    where: { id: req.params.id, userId },
    include: {
      client: true,
      hearings: { orderBy: { hearingDate: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      tasks: { orderBy: { dueDate: 'asc' } },
    },
  });

  if (!caseRecord) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  res.json({ caseRecord });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = caseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid case details.',
        issues: parsed.error.issues,
      });
      return;
    }

    const userId = req.user!.id;
    const data = parsed.data;

    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, userId },
      });
      if (!client) {
        res.status(400).json({ error: 'Selected client does not belong to your account.' });
        return;
      }
    }

    const parseOptDate = (val?: string | null) => (val ? new Date(val) : null);

    const created = await prisma.case.create({
      data: {
        userId,
        clientId: data.clientId || null,
        internalCode: data.internalCode,
        title: data.title,
        caseNumber: data.caseNumber || null,
        cnrNumber: data.cnrNumber || null,
        courtName: data.courtName,
        courtType: data.courtType,
        caseCategory: data.caseCategory,
        petitioner: data.petitioner,
        respondent: data.respondent,
        filingDate: parseOptDate(data.filingDate),
        nextHearingDate: parseOptDate(data.nextHearingDate),
        previousHearingDate: parseOptDate(data.previousHearingDate),
        status: data.status,
        privateNotes: data.privateNotes || null,
      },
      include: {
        client: { select: { id: true, fullName: true, phone: true } },
      },
    });

    // Automatically schedule a hearing & reminder if nextHearingDate is supplied
    if (created.nextHearingDate) {
      const hearing = await prisma.hearing.create({
        data: {
          userId,
          caseId: created.id,
          hearingDate: created.nextHearingDate,
          purpose: 'Scheduled Hearing',
          status: 'SCHEDULED',
        },
      });

      const leadMs = req.user!.reminderLeadMinutes * 60 * 1000;
      await prisma.reminder.create({
        data: {
          userId,
          caseId: created.id,
          hearingId: hearing.id,
          title: `Hearing Reminder: ${created.title}`,
          message: `${created.courtName}${created.caseNumber ? ` (${created.caseNumber})` : ''}`,
          remindAt: new Date(created.nextHearingDate.getTime() - leadMs),
          channel: 'IN_APP',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CASE_CREATE',
        entityType: 'CASE',
        entityId: created.id,
        summary: `Added case ${created.internalCode}: ${created.title}`,
        ipAddress: req.ip || null,
      },
    });

    res.status(201).json({ caseRecord: created });
  } catch (err) {
    console.error('Create case error:', err);
    res.status(500).json({ error: 'Unable to save case.' });
  }
});

router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.case.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }

    const parsed = caseSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid case update.',
      });
      return;
    }

    const data = parsed.data;
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, userId },
      });
      if (!client) {
        res.status(400).json({ error: 'Selected client does not belong to your account.' });
        return;
      }
    }

    const updated = await prisma.case.update({
      where: { id: existing.id },
      data: {
        ...(data.clientId !== undefined ? { clientId: data.clientId || null } : {}),
        ...(data.internalCode !== undefined ? { internalCode: data.internalCode } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.caseNumber !== undefined ? { caseNumber: data.caseNumber || null } : {}),
        ...(data.cnrNumber !== undefined ? { cnrNumber: data.cnrNumber || null } : {}),
        ...(data.courtName !== undefined ? { courtName: data.courtName } : {}),
        ...(data.courtType !== undefined ? { courtType: data.courtType } : {}),
        ...(data.caseCategory !== undefined ? { caseCategory: data.caseCategory } : {}),
        ...(data.petitioner !== undefined ? { petitioner: data.petitioner } : {}),
        ...(data.respondent !== undefined ? { respondent: data.respondent } : {}),
        ...(data.filingDate !== undefined
          ? { filingDate: data.filingDate ? new Date(data.filingDate) : null }
          : {}),
        ...(data.nextHearingDate !== undefined
          ? { nextHearingDate: data.nextHearingDate ? new Date(data.nextHearingDate) : null }
          : {}),
        ...(data.previousHearingDate !== undefined
          ? { previousHearingDate: data.previousHearingDate ? new Date(data.previousHearingDate) : null }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.privateNotes !== undefined ? { privateNotes: data.privateNotes || null } : {}),
      },
      include: {
        client: { select: { id: true, fullName: true, phone: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CASE_UPDATE',
        entityType: 'CASE',
        entityId: updated.id,
        summary: `Updated case ${updated.internalCode} (${updated.status})`,
        ipAddress: req.ip || null,
      },
    });

    res.json({ caseRecord: updated });
  } catch (err) {
    console.error('Update case error:', err);
    res.status(500).json({ error: 'Unable to update case.' });
  }
});

router.post('/:id/archive', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.case.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const updated = await prisma.case.update({
    where: { id: existing.id },
    data: { isArchived: !existing.isArchived },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: updated.isArchived ? 'CASE_ARCHIVE' : 'CASE_RESTORE',
      entityType: 'CASE',
      entityId: updated.id,
      summary: `${updated.isArchived ? 'Archived' : 'Restored'} case ${updated.internalCode}`,
      ipAddress: req.ip || null,
    },
  });

  res.json({ caseRecord: updated });
});

router.post('/:id/notes', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.case.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const parsed = caseNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid note.' });
    return;
  }

  const note = await prisma.caseNote.create({
    data: {
      userId,
      caseId: existing.id,
      title: parsed.data.title,
      content: parsed.data.content,
      isPrivate: parsed.data.isPrivate,
    },
  });

  res.status(201).json({ note });
});

router.delete('/:id/notes/:noteId', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const note = await prisma.caseNote.findFirst({
    where: { id: req.params.noteId, caseId: req.params.id, userId },
  });
  if (!note) {
    res.status(404).json({ error: 'Note not found.' });
    return;
  }
  await prisma.caseNote.delete({ where: { id: note.id } });
  res.json({ ok: true });
});

export default router;
