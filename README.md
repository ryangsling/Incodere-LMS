# ILMS — incodet Learning Management System

Multi-tenant corporate learning management system by [incodet.com](https://incodet.com). Three user roles: super admin (incodet staff), company admin (client HR/training managers), and learner (employees).

## Tech Stack

- React (Vite) frontend
- Node.js + Express backend REST API
- PostgreSQL via Supabase
- Supabase Auth (JWT)
- YouTube iframe for video lessons
- pdf-lib for certificate PDF generation
- Resend for transactional emails

## Prerequisites

- Node.js 22+
- npm 10+
- Supabase project (free tier)
- Resend account (free tier)

## Setup

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example ../.env
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
cp .env.example ../.env
npm install
npm run dev
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Supabase project settings
- `DATABASE_URL` from Supabase database settings
- `RESEND_API_KEY` from Resend dashboard

### 3. Database

Apply `docs/schema.sql` in Supabase SQL Editor. This creates all tables, indexes, and triggers.

Create two storage buckets:
- `course-thumbnails` (public)
- `certificates` (private)

### 4. Seed data

```bash
node docs/seed.js
```

Creates three test accounts:
- `super@incodet.com` / `SuperAdmin123!` (super admin)
- `admin@testcompany.com` / `Admin123!` (company admin)
- `learner@testcompany.com` / `Learner123!` (learner)

## Running

```bash
# Backend on port 3000
cd backend && npm run dev

# Frontend on port 5173
cd frontend && npm run dev
```

## Roles

| Role | Access | Default redirect |
|---|---|---|
| super_admin | Platform management, all orgs and courses | /super-admin |
| company_admin | Own org's learners and enrolments | /admin |
| learner | Enrolled courses, progress, certificates | /dashboard |

The public landing page at `/` introduces the product and links to `/login`.

## Project Structure

```
ilms/
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # Route components
│       ├── context/   # AuthContext
│       └── utils/     # API client, supabase
├── backend/           # Express API
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/ # verifyAuth, requireRole
│       └── db/        # Supabase client
├── docs/
│   ├── PLAN.md        # Full implementation plan
│   ├── schema.sql     # PostgreSQL schema
│   └── seed.js        # Test data seeder
└── .env.example
```
