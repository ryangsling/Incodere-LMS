# Project Plan - ILMS MVP

## Goal and Approach

Build ILMS (Incodere Learning Management System), a multi-role LMS for Incodere's corporate training business targeting UK and Australian markets.

The system serves three roles:
1. Super Admin (Incodere staff) - manages the platform, organisations, and course catalogue
2. Company Admin - manages learners and enrolments within their organisation
3. Learner - views and completes assigned courses, downloads certificates

Tech stack:
- React (Vite) frontend hosted on Vercel
- Node.js + Express backend hosted on Railway
- PostgreSQL via Supabase (free tier) for database and file storage
- YouTube unlisted embeds for video lessons
- Supabase Auth for JWT-based authentication
- Resend.com for transactional emails
- pdf-lib for server-side certificate generation

Execution proceeds in gated phases. Part 1 is a hard gate: no implementation begins until the plan is approved.

## Quality Bar and Testing Policy

- Unit coverage target: minimum 70%, focused on auth flows, enrolment logic, progress tracking, and certificate generation
- Integration testing: API route coverage for all core user journeys per role
- E2E testing: at least one happy path per role (learner completes a course, admin enrols a learner, super admin creates a course)

## Current Implementation Status

> **Note (2026-06-05):** Parts 2-9 are implemented and committed. This status list was stale; updated to reflect actual state. Verified via `git log`: commits `a075f0a part 2 done` through `21348a7 part 9 done`.

- **Completed:** Parts 1, 2, 3, 4, 5, 6, 7, 8, 9
- **Pending:** Part 10 (Deployment + Compliance Reporting + Polish)

For the next phase of work see `process/features/ilms/active/ilms-mvp_PLAN_05-06-26.md` (the MVP plan, structured in 3 phases: displayable, production-grade, live deploy).

## Confirmed Design Decisions

- Supabase Auth handles all authentication; backend verifies JWT on every protected request via middleware
- Three roles stored in `users.role` column: `super_admin`, `company_admin`, `learner`
- Course structure: Course → Sections → Lessons (3-level hierarchy)
- Video lessons embed YouTube unlisted URLs via iframe
- Progress tracked per lesson per learner in `lesson_progress` table
- Certificate generated server-side as PDF using pdf-lib and emailed via Resend
- All API responses follow `{ success: boolean, data?: any, error?: string }`

---

## Part 1 - Planning and Project Baseline (Hard Gate)

**Status:** Completed

### Tasks

- [x] Confirm requirements, roles, and technical constraints in root `AGENTS.md`
- [x] Define project folder structure in `AGENTS.md`
- [x] Document all manual steps and PAUSE points in `AGENTS.md`
- [x] Expand this plan with implementation tasks, tests, and success criteria per phase
- [x] Pause and wait for explicit user approval before starting Part 2

### Tests

- [ ] Documentation quality check: all phases have actionable tasks and clear success criteria

### Success Criteria

- [x] Plan is detailed enough to execute phase by phase without ambiguity
- [x] AGENTS.md documents all coding standards, roles, color scheme, and tech stack
- [x] All manual steps are documented with explicit PAUSE points
- [x] User explicitly approves plan before Part 2 starts

---

## Part 2 - Project Scaffolding and Environment Setup

**Status:** Pending

> **PAUSE REQUIRED before starting this part.**
> The agent must ask the developer to complete PAUSE 1 (Supabase setup) and PAUSE 2 (Resend setup) from `AGENTS.md` and confirm both are done before writing any code.

### Tasks

- [ ] Initialise frontend with Vite + React in `frontend/`
- [ ] Initialise backend with Node.js + Express in `backend/`
- [ ] Install and configure Tailwind CSS in frontend
- [ ] Create `.env.example` with all required environment variables documented
- [ ] Create `.env` locally (gitignored) with real values filled in from PAUSE 1 and PAUSE 2
- [ ] Add root `README.md` with local setup steps for frontend and backend
- [ ] Confirm both dev servers run locally (`npm run dev` for frontend and backend)

### Tests

- [ ] Backend: root `GET /` returns `{ success: true, data: "ILMS API running" }`
- [ ] Frontend: Vite dev server loads default React page without errors
- [ ] Backend: Supabase client initialises without error using env vars

### Success Criteria

- [ ] Both frontend and backend start locally without errors
- [ ] `.env.example` documents every required variable with a description comment
- [ ] Developer confirms Supabase and Resend credentials are working before Part 3 starts

---

## Part 3 - Database Schema and Supabase Setup

**Status:** Pending

### Tasks

- [ ] Design and write full PostgreSQL schema in `docs/schema.sql`
- [ ] Tables required: `users`, `organisations`, `courses`, `sections`, `lessons`, `enrolments`, `lesson_progress`, `certificates`
- [ ] Include all foreign keys, indexes, and `created_at`/`updated_at` timestamps
- [ ] Write seed SQL for: one super admin user, one test organisation, one test company admin, one test learner
- [ ] Present schema to developer for sign-off before applying

> **PAUSE REQUIRED after schema sign-off.**
> The agent must ask the developer to complete PAUSE 3 (apply schema via Supabase SQL editor and create storage buckets) and PAUSE 4 (verify seed data) from `AGENTS.md`. Do not proceed to Part 4 until both PAUSEs are confirmed.

### Tests

- [ ] Schema review: all required entities, relationships, and constraints are present
- [ ] Seed accounts: confirm all three roles exist in Supabase Auth and `users` table

### Success Criteria

- [ ] Schema is fully documented in `docs/schema.sql`
- [ ] Developer has applied schema in Supabase and confirmed no errors
- [ ] Storage buckets `course-thumbnails` and `certificates` created with correct policies
- [ ] All three test accounts are confirmed working
- [ ] Developer explicitly signs off before Part 4 starts

---

## Part 4 - Authentication (All Roles)

**Status:** Pending

### Tasks

- [ ] Implement login page in frontend (email + password form)
- [ ] Integrate Supabase Auth client (`@supabase/supabase-js`) in frontend
- [ ] On login success, store JWT in memory (not localStorage) and set auth context
- [ ] Add backend middleware `verifyAuth` to validate Supabase JWT on all protected routes
- [ ] Add backend middleware `requireRole(role)` to enforce role-based access per route
- [ ] Implement logout (clear auth context, redirect to login)
- [ ] Redirect unauthenticated users to login page on any protected route
- [ ] Redirect each role to their correct dashboard after login:
  - `super_admin` → `/super-admin`
  - `company_admin` → `/admin`
  - `learner` → `/dashboard`

### Tests

- [ ] Unit: `verifyAuth` rejects missing or invalid JWT with 401
- [ ] Unit: `requireRole` rejects wrong-role JWT with 403
- [ ] Integration: login flow issues valid token and redirects to correct dashboard per role
- [ ] E2E: learner cannot reach `/admin` or `/super-admin` routes
- [ ] E2E: company admin cannot reach `/super-admin` routes

### Success Criteria

- [ ] All three test accounts can log in and reach their correct dashboard
- [ ] Invalid credentials show a clear inline error message
- [ ] Unauthenticated requests to protected API routes return 401
- [ ] Cross-role access returns 403 with no data leak

---

## Part 5 - Course Management (Super Admin)

**Status:** Pending

> **Reminder:** Before adding any real courses, the developer must complete PAUSE 6 (YouTube video upload and unlisted URL) from `AGENTS.md` for each video lesson. The agent must remind the developer of this whenever a video lesson is being created.

### Tasks

- [ ] Build super admin dashboard layout (sidebar nav + main content area)
- [ ] Course list page: title, category, lesson count, published/draft status
- [ ] Create course form: title, description, category, thumbnail upload to Supabase Storage, status toggle
- [ ] Section management within a course: add, edit, delete, reorder
- [ ] Lesson management within a section: title, type (video/text), YouTube URL or text content, order
- [ ] Edit and delete course, section, lesson
- [ ] Backend CRUD routes: `/api/courses`, `/api/courses/:id/sections`, `/api/sections/:id/lessons`
- [ ] All routes protected with `requireRole('super_admin')`

### Tests

- [ ] Unit: course creation rejects missing title or zero sections
- [ ] Unit: video lesson creation rejects non-YouTube URLs
- [ ] Integration: full CRUD flow for course → section → lesson
- [ ] Integration: draft courses return 403 on learner-facing routes

### Success Criteria

- [ ] Super admin can create a complete course with multiple sections and lessons end to end
- [ ] Course thumbnail uploads correctly to Supabase Storage
- [ ] Draft courses are invisible to learners
- [ ] All 10 existing Incodere courses can be entered through this interface

---

## Part 6 - Organisation and Learner Management (Super Admin + Company Admin)

**Status:** Pending

### Tasks

- [ ] Super admin: create and list organisations (name, contact email, created date)
- [ ] Super admin: create a company admin account for an organisation (triggers welcome email via Resend)
- [ ] Company admin dashboard layout (sidebar nav + main content area)
- [ ] Company admin: view their own organisation details
- [ ] Company admin: create learner accounts (name, email - auto-generated password, welcome email sent via Resend)
- [ ] Company admin: list all learners in their organisation with active/inactive status
- [ ] Company admin: deactivate a learner (soft delete - sets `is_active = false`, blocks login)
- [ ] Backend routes: `/api/organisations`, `/api/organisations/:id/users`
- [ ] RLS enforces company admin only sees users in their own organisation

### Tests

- [ ] Unit: learner creation sends welcome email via Resend with credentials
- [ ] Integration: company admin cannot read or modify users from another organisation (403)
- [ ] Integration: deactivated learner login attempt returns 403

### Success Criteria

- [ ] Super admin can create an organisation and assign it a company admin
- [ ] Company admin can create and list their own learners
- [ ] New learners receive a welcome email with login credentials
- [ ] Deactivated learner is blocked from logging in immediately

---

## Part 7 - Enrolment and Course Assignment

**Status:** Pending

### Tasks

- [ ] Company admin: enrol one or more learners onto a course (multi-select learners, pick published course)
- [ ] Enrolment record: learner_id, course_id, organisation_id, enrolled_at, status
- [ ] Learner dashboard: shows only enrolled courses with title, thumbnail, and completion percentage
- [ ] Company admin: enrolment table showing each learner, their course, progress %, and certificate status
- [ ] Company admin: unenrol a learner from a course
- [ ] Backend routes: `POST /api/enrolments`, `GET /api/enrolments`, `DELETE /api/enrolments/:id`
- [ ] Enrolment route enforces: company admin can only enrol their own learners onto published courses

### Tests

- [ ] Integration: company admin cannot enrol learners from another organisation (403)
- [ ] Integration: learner only sees their own enrolled courses, not others
- [ ] Integration: unenrolled learner loses course access immediately

### Success Criteria

- [ ] Company admin can enrol multiple learners onto a course in one action
- [ ] Learner dashboard shows accurate progress percentage per enrolled course
- [ ] Enrolment management table visible and accurate for company admin

---

## Part 8 - Course Player and Progress Tracking (Learner)

**Status:** Pending

### Tasks

- [ ] Learner course page: sidebar listing all sections and lessons with completion tick per lesson
- [ ] Lesson view: renders YouTube iframe (video lesson) or formatted text content (text lesson)
- [ ] "Mark as Complete" button per lesson; saves record to `lesson_progress` table
- [ ] Auto-advance to next lesson after marking complete
- [ ] Progress percentage = `completed_lessons / total_lessons * 100`, shown on course page and dashboard
- [ ] Backend routes: `POST /api/progress`, `GET /api/progress/:courseId`
- [ ] Block progress submission for courses the learner is not enrolled in (403)

### Tests

- [ ] Unit: progress percentage correct at 0%, partial completion, and 100%
- [ ] Integration: marking a lesson complete persists and updates course progress
- [ ] Integration: learner cannot post progress for a non-enrolled course (403)
- [ ] E2E: learner completes all lessons and progress reaches 100%

### Success Criteria

- [ ] Learner can navigate all lessons via the sidebar
- [ ] Each lesson completion updates the progress bar immediately
- [ ] Progress persists correctly across sessions
- [ ] Video and text lessons both render cleanly

---

## Part 9 - Certificate Generation and Delivery

**Status:** Pending

### Tasks

- [ ] On 100% course completion, trigger certificate generation in backend (idempotent - generate once only)
- [ ] Generate PDF using pdf-lib: learner full name, course name, completion date, Incodere branding and color scheme
- [ ] Upload PDF to Supabase Storage `certificates/` bucket (private)
- [ ] Save record to `certificates` table: learner_id, course_id, file_path, issued_at
- [ ] Send certificate email to learner via Resend with PDF attached
- [ ] Learner dashboard: "My Certificates" tab lists all earned certificates with download button
- [ ] Download uses Supabase signed URL (1 hour expiry), generated on each request
- [ ] Company admin: view and download certificates for any of their learners

### Tests

- [ ] Unit: certificate PDF contains learner name, course name, and correct date
- [ ] Integration: certificate generated only once per learner per course even if endpoint called twice
- [ ] Integration: signed URL returns a valid downloadable PDF
- [ ] Integration: certificate email triggered at 100% completion only, not at 99%

### Success Criteria

- [ ] Certificate PDF generates correctly and matches Incodere branding
- [ ] Learner receives email within 60 seconds of completing a course
- [ ] Certificates downloadable from both learner dashboard and company admin panel
- [ ] No duplicate certificates generated for the same learner and course

---

## Part 10 - Compliance Reporting, Deployment, and Polish

**Status:** Pending

> **PAUSE REQUIRED before deployment tasks in this part.**
> The agent must ask the developer to complete PAUSE 5 (Railway backend deployment and Vercel frontend deployment) from `AGENTS.md` and confirm both are live before running any deployment-related tasks or tests.

### Tasks

- [ ] Company admin: compliance report page - all learners, assigned courses, progress %, certificate status
- [ ] Export compliance report as CSV (one row per learner per course)
- [ ] Filter report by course, by status (complete / in progress / not started)
- [ ] Super admin: platform stats page (total organisations, total learners, total completions)
- [ ] Frontend polish: loading skeletons, empty states, and inline error messages for every page
- [ ] Mobile responsiveness for all learner-facing pages (dashboard, course player, certificates)
- [ ] Update backend `VITE_API_URL` in frontend to point to live Railway URL
- [ ] Deploy frontend to Vercel, backend to Railway, confirm live URLs work end to end
- [ ] Final E2E pass on production URLs covering all three role journeys

### Tests

- [ ] Integration: CSV export contains correct and complete data for all enrolment states
- [ ] Integration: status filters reduce report rows correctly
- [ ] E2E (production): full learner journey - login, complete all lessons, receive certificate, download it
- [ ] E2E (production): company admin - create learner, enrol, view progress, export CSV report
- [ ] E2E (production): super admin - create organisation, create course, view platform stats

### Success Criteria

- [ ] Compliance report is accurate and exportable for any organisation
- [ ] All empty states show helpful, non-generic messages
- [ ] All three role journeys pass E2E on live production URLs
- [ ] ILMS is fully deployed and accessible with no manual steps beyond env var configuration
