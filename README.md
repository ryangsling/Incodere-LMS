# ILMS — incodet Learning Management System

A multi-tenant corporate LMS for [incodet.com](https://incodet.com). Three roles: super admin (incodet staff), company admin (client HR), and learner (employee).

## Features

### Super admin

- Manage organisations (create, activate/deactivate, invite company admins)
- Full course catalogue (create, edit, publish, delete)
- Course structure editor (sections, lessons, YouTube video or text)
- Platform stats dashboard

### Company admin

- Invite and manage learners (resend invite, activate/deactivate, delete)
- Enrol learners on published courses
- Completion reports with progress tracking
- View and download certificates

### Learner

- Dashboard with enrolled courses and progress
- Course player with video and text lessons
- Mark lessons complete, track course progress
- Earn and download PDF certificates on completion
- Public certificate verification

## Screenshots

| Page | Screenshot |
|---|---|
| Landing | ![Landing](docs/screenshots/landing.png) |
| Login | ![Login](docs/screenshots/login.png) |
| Learner Dashboard | ![Learner dashboard](docs/screenshots/learner-dashboard.png) |
| Course Player | ![Course player](docs/screenshots/learner-course-player.png) |
| Company Admin Learners | ![Learners](docs/screenshots/admin-learners.png) |
| Company Admin Enrolments | ![Enrolments](docs/screenshots/admin-enrolments.png) |
| Super Admin Organisations | ![Organisations](docs/screenshots/super-organisations.png) |
| Super Admin Courses | ![Courses](docs/screenshots/super-courses.png) |
| Certificate PDF | ![Certificate PDF](docs/screenshots/certificate-pdf.png) |
| Invite Email | ![Invite email](docs/screenshots/email-invite.png) |

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 7
- **Backend**: Node.js 22, Express 5
- **Database**: PostgreSQL via Supabase (free tier)
- **Auth**: Supabase Auth (JWT)
- **Email**: Resend (transactional)
- **Storage**: Supabase Storage (course thumbnails, certificates)
- **PDF**: pdf-lib (server-side certificate generation)
- **Deployment**: Vercel (frontend) + Railway (backend)

## Quick Start

```bash
# Backend
cd backend
cp .env.example ../.env  # fill in Supabase + Resend keys
npm install && npm run dev

# Frontend (separate terminal)
cd frontend
# create .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install && npm run dev
```

Open http://localhost:5173. Apply `docs/schema.sql` in Supabase SQL Editor first, then run `node docs/seed.js` to create test accounts.

## Environment Variables

### Backend

| Key | Required | Description |
|---|---|---|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side key (bypasses RLS) |
| `DATABASE_URL` | yes | Postgres connection string |
| `RESEND_API_KEY` | yes | Resend API key |
| `FRONTEND_URL` | yes | Production frontend URL (for CORS and email links) |
| `ALLOWED_ORIGINS` | no | Comma-separated extra CORS origins |

### Frontend

| Key | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Same as backend `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `VITE_API_URL` | yes | Backend public URL |

## Deployment

1. **Supabase**: Create project, apply `docs/schema.sql`, create storage buckets (`course-thumbnails` public, `certificates` private), configure Auth redirect URLs
2. **Railway**: Deploy `backend/`, add env vars, copy the public domain from Settings > Networking
3. **Vercel**: Deploy `frontend/`, set `VITE_API_URL` to the Railway domain
4. **Resend**: Verify your sending domain, set `RESEND_FROM_EMAIL`

## License

Proprietary — incodet.com
