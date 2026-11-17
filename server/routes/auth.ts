import { Router } from 'express';
import { prisma } from '../lib/prisma.ts';
import {
  AuthenticatedRequest,
  authRateLimiter,
  clearSessionCookie,
  hashPassword,
  requireAuth,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
} from '../lib/auth.ts';
import { loginSchema, registerSchema, settingsUpdateSchema } from '../lib/validation.ts';

const router = Router();

router.post('/register', authRateLimiter(15), async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid registration data.',
        issues: parsed.error.issues,
      });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        error: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        enrollmentNo: parsed.data.enrollmentNo || null,
        chamberAddress: parsed.data.chamberAddress || null,
        phone: parsed.data.phone || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        enrollmentNo: true,
        chamberAddress: true,
        phone: true,
        reminderLeadMinutes: true,
        preferredLanguage: true,
      },
    });

    // Seed verified official bookmarks for new advocate
    const featuredLinks = await prisma.portalLink.findMany({
      where: { isFeatured: true },
      include: { category: true },
    });

    const mapCat = (slug: string) => {
      if (slug === 'high-court') return 'HIGH_COURT';
      if (slug === 'civil-court') return 'CIVIL_COURT';
      if (slug === 'land-records') return 'LAND_RECORDS';
      if (slug === 'e-district') return 'E_DISTRICT';
      return 'OTHER';
    };

    if (featuredLinks.length > 0) {
      await prisma.bookmark.createMany({
        data: featuredLinks.map((link) => ({
          userId: user.id,
          portalLinkId: link.id,
          title: link.titleEn,
          url: link.url,
          category: mapCat(link.category.slug),
          isOfficial: true,
          notes: link.officialAgency,
        })),
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        entityType: 'USER',
        entityId: user.id,
        summary: 'Advocate account created.',
        ipAddress: req.ip || null,
      },
    });

    const token = signSessionToken({ userId: user.id, email: user.email });
    setSessionCookie(res, token);

    res.status(201).json({ user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Unable to complete registration. Please try again.' });
  }
});

router.post('/login', authRateLimiter(15), async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Email and password are required.',
      });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: 'Invalid email or password. / अमान्य ईमेल या पासवर्ड।',
      });
      return;
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN_FAILED',
          entityType: 'USER',
          entityId: user.id,
          summary: 'Failed login attempt.',
          ipAddress: req.ip || null,
        },
      });
      res.status(401).json({
        error: 'Invalid email or password. / अमान्य ईमेल या पासवर्ड।',
      });
      return;
    }

    const token = signSessionToken({ userId: user.id, email: user.email });
    setSessionCookie(res, token);

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        summary: 'Signed in to Advocate Digital Desk.',
        ipAddress: req.ip || null,
      },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        enrollmentNo: user.enrollmentNo,
        chamberAddress: user.chamberAddress,
        phone: user.phone,
        reminderLeadMinutes: user.reminderLeadMinutes,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Unable to sign in right now.' });
  }
});

router.post('/logout', async (req: AuthenticatedRequest, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

router.patch('/settings', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = settingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid settings input.',
      });
      return;
    }

    const userId = req.user!.id;
    const dataToUpdate: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) dataToUpdate.name = parsed.data.name;
    if (parsed.data.enrollmentNo !== undefined) dataToUpdate.enrollmentNo = parsed.data.enrollmentNo || null;
    if (parsed.data.chamberAddress !== undefined) dataToUpdate.chamberAddress = parsed.data.chamberAddress || null;
    if (parsed.data.phone !== undefined) dataToUpdate.phone = parsed.data.phone || null;
    if (parsed.data.reminderLeadMinutes !== undefined) {
      dataToUpdate.reminderLeadMinutes = parsed.data.reminderLeadMinutes;
    }
    if (parsed.data.preferredLanguage !== undefined) {
      dataToUpdate.preferredLanguage = parsed.data.preferredLanguage;
    }

    if (parsed.data.newPassword) {
      if (!parsed.data.currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new password.' });
        return;
      }
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (!existing || !(await verifyPassword(parsed.data.currentPassword, existing.passwordHash))) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }
      dataToUpdate.passwordHash = await hashPassword(parsed.data.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        enrollmentNo: true,
        chamberAddress: true,
        phone: true,
        reminderLeadMinutes: true,
        preferredLanguage: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'SETTINGS_UPDATE',
        entityType: 'USER',
        entityId: userId,
        summary: 'Updated chamber profile / security settings.',
        ipAddress: req.ip || null,
      },
    });

    res.json({ user: updated });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

router.get('/activity', requireAuth, async (req: AuthenticatedRequest, res) => {
  const logs = await prisma.activityLog.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
  res.json({ logs });
});

router.get('/export', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const [clients, cases, hearings, tasks, reminders, bookmarks] = await Promise.all([
    prisma.client.findMany({ where: { userId } }),
    prisma.case.findMany({ where: { userId }, include: { notes: true } }),
    prisma.hearing.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.reminder.findMany({ where: { userId } }),
    prisma.bookmark.findMany({ where: { userId } }),
  ]);

  await prisma.activityLog.create({
    data: {
      userId,
      action: 'DATA_EXPORT',
      entityType: 'USER',
      entityId: userId,
      summary: 'Exported private chambers backup JSON.',
      ipAddress: req.ip || null,
    },
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="advocate-desk-backup-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.send(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        timezone: 'Asia/Kolkata',
        advocate: req.user,
        clients,
        cases,
        hearings,
        tasks,
        reminders,
        bookmarks,
      },
      null,
      2
    )
  );
});

export default router;
