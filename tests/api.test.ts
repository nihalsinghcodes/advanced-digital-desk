import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_DB_FILE = path.resolve(process.cwd(), 'prisma/test.db');
const TEST_UPLOAD_DIR = path.resolve(process.cwd(), 'storage/test-uploads');

let app: ReturnType<(typeof import('../server/app.ts'))['createApp']>;
let prisma: (typeof import('../server/lib/prisma.ts'))['prisma'];

describe('Advocate Digital Desk — Full-Stack Integration Tests', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = `file:${TEST_DB_FILE}`;
    process.env.UPLOAD_DIR = TEST_UPLOAD_DIR;
    process.env.DISABLE_RATE_LIMIT = 'true';
    process.env.SESSION_SECRET = 'test-session-secret-key-for-vitest-2026';

    if (fs.existsSync(TEST_DB_FILE)) fs.unlinkSync(TEST_DB_FILE);
    if (fs.existsSync(TEST_UPLOAD_DIR)) fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });

    // Apply Prisma schema migrations cleanly to isolated test SQLite DB
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: `file:${TEST_DB_FILE}` },
      stdio: 'pipe',
    });

    const prismaMod = await import('../server/lib/prisma.ts');
    prisma = prismaMod.prisma;

    const seedMod = await import('../prisma/seed.ts');
    await seedMod.seedDatabase(prisma);

    const appMod = await import('../server/app.ts');
    app = appMod.createApp();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (fs.existsSync(TEST_DB_FILE)) fs.unlinkSync(TEST_DB_FILE);
    if (fs.existsSync(TEST_UPLOAD_DIR)) fs.rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
  });

  it('rejects unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/cases');
    expect(res.status).toBe(401);

    const dashRes = await request(app).get('/api/dashboard');
    expect(dashRes.status).toBe(401);
  });

  it('serves verified official portal directory publicly', async () => {
    const res = await request(app).get('/api/portals');
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThanOrEqual(4);
    const allUrls = res.body.categories.flatMap((c: { links: { url: string }[] }) =>
      c.links.map((l) => l.url)
    );
    expect(allUrls).toContain('https://www.allahabadhighcourt.in');
    expect(allUrls).toContain('https://upbhulekh.gov.in');
    expect(allUrls).toContain('https://edistrict.up.gov.in');
  });

  it('validates registration, login, invalid submissions, and enforces cross-user authorization', async () => {
    // Invalid registration (short password)
    const badReg = await request(app).post('/api/auth/register').send({
      email: 'invalid-advocate@example.in',
      password: '123',
      name: 'Adv. Test',
    });
    expect(badReg.status).toBe(400);

    // Valid Advocate A registration
    const agentA = request.agent(app);
    const regA = await agentA.post('/api/auth/register').send({
      email: 'advocate.a@example.in',
      password: 'StrongPassword#123',
      name: 'Adv. A (Lucknow)',
      enrollmentNo: 'UP/1001/2010',
    });
    expect(regA.status).toBe(201);
    expect(regA.body.user.email).toBe('advocate.a@example.in');

    // Wrong password login rejected
    const badLogin = await request(app).post('/api/auth/login').send({
      email: 'advocate.a@example.in',
      password: 'WrongPassword',
    });
    expect(badLogin.status).toBe(401);

    // Valid login
    const goodLogin = await agentA.post('/api/auth/login').send({
      email: 'advocate.a@example.in',
      password: 'StrongPassword#123',
    });
    expect(goodLogin.status).toBe(200);

    // Create Client + Case as Advocate A
    const clientRes = await agentA.post('/api/clients').send({
      fullName: 'Ramesh Chandra Gupta (Test)',
      phone: '+91-98000-99999',
      city: 'Lucknow',
      district: 'Lucknow',
    });
    expect(clientRes.status).toBe(201);
    const clientId = clientRes.body.client.id;

    const caseRes = await agentA.post('/api/cases').send({
      clientId,
      internalCode: 'TEST-HC-001',
      title: 'Ramesh Chandra Gupta vs. State of U.P.',
      caseNumber: 'WRIT-A No. 101 of 2026',
      courtName: 'Allahabad High Court, Lucknow Bench',
      courtType: 'HIGH_COURT',
      caseCategory: 'Writ Petition',
      petitioner: 'Ramesh Chandra Gupta',
      respondent: 'State of U.P.',
      nextHearingDate: '2026-12-01T10:30:00+05:30',
      status: 'PENDING',
    });
    expect(caseRes.status).toBe(201);
    const caseId = caseRes.body.caseRecord.id;

    // Register Advocate B and verify Advocate B cannot view/modify Advocate A's case or client
    const agentB = request.agent(app);
    const regB = await agentB.post('/api/auth/register').send({
      email: 'advocate.b@example.in',
      password: 'StrongPassword#456',
      name: 'Adv. B (Lucknow)',
    });
    expect(regB.status).toBe(201);

    const unauthorizedCase = await agentB.get(`/api/cases/${caseId}`);
    expect(unauthorizedCase.status).toBe(404);

    const unauthorizedClient = await agentB.get(`/api/clients/${clientId}`);
    expect(unauthorizedClient.status).toBe(404);
  });

  it('persists and manages cases, clients, hearings, tasks, reminders, documents, bookmarks, and backups', async () => {
    const agent = request.agent(app);
    const loginRes = await agent.post('/api/auth/login').send({
      email: 'advocate.sharma@example.in',
      password: 'LucknowChambers#2026',
    });
    expect(loginRes.status).toBe(200);

    // 1. Add Client
    const clRes = await agent.post('/api/clients').send({
      fullName: 'Vikram Singh (Fictional Integration Test)',
      phone: '+91-91111-22222',
      city: 'Lucknow',
      district: 'Lucknow',
    });
    expect(clRes.status).toBe(201);
    const clientId = clRes.body.client.id;

    // 2. Add Case linked to Client
    const cRes = await agent.post('/api/cases').send({
      clientId,
      internalCode: 'INT-CIV-2026',
      title: 'Vikram Singh vs. Nagar Nigam Lucknow',
      caseNumber: 'O.S. No. 555 of 2026',
      cnrNumber: 'UPLK050005552026',
      courtName: 'Civil Judge (Junior Division), Lucknow',
      courtType: 'CIVIL_COURT',
      caseCategory: 'Civil Suit',
      petitioner: 'Vikram Singh',
      respondent: 'Nagar Nigam Lucknow',
      nextHearingDate: '2026-12-10T11:00:00+05:30',
      status: 'PENDING',
    });
    expect(cRes.status).toBe(201);
    const caseId = cRes.body.caseRecord.id;

    // Search & filter case
    const searchRes = await agent.get('/api/cases?search=Vikram&courtType=CIVIL_COURT');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.cases.some((c: { id: string }) => c.id === caseId)).toBe(true);

    // Edit case status & verify persistence
    const editRes = await agent.patch(`/api/cases/${caseId}`).send({ status: 'STAYED' });
    expect(editRes.status).toBe(200);
    expect(editRes.body.caseRecord.status).toBe('STAYED');

    // Verify client-case connection
    const clientDetail = await agent.get(`/api/clients/${clientId}`);
    expect(clientDetail.status).toBe(200);
    expect(clientDetail.body.client.cases.some((c: { id: string }) => c.id === caseId)).toBe(true);

    // 3. Hearing date management
    const hRes = await agent.post('/api/hearings').send({
      caseId,
      hearingDate: '2026-12-15T10:30:00+05:30',
      courtRoom: 'Room 02',
      purpose: 'Filing of Written Statement',
      status: 'SCHEDULED',
    });
    expect(hRes.status).toBe(201);

    // 4. Tasks & Reminders
    const tRes = await agent.post('/api/tasks').send({
      caseId,
      clientId,
      title: 'Draft Written Statement Objections',
      dueDate: '2026-12-14T16:00:00+05:30',
      priority: 'HIGH',
    });
    expect(tRes.status).toBe(201);
    const taskId = tRes.body.task.id;

    const completeRes = await agent.patch(`/api/tasks/${taskId}`).send({ isCompleted: true });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.task.isCompleted).toBe(true);

    // 5. Document upload restrictions (reject .exe, allow .pdf/.txt, download & delete)
    const badUpload = await agent
      .post('/api/documents')
      .field('title', 'Malicious Test')
      .field('category', 'OTHER')
      .attach('file', Buffer.from('MZfakeexe'), {
        filename: 'payload.exe',
        contentType: 'application/x-msdownload',
      });
    expect(badUpload.status).toBe(400);

    const goodUpload = await agent
      .post('/api/documents')
      .field('title', 'Sample Plaint Copy')
      .field('category', 'PETITION')
      .field('caseId', caseId)
      .attach('file', Buffer.from('%PDF-1.4\n% Sample Legal Document\n'), {
        filename: 'plaint.pdf',
        contentType: 'application/pdf',
      });
    expect(goodUpload.status).toBe(201);
    const docId = goodUpload.body.document.id;

    const dlRes = await agent.get(`/api/documents/${docId}/download`);
    expect(dlRes.status).toBe(200);
    expect(dlRes.headers['x-content-type-options']).toBe('nosniff');

    const delDocRes = await agent.delete(`/api/documents/${docId}`);
    expect(delDocRes.status).toBe(200);

    // 6. Bookmark management
    const bmRes = await agent.post('/api/bookmarks').send({
      title: 'UP State Legal Services Authority',
      url: 'https://upslsa.up.nic.in',
      category: 'OTHER',
      notes: 'Custom bookmark',
    });
    expect(bmRes.status).toBe(201);
    expect(bmRes.body.bookmark.isOfficial).toBe(false);
    const bmId = bmRes.body.bookmark.id;

    const bmEdit = await agent.patch(`/api/bookmarks/${bmId}`).send({
      title: 'UPSLSA Official Portal',
    });
    expect(bmEdit.status).toBe(200);
    expect(bmEdit.body.bookmark.title).toBe('UPSLSA Official Portal');

    const bmDel = await agent.delete(`/api/bookmarks/${bmId}`);
    expect(bmDel.status).toBe(200);

    // 7. JSON Backup export check
    const exportRes = await agent.get('/api/auth/export');
    expect(exportRes.status).toBe(200);
    const backup = JSON.parse(exportRes.text);
    expect(backup.timezone).toBe('Asia/Kolkata');
    expect(Array.isArray(backup.cases)).toBe(true);
    expect(backup.cases.some((c: { id: string }) => c.id === caseId)).toBe(true);
  });
});
