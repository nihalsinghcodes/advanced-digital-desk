import { Router } from 'express';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { bookmarkSchema } from '../lib/validation.ts';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const category = typeof req.query.category === 'string' ? req.query.category : '';

  const where: Record<string, unknown> = { userId };
  if (category && category !== 'ALL') {
    where.category = category;
  }

  const bookmarks = await prisma.bookmark.findMany({
    where,
    orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ bookmarks });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const parsed = bookmarkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Invalid bookmark details.',
    });
    return;
  }

  const userId = req.user!.id;
  const d = parsed.data;

  // Check if URL matches a verified PortalLink in database; otherwise mark isOfficial: false
  const officialMatch = await prisma.portalLink.findFirst({
    where: { url: d.url },
  });

  const bookmark = await prisma.bookmark.create({
    data: {
      userId,
      portalLinkId: officialMatch?.id || null,
      title: d.title,
      url: d.url,
      category: d.category,
      notes: d.notes || null,
      isOfficial: Boolean(officialMatch),
    },
  });

  res.status(201).json({ bookmark });
});

router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.bookmark.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Bookmark not found.' });
    return;
  }

  const parsed = bookmarkSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid bookmark update.' });
    return;
  }

  const d = parsed.data;
  const bookmark = await prisma.bookmark.update({
    where: { id: existing.id },
    data: {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.url !== undefined ? { url: d.url } : {}),
      ...(d.category !== undefined ? { category: d.category } : {}),
      ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
    },
  });

  res.json({ bookmark });
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const existing = await prisma.bookmark.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Bookmark not found.' });
    return;
  }

  await prisma.bookmark.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

export default router;
