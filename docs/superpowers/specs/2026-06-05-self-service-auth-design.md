# Self-Service Authentication Design

**Date:** 2026-06-05
**Status:** Approved for implementation
**Scope:** Adds invite-based learner onboarding, password reset, and the backend email plumbing to ILMS.

## Context

ILMS currently has 3 hard-coded test accounts (super admin, company admin, learner) created by `docs/seed.js`. The only way to add a new learner is for a company admin to enter their email in the dashboard — the backend auto-generates a password and emails it as plaintext credentials. There is no way for a user to set their own password, recover a forgotten one, or verify their email address.

This is blocking deployment: a production corporate LMS must let users set their own passwords, recover access without admin help, and verify their email on first use.

Supabase Auth already supports invite, recovery, and email-confirmation flows. Resend is already wired up for transactional emails. This spec adds the missing pages, endpoints, and templates to expose those capabilities to end users.

## Decisions

- **Sign-up model:** Invite-only. There is no public sign-up page. Learners can only join after a company admin invites them.
- **Email sender:** Resend for all transactional emails (invite, password reset). Supabase's built-in email sender is not used.
- **Existing learner-creation flow changes** to use the new invite path automatically — no separate code path for the company admin to maintain.
- **No database schema changes.** Supabase Auth stores password hashes, email-confirmed flags, and recovery/invite tokens. The `users` table needs no new columns.
- **No RLS policy changes.** All new endpoints are public and use the `service_role` key on the backend (bypasses RLS), same as the existing `GET /api/auth/me`.

## User flows

### 1. Invite learner (replaces current "auto-generate password" flow)

1. Company admin opens the Learners tab in their dashboard and clicks "Add learner".
2. Company admin enters the learner's first name, last name, and email.
3. Frontend calls `POST /api/organisations/:orgId/learners` with that data.
4. Backend creates a Supabase auth user with `email_confirm: false`.
5. Backend inserts a matching `public.users` row with `role: 'learner'`, the company's `organisation_id`, and the name fields.
6. Backend calls `supabase.auth.admin.generateLink({type: 'invite', email})` to get a one-time action link.
7. Backend sends the invite link via Resend using `templates/emails/invite.html`.
8. Learner clicks the link → lands on `https://<frontend>/accept-invite#access_token=...&refresh_token=...&type=invite`. The tokens are in the URL fragment (not the query string) — Supabase returns them that way and the backend preserves the fragment when rebuilding the link.
9. Frontend reads `access_token` and `refresh_token` from the URL fragment, then calls `POST /api/auth/accept-invite-info` with those tokens to fetch the learner's email and name (so the form can be pre-populated and personalised).
10. Learner enters a password (twice for confirmation) and submits.
11. Frontend calls `POST /api/auth/accept-invite` with the tokens + new password + name.
12. Backend sets the Supabase session from the tokens, calls `supabase.auth.updateUser({password, data: {first_name, last_name}})`, and confirms the email.
13. Backend updates `public.users` with the final first_name/last_name.
14. Learner is redirected to `/login` and can now sign in normally.

### 2. Forgot password (new)

1. Learner clicks "Forgot password?" on `/login`.
2. Lands on `/forgot-password`, enters their email.
3. Frontend calls `POST /api/auth/forgot-password` with the email.
4. Backend calls `supabase.auth.admin.generateLink({type: 'recovery', email})` to get a one-time action link.
5. Backend sends the recovery link via Resend using `templates/emails/password-reset.html`.
6. The response is always `{ success: true }` regardless of whether the email exists, to prevent account enumeration.
7. User clicks the link → lands on `https://<frontend>/reset-password#access_token=...&refresh_token=...&type=recovery`. Tokens are in the URL fragment.
8. Frontend reads `access_token` and `refresh_token` from the URL fragment and shows a "New password" form.
9. User submits a new password (twice for confirmation).
10. Frontend calls `POST /api/auth/reset-password` with the tokens + new password.
11. Backend sets the Supabase session from the recovery tokens, then `supabase.auth.updateUser({password})`.
12. User is redirected to `/login` and can sign in with the new password.

### 3. Login (unchanged)

Existing `/login` form, `signInWithPassword` from `supabase-js`, JWT in memory, role-based redirect. No changes.

## Frontend

### New routes (in `App.jsx`)

| Path | Component | Auth |
|---|---|---|
| `/forgot-password` | `<ForgotPassword />` | Public |
| `/reset-password` | `<ResetPassword />` | Public — reads recovery tokens from URL |
| `/accept-invite` | `<AcceptInvite />` | Public — reads invite tokens from URL |

### New pages (in `frontend/src/pages/`)

- `ForgotPassword.jsx` — single email input. Submit shows a success message ("Check your email for a reset link") and a "Back to login" link. Always shows the success message even if the email is unknown (matches the no-account-enumeration backend behaviour).
- `ResetPassword.jsx` — "New password" and "Confirm password" inputs with strength hint (min 8 characters, enforced client-side and server-side). Submit button disabled until both match and meet the min length. On success, redirects to `/login` with a toast "Password updated. Please sign in."
- `AcceptInvite.jsx` — "First name", "Last name", "Password", "Confirm password" inputs. On mount, calls `accept-invite-info` to pre-populate the name fields (the user can override them). Submit on success redirects to `/login` with a toast "Account activated. Please sign in."

All three pages use a small `<AuthShell>` layout component (extracted from the existing `Login.jsx` split-pane so the new pages match the existing visual style). All three handle:
- Missing/expired/invalid tokens: show an inline error and a "Back to login" link.
- Submit in flight: disable the button, show a loading state.
- Network/server errors: show the error message in an inline banner.

### Changes to existing pages

- `Login.jsx` — add a "Forgot password?" link below the password input. Link text is small and muted.
- `Landing.jsx` — under the "Get started" CTA, add a line: "Don't have an account? Ask your training manager to send you an invite." (No link — just informational, since sign-up is invite-only.)
- `frontend/src/utils/api.js` — add an `auth` section with `forgotPassword`, `resetPassword`, `acceptInvite`, `acceptInviteInfo` methods (shape below).
- `frontend/src/context/AuthContext.jsx` — no new methods needed. The new pages call `api.auth.*` directly, not the Supabase client.

### Token handling

`supabase.auth.admin.generateLink` returns an `action_link` pointing at Supabase's verify URL (e.g., `https://<project>.supabase.co/auth/v1/verify?token=...&type=invite#access_token=...&refresh_token=...`). The backend does NOT email this link as-is — instead it parses out the fragment (`access_token`, `refresh_token`, `type`) and the redirect URL prefix, then constructs a frontend URL: `${FRONTEND_URL}/accept-invite#access_token=...&refresh_token=...&type=invite` (or `/reset-password` for recovery). The fragment is preserved as-is. The frontend reads `access_token` and `refresh_token` from `window.location.hash` and passes them in the request body to the backend, which uses `supabase.auth.setSession()` then `supabase.auth.updateUser()`.

This is simpler than wiring up `verifyOtp()` or `exchangeCodeForSession()` on the frontend and works reliably with the invite + recovery flow types.

## Backend

### New endpoints

| Method + path | Body | Auth | Behaviour |
|---|---|---|---|
| `POST /api/auth/forgot-password` | `{ email }` | Public | Generate recovery link via `supabase.auth.admin.generateLink({type:'recovery'})`, send via Resend. Returns `{ success: true }` always. Rate-limited (10 req / 15 min per IP). |
| `POST /api/auth/reset-password` | `{ access_token, refresh_token, password }` | Public | Set session from tokens, then `supabase.auth.updateUser({password})`. Returns `{ success: true }` or `{ success: false, error }`. |
| `POST /api/auth/accept-invite` | `{ access_token, refresh_token, password, first_name, last_name }` | Public | Set session, update user password + metadata, confirm email, update `public.users.first_name/last_name`. Returns `{ success: true }`. |
| `POST /api/auth/accept-invite-info` | `{ access_token, refresh_token }` | Public | Read the current user from the session, return `{ email, first_name, last_name }` (from auth metadata + `public.users`). Lets the frontend pre-populate the form. |

### Updated endpoint

`POST /api/organisations/:orgId/learners` — change backend behaviour only. Request and response shape stay the same.

Old: created auth user with `email_confirm: true` and a generated password, sent credentials in welcome email.

New: creates auth user with `email_confirm: false`, generates an invite link, sends the invite email via the new `sendInviteEmail()` function. The `password` field is no longer required (or accepted) in the request body. The company admin's UI never asks for one.

### New files

- `backend/src/routes/authPublic.js` — 4 new public endpoints, registered in `backend/src/index.js` as `app.use('/api/auth', authPublicRoutes)`.
- `backend/src/controllers/authPublic.js` — handlers. Uses `supabase.auth.admin.generateLink`, `supabase.auth.setSession`, `supabase.auth.updateUser` from the existing `db/supabase.js` admin client.
- `backend/src/services/email.js` — refactor: extract a shared `sendEmail({to, subject, html})` base, then `sendInviteEmail({to, firstName, inviteLink, companyName})`, `sendPasswordResetEmail({to, firstName, resetLink})`, and the existing `sendWelcomeEmail({to, firstName, loginUrl})` continue to work. The first one is removed (replaced by invite email).
- `backend/src/templates/emails/_layout.html` — shared header/footer (logo, ILMS wordmark, incodet footer, "© 2026 incodet" line). All three email templates use this via string concatenation (no template engine — keep it simple).
- `backend/src/templates/emails/invite.html` — invite template.
- `backend/src/templates/emails/password-reset.html` — password reset template.
- `backend/src/templates/emails/welcome.html` — updated to match the new layout (was probably inline before).

### Rate limiting

`POST /api/auth/forgot-password` must be rate-limited to prevent abuse. Reuse the existing `generalLimiter` (already applied globally to all `/api` routes) and add a dedicated `forgotPasswordLimiter` (10 req / 15 min per IP) on this single endpoint, defined in `backend/src/middleware/rateLimiters.js` next to the existing limiters.

The other 3 endpoints don't need their own rate limit (they require a valid token to do anything useful) but they should still pass through `generalLimiter`.

## Environment variables

### Backend

| Var | Required? | Description |
|---|---|---|
| `RESEND_API_KEY` | Already present | Resend API key |
| `RESEND_FROM_EMAIL` | **New** | Verified sender address, e.g. `noreply@incodet.com` |
| `RESEND_FROM_NAME` | **New** | Display name in inboxes, e.g. `ILMS by incodet` |
| `FRONTEND_URL` | Already present | Used to build invite + reset links |

### Frontend

No new vars. The new pages read tokens from the URL — no environment lookup needed.

## Resend setup (manual, by developer)

1. In Resend dashboard → Domains → Add Domain → enter `incodet.com`.
2. Add the DNS records Resend shows you (typically an SPF or DKIM TXT record) to your DNS provider.
3. Wait for Resend to verify (usually a few minutes).
4. Set `RESEND_FROM_EMAIL` in backend `.env` to your chosen address on the verified domain (e.g., `noreply@incodet.com`).

Until the domain is verified, emails can still be sent using Resend's test sender (`onboarding@resend.dev`) for local development — Resend allows it without verification, but only to the address that owns the Resend account.

## Supabase Auth configuration (manual, by developer)

In Supabase dashboard → Authentication → URL Configuration:

- **Site URL:** `https://ilms-incodet.vercel.app` (production) and `http://localhost:5173` (development — change in dev environment).
- **Additional Redirect URLs:** add the following (one per environment):
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/accept-invite`
  - `https://ilms-incodet.vercel.app/reset-password`
  - `https://ilms-incodet.vercel.app/accept-invite`

These ensure Supabase's own auth emails (if any are triggered) redirect back to the right pages. Even though we generate the links manually, having them whitelisted prevents Supabase from refusing the redirect when our custom emails land users on these URLs.

## Out of scope (not in this spec)

- Changing the `super_admin` or `company_admin` creation flows. Super admin stays invite/seed only. Company admin stays "super admin creates them in the dashboard" — that already uses a similar email flow and works fine.
- Social login (Google, Microsoft, etc.). Not in the AGENTS.md MVP.
- Multi-factor authentication. Not in the AGENTS.md MVP.
- Custom SMTP for Supabase's built-in email sender. We are not using it.

## Testing

Unit tests (new):
- `authPublicController.forgotPassword` always returns success regardless of email existence.
- `authPublicController.resetPassword` rejects passwords shorter than 8 characters.
- `authPublicController.acceptInvite` rejects missing or mismatched fields.
- `emailService.sendInviteEmail` calls Resend with the correct `to`, `from`, and rendered HTML.
- `emailService.sendPasswordResetEmail` calls Resend with the correct fields.

Integration tests (new):
- Company admin creates a learner → invite email is dispatched (mocked Resend) → accept-invite endpoint activates the user → user can sign in.
- User requests password reset → reset email is dispatched → reset-password endpoint sets new password → user can sign in with the new password.

E2E tests (new):
- Full invite journey: company admin invites learner → learner opens email link → sets password → lands on dashboard.
- Full reset journey: user clicks "Forgot password" on login → enters email → opens reset link → sets new password → signs in successfully.

Manual tests (not in CI):
- Render the invite and reset emails in 3 real email clients (Gmail web, Apple Mail, Outlook) to confirm the HTML looks right.

## Deployment prep checklist

When the implementation is complete, the developer must do the following manual steps before going live:

1. **Resend** — verify `incodet.com` as a sender domain. Set `RESEND_FROM_EMAIL` and `RESEND_FROM_NAME` in backend `.env` and in Railway's environment variables.
2. **Supabase Auth** — set Site URL and add the 4 redirect URLs listed above (both `localhost:5173` and production Vercel URL).
3. **Backend (Railway)** — follow the existing PAUSE 5 steps in `AGENTS.md`. Add the 2 new env vars (`RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`).
4. **Frontend (Vercel)** — follow the existing PAUSE 5 steps in `AGENTS.md`. No new env vars.
5. **After deploy** — create a test organisation + test company admin via the existing dashboard, invite a personal email address, confirm the invite email arrives and the link works end-to-end on the live URL.
