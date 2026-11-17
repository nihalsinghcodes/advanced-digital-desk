import { Router } from 'express';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { clientSchema } from '../lib/validation.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const archived = req.query.archived === 'true';

  const where: Record<string, unknown> = {
    userId,
    isArchived: archived,
  };

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { phone: { contains: search } },
      { city: { contains: search } },
      { district: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      _count: {
        select: { cases: true, documents: true },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  res.json({ clients });
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const client = await prisma.client.findFirst({
    where: { id: req.params.id, userId },
    include: {
      cases: {
        orderBy: [{ isArchived: 'asc' }, { updatedAt: 'desc' }],
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!client) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  res.json({ client });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid client information.',
        issues: parsed.error.issues,
      });
      return;
    }

    const userId = req.user!.id;
    const d = parsed.data;
    const client = await prisma.client.create({
      data: {
        userId,
        fullName: d.fullName,
        fatherOrSpouseName: d.fatherOrSpouseName || null,
        phone: d.phone,
        alternatePhone: d.alternatePhone || null,
        email: d.email || null,
        address: d.address || null,
        city: d.city || 'Lucknow',
        district: d.district || 'Lucknow',
        privateNotes: d.privateNotes || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CLIENT_CREATE',
        entityType: 'CLIENT',
        entityId: client.id,
        summary: `Added client ${client.fullName}`,
        ipAddress: req.ip || null,
      },
    });

    res.status(201).json({ client });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Unable to save client.' });
  }
});

router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Client not found.' });
      return;
    }

    const parsed = clientSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid client update.',
      });
      return;
    }

    const d = parsed.data;
    const client = await prisma.client.update({
      where: { id: existing.id },
      data: {
        ...(d.fullName !== undefined ? { fullName: d.fullName } : {}),
        ...(d.fatherOrSpouseName !== undefined
          ? { fatherOrSpouseName: d.fatherOrSpouseName || null }
          : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.alternatePhone !== undefined ? { alternatePhone: d.alternatePhone || null } : {}),
        ...(d.email !== undefined ? { email: d.email || null } : {}),
        ...(d.address !== undefined ? { address: d.address || null } : {}),
        ...(d.city !== undefined ? { city: d.city } : {}),
        ...(d.district !== undefined ? { district: d.district } : {}),
        ...(d.privateNotes !== undefined ? { privateNotes: d.privateNotes || null } : {}),
      },
    });

    res.json({ client });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Unable to update client.' });
  }
});

router.post('/:id/archive', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  const client = await prisma.client.update({
    where: { id: existing.id },
    data: { isArchived: !existing.isArchived },
  });

  res.json({ client });
});

export default router;
