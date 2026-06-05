-- ILMS Row-Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor.
-- Enables RLS on all tenant-data tables and enforces multi-tenant
-- isolation at the database layer.
--
-- This version inlines the role + organisation_id check in each
-- policy instead of using helper functions. That avoids Postgres'
-- "column does not exist" parse-time false negative that hits when
-- a SECURITY DEFINER function with set search_path references
-- schema-qualified tables (known Supabase quirk).

-- ============================================
-- ENABLE RLS
-- ============================================

alter table organisations enable row level security;
alter table users enable row level security;
alter table courses enable row level security;
alter table sections enable row level security;
alter table lessons enable row level security;
alter table enrolments enable row level security;
alter table lesson_progress enable row level security;
alter table certificates enable row level security;

-- ============================================
-- POLICIES: organisations
-- ============================================
-- super_admin: full access
-- company_admin / learner: read own organisation only

drop policy if exists organisations_super_admin_all on organisations;
create policy organisations_super_admin_all
  on organisations for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists organisations_members_read on organisations;
create policy organisations_members_read
  on organisations for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and organisation_id = organisations.id
    )
  );

-- ============================================
-- POLICIES: users
-- ============================================
-- super_admin: full access
-- company_admin: read/update users in own organisation
-- learner: read self + read other users in own organisation (for cohort display)

drop policy if exists users_super_admin_all on users;
create policy users_super_admin_all
  on users for all
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
  );

drop policy if exists users_company_admin_read_org on users;
create policy users_company_admin_read_org
  on users for select
  to authenticated
  using (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = users.organisation_id
    )
  );

drop policy if exists users_company_admin_update_org on users;
create policy users_company_admin_update_org
  on users for update
  to authenticated
  using (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = users.organisation_id
    )
  )
  with check (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = users.organisation_id
    )
  );

drop policy if exists users_learner_read_self_and_org on users;
create policy users_learner_read_self_and_org
  on users for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'learner'
        and me.organisation_id = users.organisation_id
    )
  );

-- ============================================
-- POLICIES: courses
-- ============================================
-- super_admin: full access
-- company_admin: read published courses (for assignment)
-- learner: read published courses only

drop policy if exists courses_super_admin_all on courses;
create policy courses_super_admin_all
  on courses for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists courses_others_read_published on courses;
create policy courses_others_read_published
  on courses for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('company_admin', 'learner')
    )
  );

-- ============================================
-- POLICIES: sections
-- ============================================
-- super_admin: full access
-- others: read sections of published courses

drop policy if exists sections_super_admin_all on sections;
create policy sections_super_admin_all
  on sections for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists sections_others_read_published_course on sections;
create policy sections_others_read_published_course
  on sections for select
  to authenticated
  using (
    course_id in (
      select c.id from courses c
      where c.status = 'published'
    )
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('company_admin', 'learner')
    )
  );

-- ============================================
-- POLICIES: lessons
-- ============================================
-- same as sections: super_admin all, others read published-course lessons

drop policy if exists lessons_super_admin_all on lessons;
create policy lessons_super_admin_all
  on lessons for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists lessons_others_read_published_course on lessons;
create policy lessons_others_read_published_course
  on lessons for select
  to authenticated
  using (
    section_id in (
      select s.id from sections s
      join courses c on c.id = s.course_id
      where c.status = 'published'
    )
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('company_admin', 'learner')
    )
  );

-- ============================================
-- POLICIES: enrolments
-- ============================================
-- super_admin: full access
-- company_admin: read/write enrolments of own organisation
-- learner: read own enrolments

drop policy if exists enrolments_super_admin_all on enrolments;
create policy enrolments_super_admin_all
  on enrolments for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists enrolments_company_admin_org on enrolments;
create policy enrolments_company_admin_org
  on enrolments for all
  to authenticated
  using (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = (
          select u.organisation_id from public.users u
          where u.id = enrolments.learner_id
        )
    )
  )
  with check (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = (
          select u.organisation_id from public.users u
          where u.id = enrolments.learner_id
        )
    )
  );

drop policy if exists enrolments_learner_read_self on enrolments;
create policy enrolments_learner_read_self
  on enrolments for select
  to authenticated
  using (learner_id = auth.uid());

-- ============================================
-- POLICIES: lesson_progress
-- ============================================
-- super_admin: full access
-- learner: full access to own progress
-- company_admin: read progress of own org's learners

drop policy if exists lesson_progress_super_admin_all on lesson_progress;
create policy lesson_progress_super_admin_all
  on lesson_progress for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists lesson_progress_learner_self on lesson_progress;
create policy lesson_progress_learner_self
  on lesson_progress for all
  to authenticated
  using (
    learner_id = auth.uid()
    and exists (select 1 from public.users where id = auth.uid() and role = 'learner')
  )
  with check (
    learner_id = auth.uid()
    and exists (select 1 from public.users where id = auth.uid() and role = 'learner')
  );

drop policy if exists lesson_progress_company_admin_read_org on lesson_progress;
create policy lesson_progress_company_admin_read_org
  on lesson_progress for select
  to authenticated
  using (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = (
          select u.organisation_id from public.users u
          where u.id = lesson_progress.learner_id
        )
    )
  );

-- ============================================
-- POLICIES: certificates
-- ============================================
-- super_admin: full access
-- company_admin: read certificates of own org's learners
-- learner: read own certificates

drop policy if exists certificates_super_admin_all on certificates;
create policy certificates_super_admin_all
  on certificates for all
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

drop policy if exists certificates_company_admin_read_org on certificates;
create policy certificates_company_admin_read_org
  on certificates for select
  to authenticated
  using (
    exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'company_admin'
        and me.organisation_id = (
          select u.organisation_id from public.users u
          where u.id = certificates.learner_id
        )
    )
  );

drop policy if exists certificates_learner_read_self on certificates;
create policy certificates_learner_read_self
  on certificates for select
  to authenticated
  using (learner_id = auth.uid());
