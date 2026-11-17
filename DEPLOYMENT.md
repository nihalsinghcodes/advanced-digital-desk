# Deployment, PostgreSQL Migration & Backup Guide

## 1. Environment Variables for Production

Copy `.env.example` to `.env` on your production server and set:

- `NODE_ENV="production"`
- `PORT=3000`
- `SESSION_SECRET`: Generate a cryptographically strong 64-character secret:
  ```bash
  openssl rand -hex 32
  ```
- `APP_URL`: Your HTTPS domain (e.g. `https://desk.example-chambers.in`)
- `UPLOAD_DIR`: Private directory outside web root (or mount a private persistent volume / migrate to private S3-compatible object storage).

---

## 2. Migrating from SQLite to PostgreSQL

The Prisma schema (`prisma/schema.prisma`) uses cross-database-compatible column types (`String`, `Int`, `Boolean`, `DateTime`) so migrating to PostgreSQL requires minimal steps:

1. Provision a PostgreSQL 15+ database and set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://advocate_user:STRONG_PASSWORD@db-host:5432/advocate_desk?schema=public"
   ```
2. Update the `datasource db` block in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Regenerate Prisma client and deploy migrations:
   ```bash
   rm -rf prisma/migrations
   npx prisma generate
   npx prisma migrate dev --name init_postgres
   # On production servers:
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

---

## 3. Production Build & Start

```bash
npm ci
npm run build
npm start
```

Always run behind a reverse proxy (Nginx / Caddy / Cloud Run) with HTTPS enabled so session cookies (`Secure`, `HttpOnly`, `SameSite=Lax`) are encrypted in transit.

---

## 4. Database Backup & Recovery

### A. In-App Chambers Export
Logged-in advocates can download a complete JSON snapshot of their own clients, cases, notes, hearings, tasks, reminders, and bookmarks from **Settings & Security → Download Chambers Backup (JSON)**.

### B. SQLite Backup & Restore (Local / Single-Server)
- **Backup** (safe online copy):
  ```bash
  sqlite3 prisma/dev.db ".backup 'backup-advocate-desk-$(date +%F).db'"
  tar -czf uploads-backup-$(date +%F).tar.gz storage/uploads
  ```
- **Restore**:
  1. Stop the Node server.
  2. Restore the database file:
     ```bash
     cp backup-advocate-desk-YYYY-MM-DD.db prisma/dev.db
     tar -xzf uploads-backup-YYYY-MM-DD.tar.gz -C .
     ```
  3. Restart the server (`npm start`).

### C. PostgreSQL Backup & Restore (Production)
- **Backup**:
  ```bash
  pg_dump "$DATABASE_URL" -Fc -f "advocate-desk-$(date +%F).dump"
  ```
- **Restore**:
  ```bash
  pg_restore --clean --if-exists -d "$DATABASE_URL" "advocate-desk-YYYY-MM-DD.dump"
  ```
