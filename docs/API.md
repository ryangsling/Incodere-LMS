# ILMS API Reference

All endpoints return `{ success: boolean, data?: any, error?: string }`.
Authenticated endpoints require `Authorization: Bearer <supabase-jwt>`.

## Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | Health check (uptime, service name) |
| GET | `/` | none | Service banner |

## Public

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/verify/:certificateId` | none | Verify a certificate by ID |

## Courses

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/courses` | any | All (super_admin) or published (others). Query: `q`, `status`, `category`, `page`, `pageSize` |
| GET | `/api/courses/:id` | any | Full course with sections + lessons |
| POST | `/api/courses` | super_admin | Create course |
| PUT | `/api/courses/:id` | super_admin | Update course (partial) |
| DELETE | `/api/courses/:id` | super_admin | Delete course (cascades) |
| GET | `/api/courses/:courseId/sections` | super_admin | List sections |
| POST | `/api/courses/:courseId/sections` | super_admin | Create section |
| PUT | `/api/courses/sections/:id` | super_admin | Update section |
| DELETE | `/api/courses/sections/:id` | super_admin | Delete section |
| GET | `/api/courses/sections/:sectionId/lessons` | super_admin | List lessons |
| POST | `/api/courses/sections/:sectionId/lessons` | super_admin | Create lesson |
| PUT | `/api/courses/lessons/:id` | super_admin | Update lesson (partial) |
| DELETE | `/api/courses/lessons/:id` | super_admin | Delete lesson |

## Organisations

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/organisations` | super_admin | List orgs. Query: `q`, `page`, `pageSize` |
| POST | `/api/organisations` | super_admin | Create org |
| POST | `/api/organisations/:orgId/company-admin` | super_admin | Create company admin (emails creds) |
| GET | `/api/organisations/:orgId/users` | super_admin, company_admin | List org users. Query: `q`, `role`, `page`, `pageSize` |
| POST | `/api/organisations/:orgId/learners` | company_admin | Create learner (emails creds) |
| PUT | `/api/organisations/users/:id/deactivate` | super_admin, company_admin | Deactivate user |

## Enrolments

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/enrolments` | super_admin, company_admin | List enrolments (scoped to own org) |
| POST | `/api/enrolments` | company_admin | Enrol learners on a course. Body: `{ learner_ids, course_id }` |
| DELETE | `/api/enrolments/:id` | super_admin, company_admin | Remove enrolment |
| GET | `/api/enrolments/report` | company_admin | Completion report. Query: `course_id`, `status`, `q`, `page`, `pageSize` |
| GET | `/api/enrolments/me` | learner | My enrolments with progress |
| GET | `/api/enrolments/me/:courseId` | learner | Get enrolled course with sections + lessons |

## Progress

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/progress` | learner | Mark lesson complete |
| GET | `/api/progress/:courseId` | learner | Get progress for a course |

## Certificates

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/certificates` | learner | Generate certificate (requires 100% completion) |
| GET | `/api/certificates/mine` | learner | My certificates |
| GET | `/api/certificates` | super_admin, company_admin | All (scoped to own org) |

## Stats

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/stats` | super_admin | Platform stats (orgs, users, courses, completions) |

## Response Shapes

### List endpoints
```json
{
  "success": true,
  "data": {
    "rows": [...],
    "total": 42,
    "page": 1,
    "pageSize": 50
  }
}
```

### Single resource
```json
{ "success": true, "data": { ... } }
```

### Error
```json
{ "success": false, "error": "Human readable message" }
```

## Rate Limits

| Bucket | Window | Max | Applied to |
|---|---|---|---|
| General | 1 min | 100 | All endpoints |
| Writes | 1 min | 30 | POST/PUT/DELETE/PATCH |
| Expensive | 1 min | 10 | POST /certificates, GET /enrolments/report |

## Security Headers (helmet)

CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc. set automatically.
Allowlist comes from `ALLOWED_ORIGINS` env var.
