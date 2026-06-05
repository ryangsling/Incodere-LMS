# ILMS Database (ER Overview)

```
organisations (1) ───< (N) users
                       ├── role: super_admin | company_admin | learner
                       └── organisation_id -> organisations.id (nullable for super_admin)

courses (N) >── (1) organisations (via created_by -> users.id)
courses (1) ───< (N) sections
sections (1) ───< (N) lessons

enrolments (N) >── (1) users   [learner_id]
enrolments (N) >── (1) courses [course_id]
enrolments (N) >── (1) organisations [organisation_id]

lesson_progress (N) >── (1) users   [learner_id]
lesson_progress (N) >── (1) lessons  [lesson_id]
lesson_progress.completed: boolean

certificates (N) >── (1) users   [learner_id]
certificates (N) >── (1) courses [course_id]
```

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| organisations | Tenants | name, contact_email, is_active |
| users | All users across roles | email, role, organisation_id, is_active |
| courses | Course catalogue | title, description, category, status, created_by |
| sections | Course chapters | course_id, title, sort_order |
| lessons | Course lessons | section_id, title, type (video/text), video_url, content |
| enrolments | Learner ↔ Course link | learner_id, course_id, organisation_id, status |
| lesson_progress | Per-lesson completion | learner_id, lesson_id, completed |
| certificates | Issued certs | learner_id, course_id, file_path, issued_at |
| categories | Course taxonomy (v2) | slug, name, sort_order |

## Multi-tenant isolation

Enforced at the application layer (`verifyAuth` middleware reads the caller's
`users.organisation_id` and scopes queries) AND at the database layer
(`docs/rls-policies.sql` adds RLS policies for every tenant-data table).

## Indexes

- `users(email)`, `users(organisation_id)`, `users(role)`
- `courses(status)`, `courses(created_by)`, `courses(category_id)`
- `sections(course_id, sort_order)`, `lessons(section_id, sort_order)`
- `enrolments(learner_id)`, `enrolments(course_id)`, `enrolments(status)`
- `lesson_progress(learner_id)`, `lesson_progress(lesson_id)`
- `certificates(learner_id)`, `certificates(course_id)`

## Migrations

1. `docs/schema.sql` — base tables, indexes, triggers, seed org
2. `docs/rls-policies.sql` — RLS enable + per-role policies
3. `docs/schema-v2.sql` — categories table + courses.category_id FK

Apply in order. All idempotent where possible.
