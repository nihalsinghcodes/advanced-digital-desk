import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.ts';
import { AuthenticatedRequest, requireAuth } from '../lib/auth.ts';
import { createUploadMiddleware, getUploadRootDir } from '../lib/upload.ts';
import { documentCategories } from '../lib/validation.ts';

const router = Router();
router.use(requireAuth);

const upload = createUploadMiddleware();

const metadataSchema = z.object({
  title: z.string().trim().min(2, 'Document title is required.').max(200),
  category: z.enum(documentCategories).default('OTHER'),
  caseId: z.string().trim().optional().nullable().or(z.literal('')),
  clientId: z.string().trim().optional().nullable().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const caseId = typeof req.query.caseId === 'string' ? req.query.caseId.trim() : '';
  const clientId = typeof req.query.clientId === 'string' ? req.query.clientId.trim() : '';

  const where: Record<string, unknown> = { userId };
  if (category && category !== 'ALL') where.category = category;
  if (caseId) where.caseId = caseId;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { originalFilename: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      case: { select: { id: true, title: true, internalCode: true } },
      client: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ documents });
});

router.post('/', (req: AuthenticatedRequest, res) => {
  upload.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      res.status(400).json({
        error: uploadErr.message || 'File upload rejected.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Please select a file to upload.' });
      return;
    }

    const cleanupFile = () => {
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch {
        // ignore cleanup error
      }
    };

    try {
      const parsed = metadataSchema.safeParse(req.body);
      if (!parsed.success) {
        cleanupFile();
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid document metadata.',
        });
        return;
      }

      const userId = req.user!.id;
      const d = parsed.data;

      if (d.caseId) {
        const c = await prisma.case.findFirst({ where: { id: d.caseId, userId } });
        if (!c) {
          cleanupFile();
          res.status(400).json({ error: 'Selected case not found.' });
          return;
        }
      }

      if (d.clientId) {
        const cl = await prisma.client.findFirst({ where: { id: d.clientId, userId } });
        if (!cl) {
          cleanupFile();
          res.status(400).json({ error: 'Selected client not found.' });
          return;
        }
      }

      const relativePath = path.relative(getUploadRootDir(), req.file.path);

      const doc = await prisma.document.create({
        data: {
          userId,
          caseId: d.caseId || null,
          clientId: d.clientId || null,
          title: d.title,
          category: d.category,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          storagePath: relativePath,
          notes: d.notes || null,
        },
        include: {
          case: { select: { id: true, title: true, internalCode: true } },
          client: { select: { id: true, fullName: true } },
        },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: 'DOCUMENT_UPLOAD',
          entityType: 'DOCUMENT',
          entityId: doc.id,
          summary: `Uploaded confidential document: ${doc.title}`,
          ipAddress: req.ip || null,
        },
      });

      res.status(201).json({ document: doc });
    } catch (err) {
      cleanupFile();
      console.error('Document save error:', err);
      res.status(500).json({ error: 'Unable to save document.' });
    }
  });
});

router.get('/:id/download', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, userId },
  });

  if (!doc) {
    res.status(404).json({ error: 'Document not found or access denied.' });
    return;
  }

  const rootDir = getUploadRootDir();
  const fullPath = path.resolve(rootDir, doc.storagePath);
  if (!fullPath.startsWith(rootDir + path.sep) || !fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'Stored document file is missing on server.' });
    return;
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
  res.download(fullPath, doc.originalFilename);
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const doc = await prisma.document.findFirst({
    where: { id: req.params.id, userId },
  });

  if (!doc) {
    res.status(404).json({ error: 'Document not found.' });
    return;
  }

  const rootDir = getUploadRootDir();
  const fullPath = path.resolve(rootDir, doc.storagePath);
  if (fullPath.startsWith(rootDir + path.sep) && fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  await prisma.document.delete({ where: { id: doc.id } });

  await prisma.activityLog.create({
    data: {
      userId,
      action: 'DOCUMENT_DELETE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      summary: `Deleted document: ${doc.title}`,
      ipAddress: req.ip || null,
    },
  });

  res.json({ ok: true });
});

export default router;
