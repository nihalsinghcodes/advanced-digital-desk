import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.jpg',
  '.jpeg',
  '.png',
  '.txt',
]);

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
]);

export function getUploadRootDir(): string {
  const configured = process.env.UPLOAD_DIR || './storage/uploads';
  const resolved = path.resolve(process.cwd(), configured);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

export function createUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const userId = (req as { user?: { id: string } }).user?.id || 'anonymous';
      const safeUserDir = userId.replace(/[^a-zA-Z0-9_-]/g, '');
      const userDir = path.join(getUploadRootDir(), safeUserDir);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      cb(null, userDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES,
      files: 1,
    },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(
          new Error(
            'Unsupported file type. Only PDF, DOC, DOCX, JPG, PNG, and TXT files (max 10 MB) are allowed.'
          )
        );
        return;
      }
      cb(null, true);
    },
  });
}
