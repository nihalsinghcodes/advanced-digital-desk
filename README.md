# Advocate Digital Desk – Uttar Pradesh

**Tagline:** *All Essential Legal Services in One Place.*

A private legal chambers productivity workspace and verified official portal directory built for advocates practising at the **Allahabad High Court (Lucknow Bench)**, **District & Civil Courts (Lucknow)**, and **Uttar Pradesh Revenue Courts (Tehsil / Nayab Tehsildar / SDM)**.

> **Important Disclaimer:** This is an independent private productivity platform. It is **not** affiliated with the Government of India, Government of Uttar Pradesh, Allahabad High Court, eCourts, or Board of Revenue. It never stores government portal passwords or OTPs and never scrapes restricted court websites.

---

## Key Features

1. **Main Dashboard (`Asia/Kolkata` IST)**: Today's hearings, upcoming 7-day hearings, total saved cases, total clients, overdue/pending tasks, recently accessed portals, and quick-access official buttons.
2. **High Court Services**: Direct links to Allahabad High Court (`allahabadhighcourt.in`), Lucknow Bench (`hclko.allahabadhighcourt.in`), eLegalix Orders & Judgments (`elegalix.allahabadhighcourt.in`), and eCourts Judgments (`judgments.ecourts.gov.in`).
3. **Civil & District Court Services**: Direct links to District Court Lucknow (`lucknow.dcourts.gov.in`), eCourts Services (`services.ecourts.gov.in`), and eCourts National Portal (`ecourts.gov.in`) with clear manual-entry instructions.
4. **UP Land Records & Revenue Courts**: Direct links to UP Bhulekh (`upbhulekh.gov.in`), Vaad UP / RCCMS (`vaad.up.nic.in`), UP BhuNaksha (`upbhunaksha.gov.in`), IGRS UP (`igrsup.gov.in`), and Board of Revenue (`bor.up.gov.in`), plus dedicated guidance for Nayab Tehsildar & Tehsil processes.
5. **e-District UP & Certificates**: Direct links to `edistrict.up.gov.in` and `esathi.up.gov.in` for Domicile, Caste, Income certificates, status tracking, and verification with OTP safety warnings.
6. **Case Management**: Full CRUD, search, court/status/upcoming filters, archival, hearing history, and private advocate notes.
7. **Client Management**: Confidential client directory linked across multiple cases and documents.
8. **Hearing Calendar**: Monthly, Weekly, Daily, and Upcoming views aligned to Indian Standard Time (`Asia/Kolkata`).
9. **Tasks & In-App Reminders**: Task priorities, overdue task highlighting, completion toggles, and in-app hearing reminders.
10. **Document Vault**: Private authenticated uploads (PDF, DOC, DOCX, JPG, PNG, TXT up to 10 MB) stored outside public static directories.
11. **Important Websites & Bookmarks**: Prepopulated verified official portals + custom user bookmarks.

---

## Running Locally (macOS & Linux)

### 1. Prerequisites
- Node.js 20+ (tested on Node 22)
- npm 10+

### 2. Install & Configure
```bash
npm install
cp .env.example .env
```

Edit `.env` if needed (default uses SQLite `file:./dev.db`).

### 3. Initialize Database & Seed Sample Data
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start the Application
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

To test immediately with fictional demonstration records, click **Sign In to Sample Demo Chambers** on `/login` (`advocate.sharma@example.in` / `LucknowChambers#2026`).

---

## Running Automated Tests
```bash
npm test
```

## Production Build
```bash
npm run build
npm start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for PostgreSQL migration, production security configuration, and database backup/recovery instructions.
