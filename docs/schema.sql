-- ILMS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('super_admin', 'company_admin', 'learner')),
  organisation_id uuid references organisations(id) on delete set null,
  first_name text not null,
  last_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video', 'text')),
  video_url text,
  content text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table enrolments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (learner_id, course_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learner_id, lesson_id)
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  file_path text not null,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (learner_id, course_id)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_users_email on users(email);
create index idx_users_organisation on users(organisation_id);
create index idx_users_role on users(role);

create index idx_courses_status on courses(status);
create index idx_courses_created_by on courses(created_by);

create index idx_sections_course_order on sections(course_id, sort_order);

create index idx_lessons_section_order on lessons(section_id, sort_order);

create index idx_enrolments_learner on enrolments(learner_id);
create index idx_enrolments_course on enrolments(course_id);
create index idx_enrolments_status on enrolments(status);

create index idx_lesson_progress_learner on lesson_progress(learner_id);
create index idx_lesson_progress_lesson on lesson_progress(lesson_id);

create index idx_certificates_learner on certificates(learner_id);
create index idx_certificates_course on certificates(course_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organisations_updated_at
  before update on organisations for each row execute function update_updated_at();

create trigger trg_users_updated_at
  before update on users for each row execute function update_updated_at();

create trigger trg_courses_updated_at
  before update on courses for each row execute function update_updated_at();

create trigger trg_sections_updated_at
  before update on sections for each row execute function update_updated_at();

create trigger trg_lessons_updated_at
  before update on lessons for each row execute function update_updated_at();

create trigger trg_lesson_progress_updated_at
  before update on lesson_progress for each row execute function update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================
-- Run docs/seed.js after this to create auth users + public users.
-- Only seed the organisation here since it has no auth dependency.

insert into organisations (name, contact_email)
values ('Test Company', 'admin@testcompany.com');
