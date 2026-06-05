# ILMS — incodet Learning Management System

## Business Requirements

This project is building ILMS, an LMS (Learning Management System) for [incodet.com](https://incodet.com). Key features:

- A company admin can register and manage their organisation
- A company admin can upload and assign courses to learners (employees)
- Learners can sign in and access their assigned courses
- Courses consist of YouTube-embedded video lessons and PDF/text-based content
- Learners can track progress lesson by lesson and mark lessons complete
- On course completion, a certificate is auto-generated and downloadable
- A super admin (incodet) can manage all organisations, courses, and users

## Limitations

For the MVP:
- No SCORM support - courses are simple video + text lessons only
- No payment gateway - client onboarding is manual (super admin creates the company)
- No SSO or third-party HR system integration
- No live class or Zoom integration
- Video hosting is YouTube (unlisted) - embedded via URL only
- Single-tenant per company (no white-label custom domains yet)
- Certificate templates are fixed (no custom branding per company in MVP)

## Technical Decisions

- React (Vite) frontend
- Node.js + Express backend REST API
- PostgreSQL database via Supabase free tier
- Supabase Auth for authentication (JWT-based)
- Supabase Storage for PDFs and course thumbnails (1GB free tier)
- YouTube iframe embed for all video lessons
- Resend.com for transactional emails (certificate delivery, welcome emails)
- PDF certificate generation via pdf-lib (Node.js, no external service)
- Hosted on Vercel (frontend) + Railway (backend, free tier)
- No Docker required for MVP - local dev via npm scripts

## Roles

Three user roles exist in the system:

- `super_admin` - incodet staff. Manages organisations and the course catalogue.
- `company_admin` - Client company HR/training manager. Manages their own learners and enrolments.
- `learner` - End user. Views and completes assigned courses.

## Color Scheme

- Primary Teal: `#01696f` - navigation, primary buttons, active states
- Dark Navy: `#032147` - main headings, sidebar background
- Accent Green: `#437a22` - success states, completion badges
- Neutral Gray: `#888888` - supporting text, labels, placeholders
- Background: `#f7f6f2` - page background
- White Surface: `#ffffff` - cards, modals, forms

## Coding Standards

1. Use latest stable versions of all libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features beyond what is specified.
3. Be concise. Keep README minimal. No emojis ever.
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause.
5. Use async/await consistently - no raw Promise chains
6. All API routes must validate request body/params using express-validator before processing
7. Sensitive config (DB URL, Supabase keys, Resend key) always via environment variables, never hardcoded
8. Frontend state managed with React Context + useReducer - no Redux for MVP
9. API responses always follow the shape: `{ success: boolean, data?: any, error?: string }`
10. Database queries use parameterised statements only - no string interpolation in SQL

## Project Structure

```
ilms/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── index.html
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── db/
│   └── index.js
├── docs/              # Planning documents and schema
│   ├── PLAN.md
│   └── schema.sql
├── .env.example
└── README.md
```

## Manual Steps (Human Developer Required)

Certain steps cannot be automated by a coding agent and require direct action by the human developer. The coding agent must PAUSE at each point marked below and explicitly ask the developer to confirm completion before proceeding.

### PAUSE 1 - Before Part 2 (Supabase Setup)
The developer must:
1. Go to https://supabase.com and create a new project named `ilms`
2. From Project Settings > API, copy:
   - `Project URL` → paste as `SUPABASE_URL` in `.env`
   - `anon/public` key → paste as `SUPABASE_ANON_KEY` in `.env`
   - `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY` in `.env`
3. From Project Settings > Database, copy the connection string → paste as `DATABASE_URL` in `.env`
4. Confirm to the agent: "Supabase project created and .env updated"

### PAUSE 2 - Before Part 2 (Resend Setup)
The developer must:
1. Go to https://resend.com and create a free account
2. Create an API key from the dashboard
3. Paste it as `RESEND_API_KEY` in `.env`
4. Confirm to the agent: "Resend API key added to .env"

### PAUSE 3 - After Part 3 (Apply Schema to Supabase)
The developer must:
1. Open the Supabase project dashboard
2. Go to SQL Editor
3. Paste the full contents of `docs/schema.sql` and run it
4. Go to Storage, create two buckets manually:
   - `course-thumbnails` (public)
   - `certificates` (private)
5. Confirm to the agent: "Schema applied and storage buckets created"

### PAUSE 4 - After Part 3 (Seed Data Confirmation)
The developer must:
1. Confirm the seed data (super admin, test org, test company admin, test learner) was created correctly by checking the Supabase Table Editor
2. Confirm all three test accounts can log in via the Supabase Auth dashboard
3. Confirm to the agent: "Seed data verified"

### PAUSE 5 - Before Part 10 (Deployment Setup)
The developer must:

**Railway (backend):**
1. Go to https://railway.app and create a free account
2. Create a new project and deploy from the `backend/` folder
3. Add all environment variables from `.env` into Railway's environment settings
4. Copy the Railway-provided backend URL
5. Paste it as `VITE_API_URL` in the frontend `.env`

**Vercel (frontend):**
1. Go to https://vercel.com and create a free account
2. Import the repo and set the root directory to `frontend/`
3. Add all frontend environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`)
4. Deploy and confirm the live URL works

6. Confirm to the agent: "Backend deployed on Railway and frontend deployed on Vercel"

### PAUSE 6 - YouTube Video Setup (Ongoing, per course)
For each course added to ILMS, the developer must:
1. Upload the video to YouTube
2. Set visibility to "Unlisted"
3. Copy the video URL
4. Paste it into the lesson form inside ILMS when creating lessons

The agent cannot access YouTube. This is always a manual step.

## Working Documentation

All documents for planning and executing this project are in the `docs/` directory.
Review `docs/PLAN.md` before proceeding with any implementation.
