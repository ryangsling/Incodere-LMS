# ILMS — incodet Learning Management System

A multi-tenant corporate Learning Management System for [incodet.com](https://incodet.com). A super admin (incodet staff) creates the course catalogue, provisions client organisations, and ships updates; client company admins invite their employees, assign courses, and watch completion; learners watch short video or read text lessons, track progress lesson-by-lesson, and earn a downloadable PDF certificate on completion.

This README covers the running application as it sits in the repo — auth flow, all three role-based dashboards, the data model, the API surface, the deployment shape, and the manual integration steps that cannot be automated by a coding agent.

---

## Table of Contents

1. [Screenshots](#screenshots)
2. [Features by Role](#features-by-role)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Quick Start (Local Dev)](#quick-start-local-dev)
6. [Environment Variables](#environment-variables)
7. [Database & Migrations](#database--migrations)
8. [Authentication Flows](#authentication-flows)
9. [API Surface](#api-surface)
10. [Transactional Emails](#transactional-emails)
11. [Certificates](#certificates)
12. [Deployment](#deployment)
13. [Manual Steps the Coding Agent Cannot Do](#manual-steps-the-coding-agent-cannot-do)
14. [Design System](#design-system)
15. [Coding Standards](#coding-standards)
16. [Troubleshooting](#troubleshooting)
17. [Further Reading](#further-reading)

---

## Screenshots

Replace each placeholder below with a screenshot of the corresponding screen. The expected aspect ratio is roughly 16:9 desktop, 9:16 mobile, and a single column at ~640px wide for emails.

### Public

| Surface | Screenshot |
|---|---|
| Landing page (`/`) | ![Landing](docs/screenshots/landing.png) |
| Login (`/login`) | ![Login](docs/screenshots/login.png) |
| Forgot password (`/forgot-password`) | ![Forgot password](docs/screenshots/forgot-password.png) |
| Reset password (`/reset-password`) | ![Reset password](docs/screenshots/reset-password.png) |
| Accept invite (`/accept-invite`) | ![Accept invite](docs/screenshots/accept-invite.png) |
| Public certificate verify (`/verify/:id`) | ![Certificate verify](docs/screenshots/verify.png) |

### Learner

| Surface | Screenshot |
|---|---|
| Dashboard (`/dashboard`) | ![Learner dashboard](docs/screenshots/learner-dashboard.png) |
| Course player (`/dashboard/courses/:id`) | ![Course player](docs/screenshots/learner-course-player.png) |

### Company Admin

| Surface | Screenshot |
|---|---|
| Learners (`/admin/learners`) | ![Learners](docs/screenshots/admin-learners.png) |
| Enrolments (`/admin/enrolments`) | ![Enrolments](docs/screenshots/admin-enrolments.png) |
| Reports (`/admin/reports`) | ![Reports](docs/screenshots/admin-reports.png) |
| Certificates (`/admin/certificates`) | ![Certificates](docs/screenshots/admin-certificates.png) |

### Super Admin

| Surface | Screenshot |
|---|---|
| Platform stats (`/super-admin`) | ![Platform stats](docs/screenshots/super-stats.png) |
| Organisations list (`/super-admin/organisations`) | ![Organisations](docs/screenshots/super-organisations.png) |
| Organisation detail (`/super-admin/organisations/:id`) | ![Organisation detail](docs/screenshots/super-org-detail.png) |
| Course catalogue (`/super-admin/courses`) | ![Courses](docs/screenshots/super-courses.png) |
| Course editor (`/super-admin/courses/:id`) | ![Course editor](docs/screenshots/super-course-form.png) |
| Section & lesson management | ![Course structure](docs/screenshots/super-course-structure.png) |

### Transactional Emails

Capture the email rendered in a real inbox (Gmail, Outlook, Apple Mail) at ~640px wide.

| Email | Screenshot |
|---|---|
| Welcome email (company admin) | ![Welcome email](docs/screenshots/email-welcome.png) |
| Learner invite | ![Learner invite email](docs/screenshots/email-invite.png) |
| Password reset | ![Password reset email](docs/screenshots/email-reset.png) |
| Certificate of completion (with PDF attachment) | ![Certificate email](docs/screenshots/email-certificate.png) |
| Generated PDF certificate | ![Certificate PDF](docs/screenshots/certificate-pdf.png) |

---

## Features by Role

### Super admin (`incodet` staff)

- Platform dashboard with totals: organisations, active learners, certificates, total + published courses
- Create, search, and view organisations
- For each organisation: create its first company admin (welcome email is sent automatically)
- Full course catalogue: create, edit, publish, unpublish, delete (with cascading sections and lessons)
- Course structure editor: ordered sections, ordered lessons per section, two lesson types (`video` YouTube URL or `text` markdown/plain), course thumbnail
- View all organisations' enrolments, certificates, and learners

### Company admin (client HR / training manager)

- Learners page: invite new learners (email with one-time invite link), resend invite, activate/deactivate, delete; cannot delete or deactivate self
- Enrolments page: select one or more active learners and a published course, enrol in bulk; the form reports `created` and `already_enrolled` counts separately
- Completion report: filter by course, status (`not_started` / `in_progress` / `completed`), and free-text search; shows progress percentage, lessons completed, and certificate issuance date when present
- Certificates page: list of all certificates issued within the org, with one-click PDF download

### Learner

- Dashboard: enrolled courses with thumbnail, course title, and progress percentage; primary course and "Continue" CTA
- Course player: ordered sidebar of sections and lessons, inline YouTube iframe for `video` lessons, monospace text for `text` lessons, "Mark complete" per lesson, per-course progress bar
- My certificates page: list of issued certificates, each downloadable as a branded PDF
- On course completion: generate a certificate (one-time, idempotent on `(learner_id, course_id)`), the server emails the PDF to the learner and marks the enrolment `completed`

---

## Tech Stack

### Frontend

- React 19 + Vite 8
- React Router 7 (declarative routes with `AnimatePresence` for page transitions)
- Tailwind CSS 4 (`@tailwindcss/vite` plugin, no config file — theme tokens declared in `index.css`)
- Headless UI 2 (transitions), Heroicons 2 (icons)
- Motion 12 (animations) + GSAP 3 with `@gsap/react` (one-shot timeline effects) + Lenis 1 (smooth scroll) + `z-proximity-engine` (cursor-proximity effects on the course player)
- Supabase JS 2 (auth client, session storage in `localStorage`)

### Backend

- Node.js 22, Express 5
- `supabase-js` 2 (service_role client for all DB access — bypasses RLS at the application layer)
- `express-validator` 7 (request validation), `helmet` 8 (security headers), `cors` 2 (allowlist of origins), `morgan` 1 (request logging)
- `express-rate-limit` 7 with three buckets: general (100/min), writes (30/min), expensive (10/min) and a tighter bucket for `forgot-password` (10 / 15 min)
- `pdf-lib` 1 (server-side PDF certificate generation, no external service)
- `resend` 6 (transactional email — invite, welcome, password reset, certificate delivery)

### Data

- PostgreSQL via Supabase (free tier)
- Supabase Auth (JWT) for all authentication
- Supabase Storage (1GB free tier) for course thumbnails (public bucket) and generated certificates (private bucket, signed URLs)
- RLS policies in `docs/rls-policies.sql` — defence in depth alongside the application-layer scoping done in the backend

### Deployment

- Vercel for the frontend (Vite build, SPA rewrites in `vercel.json` for `/accept-invite`, `/reset-password`, etc.)
- Railway for the backend (`node src/index.js`)

---

## Repository Structure

```
ilms/
├── AGENTS.md                       # Project rules and coding standards
├── README.md                       # This file
├── UI_UX_PLAN.md                   # Design system spec, motion language, page-level UI notes
├── summary.md                      # Active working notes (context, decisions, blockers)
│
├── frontend/                       # React + Vite SPA
│   ├── index.html
│   ├── vercel.json                 # SPA rewrite for client-side routes
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── src/
│   │   ├── main.jsx                # React root, providers (Auth, SmoothScroll, Toast)
│   │   ├── App.jsx                 # Route table and ProtectedRoute
│   │   ├── index.css               # Tailwind v4 theme tokens
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Session → user (via /api/auth/me) → role-based home
│   │   │   └── SmoothScrollProvider.jsx
│   │   ├── components/
│   │   │   ├── layout/             # AdminShell, sidebars
│   │   │   ├── ui/                 # Button, Card, DataTable, Modal, Toast, etc.
│   │   │   ├── AuthShell.jsx
│   │   │   └── CourseCard.jsx
│   │   ├── pages/                  # 1 file per route — see the Screenshots section above
│   │   └── utils/
│   │       ├── supabase.js         # anon-key Supabase client
│   │       ├── api.js              # Typed wrapper around the backend REST API
│   │       └── classNames.js
│   └── public/
│
├── backend/                        # Node + Express REST API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                # App bootstrap, helmet/CORS/rate-limit, route mounting
│       ├── routes/                 # Express routers, one per resource
│       ├── controllers/            # Request handlers, one per route group
│       ├── middleware/
│       │   ├── verifyAuth.js       # Supabase getUser(token) + load public.users
│       │   ├── requireRole.js      # Role gate
│       │   ├── rateLimiters.js     # general / write / expensive / forgotPassword
│       │   └── validate.js         # express-validator result handler
│       ├── services/
│       │   └── email.js            # Resend wrapper, template variable substitution
│       ├── templates/emails/       # HTML templates: _layout, invite, password-reset, welcome
│       ├── db/
│       │   └── supabase.js         # service_role Supabase client (bypasses RLS)
│       └── utils/
│           ├── listQuery.js        # Pagination + search parsing
│           └── authLinks.js        # Legacy, currently unused
│
└── docs/
    ├── PLAN.md                     # Full implementation plan
    ├── schema.sql                  # Base tables, indexes, triggers, seed organisation
    ├── schema-v2.sql               # Categories taxonomy (v2)
    ├── rls-policies.sql            # Row-Level Security policies
    ├── storage-policies.sql        # Storage bucket policies
    ├── seed.js                     # Test accounts (super admin, company admin, learner)
    ├── API.md                      # Endpoint reference
    ├── ER.md                       # Data model and indexes
    └── superpowers/                # Imported skill notes
```

---

## Quick Start (Local Dev)

```bash
# 1. Backend
cd backend
cp .env.example ../.env
# edit ../.env with your Supabase + Resend keys (see Environment Variables below)
npm install
npm run dev   # nodemon on :3000

# 2. Frontend (separate terminal)
cd frontend
cp .env.example .env   # or create .env manually
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_API_URL=http://localhost:3000
npm install
npm run dev   # Vite on :5173
```

Open http://localhost:5173. The first run will redirect to `/login`. Use the seed accounts from `docs/seed.js` once you have applied the schema and run the seeder.

### Useful scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | nodemon on port 3000 |
| backend | `npm start` | plain `node src/index.js` |
| backend | `npm test` | Vitest run |
| backend | `npm run test:watch` | Vitest watch |
| frontend | `npm run dev` | Vite dev server with HMR |
| frontend | `npm run build` | Production bundle into `dist/` |
| frontend | `npm run preview` | Serve the production build locally |
| frontend | `npm run lint` | ESLint over `src/` |

---

## Environment Variables

### Backend (`backend/.env` — same keys in Railway)

| Key | Required | Description |
|---|---|---|
| `PORT` | no | Defaults to `3000` |
| `NODE_ENV` | no | `development` or `production` (affects morgan log format) |
| `SUPABASE_URL` | yes | Project URL, e.g. `https://abc.supabase.co` |
| `SUPABASE_ANON_KEY` | yes | The anon / public key (not used directly for writes, but kept for parity) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side key — bypasses RLS, never exposed to the client |
| `DATABASE_URL` | yes | Postgres connection string (Supabase Settings → Database) |
| `RESEND_API_KEY` | yes | Resend transactional email API key |
| `RESEND_FROM_NAME` | no | Defaults to `ILMS` |
| `RESEND_FROM_EMAIL` | no | Defaults to `onboarding@resend.dev`; in production set this to a verified sender on your domain |
| `FRONTEND_URL` | yes | The origin emails link to and CORS uses as a default — e.g. `https://ilms-incodet.vercel.app` |
| `ALLOWED_ORIGINS` | no | Comma-separated extra origins allowed by CORS — handy for staging |

### Frontend (`frontend/.env` — same keys in Vercel)

| Key | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Same `SUPABASE_URL` as the backend |
| `VITE_SUPABASE_ANON_KEY` | yes | Same anon key — safe to ship to the browser, RLS protects the data |
| `VITE_API_URL` | yes | The backend's public URL, e.g. `https://incodere-lms-production.up.railway.app` |

All env files are git-ignored. `.env.example` files are committed; copy them and fill in the values.

---

## Database & Migrations

PostgreSQL lives in Supabase. Apply the migrations in this order, each as a single SQL Editor run in the Supabase dashboard:

1. `docs/schema.sql` — organisations, users, courses, sections, lessons, enrolments, lesson_progress, certificates, plus indexes, triggers, and a seed organisation
2. `docs/rls-policies.sql` — enables RLS on every tenant-data table and adds per-role policies (defence in depth — the application layer already scopes by `organisation_id` via the service_role client)
3. `docs/storage-policies.sql` — bucket policies for `course-thumbnails` (public) and `certificates` (private)
4. `docs/schema-v2.sql` (optional) — adds the `categories` taxonomy and a `courses.category_id` foreign key

Then create the two storage buckets manually in Supabase Storage:

- `course-thumbnails` — public
- `certificates` — private (the backend generates short-lived signed URLs on demand)

### Seeding test accounts

```bash
node docs/seed.js
```

Creates three accounts in the seed organisation:

| Email | Password | Role |
|---|---|---|
| `super@incodet.com` | `SuperAdmin123!` | super_admin |
| `admin@testcompany.com` | `Admin123!` | company_admin |
| `learner@testcompany.com` | `Learner123!` | learner |

---

## Authentication Flows

All authentication runs through Supabase Auth (JWT). The backend never stores passwords — the service-role client only creates users, sends recovery links, and updates passwords.

### Login

1. `Login.jsx` calls `supabase.auth.signInWithPassword(email, password)`
2. The Supabase JS client stores the session in `localStorage` automatically
3. `AuthContext.loadUser()` calls `GET /api/auth/me` with the bearer token
4. `verifyAuth` middleware (`backend/src/middleware/verifyAuth.js:1`) does `supabase.auth.getUser(token)` to validate the JWT, then loads the matching row from `public.users` and checks `is_active = true`
5. On success the role-bearing user object is dispatched into context and the user is redirected to `/super-admin`, `/admin`, or `/dashboard` based on `user.role`

This path is the reason `GET /api/auth/me` exists: with RLS enabled, the anon client cannot reliably read its own row in `public.users` (the recursive EXISTS subqueries in the policies return null), which is what causes the `Cannot read properties of null (reading 'role')` crash. The backend uses the service_role client to bypass RLS at exactly this boundary.

### Forgot / reset password

1. `ForgotPassword.jsx` posts email to `POST /api/auth/forgot-password`
2. Backend calls `supabase.auth.admin.generateLink({ type: 'recovery', redirectTo: FRONTEND_URL + '/reset-password' })` and emails the resulting `action_link` via Resend
3. The user clicks the link, lands on `/reset-password`, the form reads `#access_token` and the refresh token from the URL hash
4. Submitting the new password posts to `POST /api/auth/reset-password` with `{ access_token, refresh_token, password }`
5. Backend validates the access token with `supabase.auth.getUser(token)` and updates the password with `supabase.auth.admin.updateUserById`

### Invite flow (company admin invites a learner)

1. `CompanyAdminLearners.jsx` posts to `POST /api/organisations/:orgId/learners` with `{ email, first_name, last_name }`
2. Backend creates the Supabase auth user with `supabase.auth.admin.createUser`, inserts a `public.users` row with `is_active = false`, and calls `supabase.auth.admin.generateLink({ type: 'invite', redirectTo: FRONTEND_URL + '/accept-invite' })`
3. The invite link is emailed through Resend (custom HTML template, branded)
4. The learner opens the link → `/accept-invite`
5. `AcceptInvite.jsx` first calls `POST /api/auth/accept-invite-info` with the access token to prefill the form with email and check `is_active`; then on submit it posts `{ access_token, refresh_token, password, first_name, last_name }` to `POST /api/auth/accept-invite`
6. Backend sets the password via `updateUserById`, sets `email_confirm: true`, updates `public.users.is_active = true` and the names

After accept-invite, the user is redirected to `/login` (they are not auto-signed in) and they sign in with the password they just chose.

---

## API Surface

The full reference lives in [`docs/API.md`](docs/API.md). High-level shape:

- All endpoints return `{ success: boolean, data?: any, error?: string }`
- Authenticated endpoints require `Authorization: Bearer <supabase-jwt>`
- Request bodies on writes are validated with `express-validator` before the controller runs
- List endpoints return `{ rows, total, page, pageSize }`; the frontend always reads `data.rows`

| Resource | Routes |
|---|---|
| Auth | `GET /api/auth/me` |
| Public | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/accept-invite`, `POST /api/auth/accept-invite-info`, `GET /api/verify/:id` |
| Courses | full CRUD on courses, sections, lessons — `GET /api/courses` returns all for super_admin and only published for company_admin / learner |
| Organisations | list + create (super_admin), create first company admin, list users, create learner, activate / deactivate / delete user, resend invite |
| Enrolments | list, create (bulk), delete, report, `me`, `me/:courseId` |
| Progress | mark a lesson complete, get progress for a course |
| Certificates | generate (idempotent on `(learner, course)`), list mine, list org, download |
| Stats | platform totals (super_admin) |
| Health | `GET /health` (no auth) |

---

## Transactional Emails

Templates live in `backend/src/templates/emails/`. The layout (`_layout.html`) is shared by every email and includes the ILMS wordmark, the body region, and the footer.

| Template | Sent by | Subject |
|---|---|---|
| `welcome.html` | `createCompanyAdmin` | `Welcome to ILMS` |
| `invite.html` | `createLearner` (initial), `resendInvite` | `You're invited to join <company> on ILMS` |
| `password-reset.html` | `forgotPassword` | `Reset your ILMS password` |
| `welcome.html` (login URL variant) | welcome email | `Welcome to ILMS` |
| Inline HTML | `generateCertificate` | `Certificate of Completion - <course>` (with PDF attachment) |

Captured screenshots of each email go in the [Transactional Emails](#transactional-emails) section above.

---

## Certificates

- Generation: `POST /api/certificates` with `{ course_id }` — guarded by completion check (all lessons must be `lesson_progress.completed = true`)
- Idempotent: a second call for the same `(learner, course)` returns 400
- PDF is generated in-memory with `pdf-lib` (no template engine — text is laid out at fixed coordinates on an A5-landscape canvas using the brand teal and navy)
- PDF is uploaded to the `certificates` Supabase Storage bucket and the row is inserted with the storage path
- The same PDF is emailed to the learner as a base64 attachment and the enrolment is updated to `status: 'completed'`
- The learner's `My certificates` page downloads the file via `/api/certificates/:id/download`, which rebuilds the PDF on demand from the same builder (so the source of truth is the DB row, not the file)
- Public verification: `GET /api/verify/:certificateId` (no auth) returns `{ valid, certificate_id, learner_name, course_title, issued_at }`; the `VerifyCertificate.jsx` page at `/verify/:id` renders this as a confirmation card

---

## Deployment

### Frontend → Vercel

1. Connect the GitHub repo to Vercel, set the root directory to `frontend/`
2. Add the env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (point this at the Railway backend's public domain)
3. `vercel.json` in the repo already declares the SPA rewrite, so `/accept-invite`, `/reset-password`, `/forgot-password` resolve to `index.html` and the client router takes over

### Backend → Railway

1. Create a new Railway project and deploy from the `backend/` folder
2. Add the env vars from `backend/.env.example` to the Railway service
3. Copy the Railway-provided public domain (it lives under **Settings → Networking** and typically has a `-production` suffix — that is the only correct value to paste into Vercel's `VITE_API_URL` and into the CORS allowlist)
4. Set the Railway service memory to at least 1 GB and disable autoscaling on free tier (or expect cold-start lag)

### Supabase Auth configuration

After both deploys are live:

- In **Authentication → URL Configuration**:
  - **Site URL** = your production frontend origin
  - **Additional Redirect URLs** must include:
    - `https://<your-frontend>/reset-password`
    - `https://<your-frontend>/accept-invite`

### Resend

- Verify your sending domain at https://resend.com/domains
- Set `RESEND_FROM_EMAIL` to an address on that verified domain (e.g. `no-reply@incodet.com`)
- For local dev, `onboarding@resend.dev` works out of the box with a low per-day cap

### End-to-end smoke test after deploy

1. Create a test organisation + test company admin via the super admin dashboard
2. Invite a personal email address from the company admin's Learners page
3. Open the invite email, click the link, set a password, land on `/login`, sign in
4. Enrol yourself on a published course, watch a lesson, mark it complete, see progress in the dashboard
5. Finish all lessons, request the certificate, confirm the email arrives with a valid PDF attachment
6. Open the public verify URL in an incognito tab — it should resolve

---

## Manual Steps the Coding Agent Cannot Do

These are the integration checkpoints that require a real Supabase, Resend, Railway, Vercel, and YouTube account. The agent will pause and ask at each one — see `AGENTS.md` for the full prose.

| Step | What the human must do |
|---|---|
| **PAUSE 1** | Create a Supabase project, copy URL + anon/service keys + DB connection string into `.env` |
| **PAUSE 2** | Create a Resend account, generate an API key, paste into `.env` |
| **PAUSE 3** | Apply `docs/schema.sql` in the Supabase SQL Editor, create the two storage buckets |
| **PAUSE 4** | Verify seed data and that the three test accounts can log in |
| **PAUSE 5** | Create the Railway project, add env vars, copy the public domain; create the Vercel project, add env vars, deploy |
| **PAUSE 6** | For every course, upload the video to YouTube as **Unlisted**, paste the URL into the lesson form |

---

## Design System

Defined in `AGENTS.md` and `UI_UX_PLAN.md`. The four brand colours are exposed as Tailwind theme tokens in `index.css`:

| Token | Hex | Use |
|---|---|---|
| Primary Teal | `#01696f` | Navigation, primary buttons, active states, brand accents |
| Dark Navy | `#032147` | Sidebar background, main headings, info-toast background |
| Accent Green | `#437a22` | Success states, completion badges, "Activate" actions |
| Neutral Gray | `#888888` | Supporting text, labels, placeholders, captions |
| Background | `#f7f6f2` | Page canvas |
| White Surface | `#ffffff` | Cards, modals, forms, table rows |

Toast notifications are top-centred, dark, with a coloured ring, a 4-variant icon (success, error, info, warning), and an 8-second auto-dismiss. They support `useToast().success / .error / .info / .warning` and were deliberately made prominent per product feedback that the inline alert style was missed.

Motion is driven by Motion 12 for page transitions and component-level fades, with GSAP reserved for one-shot timeline effects (e.g. dashboard hero reveals) and Lenis for smooth scroll. The `prefers-reduced-motion` media query is honoured globally.

---

## Coding Standards

From `AGENTS.md` — these are the rules every change must follow:

1. Use the latest stable versions of all libraries and idiomatic approaches as of today
2. Keep it simple — never over-engineer, always simplify, no defensive programming
3. Be concise. No emojis. Keep READMEs minimal (this file is the one deliberate exception)
4. When something breaks, identify the **root cause** before proposing a fix. Prove it with evidence, then fix the cause
5. Use `async/await` consistently — no raw Promise chains
6. Every API route validates its body and params with `express-validator` before the controller runs
7. Sensitive config via environment variables only — never hardcoded
8. Frontend state via React Context + `useReducer` (no Redux for MVP)
9. All API responses follow `{ success, data?, error? }`
10. Database queries use parameterised statements only — no string interpolation in SQL

The project also enforces consistent list-endpoint contracts (`{ rows, total, page, pageSize }`), one Supabase client per runtime (anon in the browser, service_role in the backend), and a single shared `assertSameOrg` helper in the organisations controller for any operation scoped to a single tenant.

---

## Troubleshooting

### `Cannot read properties of null (reading 'role')` on login

The browser anon client cannot read its own row in `public.users` when RLS is on. The fix is the dedicated `GET /api/auth/me` endpoint, which uses the service_role client. If you ever reintroduce direct supabase-js reads of the `users` table from the browser, this error will come back. See `backend/src/routes/auth.js:6` for the explanation in code.

### Enrolments table shows "No enrolments yet" even after enrolling

The backend list endpoint must return the same shape as every other list endpoint — `{ rows, total, page, pageSize }`. If you ever see a list endpoint returning a bare array, the consumer `setRows(data.rows || [])` will silently fall back to `[]`. The fix lives in `backend/src/controllers/enrolments.js:84`.

### Invite email arrives but the link shows "Invalid or expired link"

The link is generated by Supabase's `generateLink` with a `redirectTo` that points at our frontend. Email clients (Gmail in particular) strip URL fragments from `<a href>` attributes — the `access_token` part of the Supabase action link lives in the fragment, so a manual rewrite of `action_link` to put the hash directly in the URL was unreliable. The current implementation passes the action link through unchanged and lets Supabase's redirect endpoint do the work; the frontend reads the hash on the `/reset-password` and `/accept-invite` pages. Do not reintroduce a manual hash-rewriter helper.

### CORS errors in the browser console

The backend allowlists origins via `ALLOWED_ORIGINS` (comma-separated) plus `FRONTEND_URL` as a default. If the Vercel preview URL changes, add it to `ALLOWED_ORIGINS` in Railway. The Vercel **production** domain must be in the allowlist or the live app will fail every request.

### Email sends fail

Check the Resend dashboard for the error. The most common cause is the `RESEND_FROM_EMAIL` not being on a verified domain. Switch to `onboarding@resend.dev` (Resend's shared test sender) to confirm the rest of the pipeline works, then verify your own domain and switch back.

### Storage upload fails for the certificate

The `certificates` bucket is private. The backend writes to it with the service_role client (bypass RLS), but the download endpoint regenerates the PDF on the fly from the certificate row — the file in storage is only used as a record. If the upload itself fails, the API will return 500 and the learner will not be emailed; check Railway logs for the exact `supabase.storage` error.

### `npm run dev` from a fresh clone fails

Most likely cause: missing `.env` files. Copy `backend/.env.example` to `.env` at the repo root (the backend reads it from there) and create `frontend/.env` manually with the `VITE_` keys. The env files are git-ignored on purpose.

---

## Further Reading

- [`docs/PLAN.md`](docs/PLAN.md) — original implementation plan, all 10 parts
- [`docs/API.md`](docs/API.md) — full endpoint reference
- [`docs/ER.md`](docs/ER.md) — data model, indexes, RLS notes
- [`docs/schema.sql`](docs/schema.sql) — base migration
- [`docs/rls-policies.sql`](docs/rls-policies.sql) — RLS policies applied after the base migration
- [`UI_UX_PLAN.md`](UI_UX_PLAN.md) — design language and per-page UI notes
- [`AGENTS.md`](AGENTS.md) — project rules, manual steps the agent pauses on, and the design tokens
