# Self-Service Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add invite-based learner onboarding, password reset, and the email plumbing that lets a corporate LMS run on its own without manual account creation.

**Architecture:** Invite-only sign-up (company admin invites learner → email with one-time link → learner sets own password). All transactional emails flow through Resend using HTML templates. No database or RLS changes — Supabase Auth already stores the tokens and email-confirmed flags. 4 new public backend endpoints + 3 new public frontend pages.

**Tech Stack:** Node.js + Express (existing), Supabase Auth admin API (existing), Resend (existing), React + Vite (existing), Vitest (new, for tests only).

---

## File Map

**Backend (new):**
- `backend/src/services/email.js` — extracted from inline in `organisations.js`. Shared `sendEmail()` base + 3 specific senders.
- `backend/src/utils/authLinks.js` — builds `${FRONTEND_URL}/accept-invite#...` style links from Supabase `generateLink` output.
- `backend/src/templates/emails/_layout.html` — shared header/footer used by all 3 templates.
- `backend/src/templates/emails/invite.html`
- `backend/src/templates/emails/password-reset.html`
- `backend/src/templates/emails/welcome.html` — replaces the inline welcome email; sent to company admins (kept inline-as-data flow for now).
- `backend/src/controllers/authPublic.js` — handlers for the 4 new endpoints.
- `backend/src/routes/authPublic.js` — Express router.
- `backend/tests/emailService.test.js`
- `backend/tests/authPublic.test.js`
- `backend/vitest.config.js`

**Backend (modified):**
- `backend/src/middleware/rateLimiters.js` — add `forgotPasswordLimiter`.
- `backend/src/index.js` — register `authPublicRoutes`.
- `backend/src/controllers/organisations.js` — `createLearner` switches to invite flow; `createCompanyAdmin` switches from inline `resend.emails.send` to `sendWelcomeEmail`.
- `backend/.env.example` — add `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`.

**Frontend (new):**
- `frontend/src/components/AuthShell.jsx` — split-pane layout extracted from `Login.jsx`.
- `frontend/src/pages/ForgotPassword.jsx`
- `frontend/src/pages/ResetPassword.jsx`
- `frontend/src/pages/AcceptInvite.jsx`

**Frontend (modified):**
- `frontend/src/utils/api.js` — add `api.auth.{forgotPassword, resetPassword, acceptInvite, acceptInviteInfo}`.
- `frontend/src/pages/Login.jsx` — extract split-pane to `AuthShell`, add "Forgot password?" link.
- `frontend/src/pages/Landing.jsx` — add invite-info line.
- `frontend/src/App.jsx` — add 3 new public routes.
- `frontend/.env.example` (does not exist — create).

**Docs (modified):**
- `.env.example` — add new backend vars.
- `README.md` — add "Deployment prep" section with the manual steps from the spec.

---

## Task 1: Install and configure vitest

**Files:**
- Modify: `backend/package.json`
- Create: `backend/vitest.config.js`

- [ ] **Step 1: Install vitest as a dev dependency**

Run from `backend/`:
```bash
cd backend && npm install -D vitest
```

- [ ] **Step 2: Add the `test` script to `backend/package.json`**

Modify `backend/package.json`, change the `scripts` block from:
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```
to:
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `backend/vitest.config.js`**

Create file `backend/vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.js'],
  },
})
```

- [ ] **Step 4: Create an empty test file to confirm setup works**

Create file `backend/tests/smoke.test.js`:
```javascript
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run the smoke test**

Run from `backend/`:
```bash
npm test
```

Expected output:
```
✓ tests/smoke.test.js > smoke > runs

Test Files  1 passed (1)
     Tests  1 passed (1)
```

- [ ] **Step 6: Delete the smoke test (it was just to confirm the runner works)**

```bash
rm backend/tests/smoke.test.js
```

- [ ] **Step 7: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/vitest.config.js
git commit -m "chore(backend): add vitest test runner"
```

---

## Task 2: Create the email service module

The existing `organisations.js` controller sends emails inline using `resend.emails.send(...)`. We extract this into a dedicated service module so all 3 emails (invite, password reset, welcome) share the same plumbing and template style.

**Files:**
- Create: `backend/src/services/email.js`
- Create: `backend/tests/emailService.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/emailService.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('resend', () => {
  const send = vi.fn().mockResolvedValue({ data: { id: 'email_123' }, error: null })
  return {
    Resend: vi.fn().mockImplementation(() => ({ emails: { send } })),
    __sendMock: send,
  }
})

vi.mock('../src/services/email.js', async (importOriginal) => {
  const actual = await importOriginal()
  return actual
})

import { sendEmail, sendInviteEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../src/services/email.js'
import { Resend } from 'resend'

const getSendMock = () => Resend.mock.results[0].value.emails.send

describe('email service', () => {
  beforeEach(() => {
    getSendMock().mockClear()
  })

  it('sendEmail calls Resend with the expected fields', async () => {
    await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>x</p>' })

    expect(getSendMock()).toHaveBeenCalledTimes(1)
    const call = getSendMock().mock.calls[0][0]
    expect(call.to).toBe('a@b.com')
    expect(call.subject).toBe('Hi')
    expect(call.html).toBe('<p>x</p>')
    expect(call.from).toContain('ILMS')
  })

  it('sendInviteEmail renders the invite template', async () => {
    await sendInviteEmail({
      to: 'learner@example.com',
      firstName: 'Sam',
      inviteLink: 'https://app.test/accept-invite#access_token=abc',
      companyName: 'Acme',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.to).toBe('learner@example.com')
    expect(call.subject).toContain('Acme')
    expect(call.subject).toContain('ILMS')
    expect(call.html).toContain('Sam')
    expect(call.html).toContain('https://app.test/accept-invite#access_token=abc')
  })

  it('sendPasswordResetEmail renders the reset template', async () => {
    await sendPasswordResetEmail({
      to: 'learner@example.com',
      firstName: 'Sam',
      resetLink: 'https://app.test/reset-password#access_token=xyz',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.subject).toContain('Reset')
    expect(call.html).toContain('Sam')
    expect(call.html).toContain('https://app.test/reset-password#access_token=xyz')
  })

  it('sendWelcomeEmail renders the welcome template with login URL', async () => {
    await sendWelcomeEmail({
      to: 'admin@example.com',
      firstName: 'Alex',
      loginUrl: 'https://app.test/login',
    })

    const call = getSendMock().mock.calls[0][0]
    expect(call.subject).toContain('Welcome')
    expect(call.html).toContain('Alex')
    expect(call.html).toContain('https://app.test/login')
  })

  it('returns error if Resend reports one', async () => {
    getSendMock().mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    const result = await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>x</p>' })
    expect(result.error).toEqual({ message: 'rate limit' })
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run from `backend/`:
```bash
npm test
```

Expected: 5 tests fail with `Cannot find module '../src/services/email.js'`.

- [ ] **Step 3: Create the email service**

Create `backend/src/services/email.js`:
```javascript
import { Resend } from 'resend'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails')

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf8')
}

const LAYOUT = readTemplate('_layout.html')
const TEMPLATES = {
  invite: readTemplate('invite.html'),
  'password-reset': readTemplate('password-reset.html'),
  welcome: readTemplate('welcome.html'),
}

const FROM_NAME = process.env.RESEND_FROM_NAME || 'ILMS'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

const resend = new Resend(process.env.RESEND_API_KEY)

function render(layout, body) {
  return layout
    .replace('{{TITLE}}', '')
    .replace('{{CONTENT}}', body)
}

function replaceVars(html, vars) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v ?? ''), html)
}

export async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: render(LAYOUT, html),
  })
  return { data, error }
}

export async function sendInviteEmail({ to, firstName, inviteLink, companyName }) {
  const subject = `You're invited to join ${companyName} on ILMS`
  const body = replaceVars(TEMPLATES.invite, { firstName, inviteLink, companyName })
  return sendEmail({ to, subject, html: body })
}

export async function sendPasswordResetEmail({ to, firstName, resetLink }) {
  const subject = 'Reset your ILMS password'
  const body = replaceVars(TEMPLATES['password-reset'], { firstName, resetLink })
  return sendEmail({ to, subject, html: body })
}

export async function sendWelcomeEmail({ to, firstName, loginUrl }) {
  const subject = 'Welcome to ILMS'
  const body = replaceVars(TEMPLATES.welcome, { firstName, loginUrl })
  return sendEmail({ to, subject, html: body })
}
```

- [ ] **Step 4: Create the templates dir with the 3 email files (content in Task 3)**

(Will fail the tests until Task 3 creates the templates. Create empty files first so this commit is self-contained.)

```bash
mkdir -p backend/src/templates/emails
touch backend/src/templates/emails/_layout.html
touch backend/src/templates/emails/invite.html
touch backend/src/templates/emails/password-reset.html
touch backend/src/templates/emails/welcome.html
```

- [ ] **Step 5: Run tests to confirm they fail (templates empty)**

Run from `backend/`:
```bash
npm test
```

Expected: tests fail because template files are empty (the rendered HTML won't contain the expected substrings). This is expected — Task 3 fills the templates.

- [ ] **Step 6: Commit the empty templates and the service scaffold**

```bash
git add backend/src/services/email.js backend/src/templates/ backend/tests/emailService.test.js
git commit -m "feat(backend): email service with shared layout and 3 senders (TDD scaffold)"
```

---

## Task 3: Create the 4 email templates (layout + invite + password-reset + welcome)

The 4 templates use simple `{{var}}` placeholders. The layout file wraps every email with the consistent header/footer. The 3 content templates just provide the inner card body.

**Files:**
- Create: `backend/src/templates/emails/_layout.html`
- Create: `backend/src/templates/emails/invite.html`
- Create: `backend/src/templates/emails/password-reset.html`
- Create: `backend/src/templates/emails/welcome.html`

- [ ] **Step 1: Create the shared layout**

Write to `backend/src/templates/emails/_layout.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ILMS{{TITLE}}</title>
</head>
<body style="margin:0;padding:0;background:#f7f6f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#3a3a3a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;background:linear-gradient(135deg,#312E81,#06B6D4);border-radius:6px;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:14px;">I</td>
                  <td style="padding-left:10px;font-size:18px;font-weight:700;color:#032147;letter-spacing:-0.01em;">ILMS</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:16px;line-height:1.6;color:#3a3a3a;">
              {{CONTENT}}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#888888;">
              &copy; 2026 incodet. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

- [ ] **Step 2: Create the invite template**

Write to `backend/src/templates/emails/invite.html`:
```html
<h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#032147;letter-spacing:-0.01em;">You're invited to join {{companyName}}</h1>
<p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;">{{companyName}} has invited you to start training on ILMS. Click the button below to set your password and activate your account.</p>
<p style="margin:0 0 24px 0;">This link will expire in 24 hours.</p>
<p style="margin:0 0 24px 0;">
  <a href="{{inviteLink}}" style="display:inline-block;background:#9333ea;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">Accept invitation</a>
</p>
<p style="margin:0;font-size:14px;color:#888888;">If the button doesn't work, paste this link into your browser:<br/><span style="word-break:break-all;">{{inviteLink}}</span></p>
```

- [ ] **Step 3: Create the password-reset template**

Write to `backend/src/templates/emails/password-reset.html`:
```html
<h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#032147;letter-spacing:-0.01em;">Reset your password</h1>
<p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;">We received a request to reset the password for your ILMS account. Click the button below to choose a new password.</p>
<p style="margin:0 0 24px 0;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
<p style="margin:0 0 24px 0;">
  <a href="{{resetLink}}" style="display:inline-block;background:#9333ea;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">Reset password</a>
</p>
<p style="margin:0;font-size:14px;color:#888888;">If the button doesn't work, paste this link into your browser:<br/><span style="word-break:break-all;">{{resetLink}}</span></p>
```

- [ ] **Step 4: Create the welcome template (replaces the plaintext-credentials email for company admins)**

Write to `backend/src/templates/emails/welcome.html`:
```html
<h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#032147;letter-spacing:-0.01em;">Welcome to ILMS</h1>
<p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
<p style="margin:0 0 16px 0;">Your ILMS account has been created. Sign in using the button below to get started.</p>
<p style="margin:0 0 24px 0;">
  <a href="{{loginUrl}}" style="display:inline-block;background:#9333ea;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">Sign in to ILMS</a>
</p>
<p style="margin:0;font-size:14px;color:#888888;">If the button doesn't work, paste this link into your browser:<br/><span style="word-break:break-all;">{{loginUrl}}</span></p>
```

- [ ] **Step 5: Run the email service tests**

Run from `backend/`:
```bash
npm test
```

Expected: all 5 email service tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/templates/
git commit -m "feat(backend): email templates (layout, invite, password-reset, welcome)"
```

---

## Task 4: Add the `forgotPasswordLimiter`

A dedicated rate limiter for the password-reset endpoint to prevent abuse (someone hammering the endpoint to send spam to a known email address).

**Files:**
- Modify: `backend/src/middleware/rateLimiters.js`

- [ ] **Step 1: Add the new limiter**

Modify `backend/src/middleware/rateLimiters.js`, append to the end of the file:
```javascript
// Auth-public bucket: password reset endpoint (prevent abuse)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many password-reset requests, please try again in 15 minutes' },
})
```

- [ ] **Step 2: Verify the file compiles**

Run from `backend/`:
```bash
node -e "import('./src/middleware/rateLimiters.js').then(m => console.log('limiters:', Object.keys(m)))"
```

Expected output:
```
limiters: [ 'generalLimiter', 'writeLimiter', 'expensiveLimiter', 'forgotPasswordLimiter' ]
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/middleware/rateLimiters.js
git commit -m "feat(backend): add forgotPasswordLimiter (10 req / 15 min)"
```

---

## Task 5: Create the `authLinks` helper

Supabase's `generateLink` returns an `action_link` that points at Supabase's own verify URL, with the session tokens in the URL fragment. We need to rebuild this link so it points at our frontend pages, preserving the fragment.

**Files:**
- Create: `backend/src/utils/authLinks.js`

- [ ] **Step 1: Create the helper**

Create `backend/src/utils/authLinks.js`:
```javascript
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Build a frontend URL that carries the same session fragment Supabase
 * returns in its action_link, but points at one of our pages instead of
 * Supabase's /auth/v1/verify endpoint.
 *
 * Example: buildAuthLink({ type: 'invite', actionLink, redirectTo: '/accept-invite' })
 *   -> 'http://localhost:5173/accept-invite#access_token=...&refresh_token=...&type=invite'
 */
export function buildAuthLink({ actionLink, redirectTo }) {
  if (!actionLink) throw new Error('buildAuthLink: actionLink is required')
  const hashIndex = actionLink.indexOf('#')
  const fragment = hashIndex >= 0 ? actionLink.slice(hashIndex) : ''
  return `${FRONTEND_URL}${redirectTo}${fragment}`
}
```

- [ ] **Step 2: Verify the helper**

Run from `backend/`:
```bash
FRONTEND_URL=http://localhost:5173 node -e "import('./src/utils/authLinks.js').then(m => console.log(m.buildAuthLink({actionLink: 'https://abc.supabase.co/auth/v1/verify?token=xxx&type=invite#access_token=AT&refresh_token=RT&type=invite', redirectTo: '/accept-invite'})))"
```

Expected output:
```
http://localhost:5173/accept-invite#access_token=AT&refresh_token=RT&type=invite
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/utils/authLinks.js
git commit -m "feat(backend): buildAuthLink helper for invite/recovery redirects"
```

---

## Task 6: Create the `authPublic` controller (all 4 handlers)

**Files:**
- Create: `backend/src/controllers/authPublic.js`
- Create: `backend/tests/authPublic.test.js`

- [ ] **Step 1: Write the failing tests**

Create `backend/tests/authPublic.test.js`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase admin client before importing the controller
const generateLink = vi.fn()
const setSession = vi.fn()
const updateUser = vi.fn()
const getUser = vi.fn()
const adminCreateUser = vi.fn()
const fromSelect = vi.fn()
const fromUpdate = vi.fn()
const fromInsert = vi.fn()

vi.mock('../src/db/supabase.js', () => ({
  default: {
    auth: {
      admin: {
        generateLink,
        createUser: adminCreateUser,
      },
      setSession,
      updateUser,
      getUser,
    },
    from: (table) => ({
      select: fromSelect,
      update: fromUpdate,
      insert: fromInsert,
    }),
  },
}))

// Mock the email service
const sendInviteEmail = vi.fn()
const sendPasswordResetEmail = vi.fn()
vi.mock('../src/services/email.js', () => ({
  sendInviteEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail: vi.fn(),
}))

// Mock express-validator
vi.mock('express-validator', () => ({
  body: () => ({
    notEmpty: () => ({ withMessage: () => ({ isLength: () => ({ withMessage: () => ({ isEmail: () => ({ withMessage: () => ({}) }) }) }) }) }),
  }),
}))

import {
  forgotPassword,
  resetPassword,
  acceptInvite,
  acceptInviteInfo,
} from '../src/controllers/authPublic.js'

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('forgotPassword', () => {
  it('always returns success even when the email does not exist', async () => {
    generateLink.mockRejectedValue(new Error('User not found'))
    const req = { body: { email: 'nobody@example.com' } }
    const res = mockRes()
    await forgotPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('sends a reset email when the user exists', async () => {
    generateLink.mockResolvedValue({
      data: {
        properties: {
          action_link: 'https://abc.supabase.co/auth/v1/verify?token=x&type=recovery#access_token=AT&refresh_token=RT',
        },
      },
      error: null,
    })
    sendPasswordResetEmail.mockResolvedValue({ data: { id: 'e1' }, error: null })
    const req = { body: { email: 'user@example.com' } }
    const res = mockRes()
    await forgotPassword(req, res)
    expect(generateLink).toHaveBeenCalledWith({ type: 'recovery', email: 'user@example.com' })
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1)
    const sent = sendPasswordResetEmail.mock.calls[0][0]
    expect(sent.to).toBe('user@example.com')
    expect(sent.resetLink).toContain('/reset-password#access_token=AT')
    expect(res.status).toHaveBeenCalledWith(200)
  })
})

describe('resetPassword', () => {
  it('rejects when password is shorter than 8 characters', async () => {
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'short' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json.mock.calls[0][0].error).toMatch(/at least 8/i)
    expect(setSession).not.toHaveBeenCalled()
  })

  it('updates the user password when tokens are valid', async () => {
    setSession.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    updateUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'longenough123' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(setSession).toHaveBeenCalledWith({ access_token: 'AT', refresh_token: 'RT' })
    expect(updateUser).toHaveBeenCalledWith({ password: 'longenough123' })
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('returns 401 when setSession fails', async () => {
    setSession.mockResolvedValue({ data: { user: null }, error: { message: 'bad token' } })
    const req = { body: { access_token: 'AT', refresh_token: 'RT', password: 'longenough123' } }
    const res = mockRes()
    await resetPassword(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('acceptInviteInfo', () => {
  it('returns user email and name from auth metadata + public.users', async () => {
    setSession.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null })
    fromSelect.mockReturnValue({
      eq: () => ({
        single: () => Promise.resolve({ data: { first_name: 'Sam', last_name: 'Jones' }, error: null }),
      }),
    })
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInviteInfo(req, res)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { email: 'a@b.com', first_name: 'Sam', last_name: 'Jones' },
    })
  })

  it('returns 401 when session is invalid', async () => {
    setSession.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } })
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInviteInfo(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('acceptInvite', () => {
  it('rejects when required fields are missing', async () => {
    const req = { body: { access_token: 'AT', refresh_token: 'RT' } }
    const res = mockRes()
    await acceptInvite(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('sets password and updates public.users row when input is valid', async () => {
    setSession.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    updateUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    fromUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'u1' }, error: null }),
        }),
      }),
    })
    const req = {
      body: {
        access_token: 'AT',
        refresh_token: 'RT',
        password: 'newpassword123',
        first_name: 'Sam',
        last_name: 'Jones',
      },
    }
    const res = mockRes()
    await acceptInvite(req, res)
    expect(setSession).toHaveBeenCalled()
    expect(updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
      email_confirm: true,
      user_metadata: { first_name: 'Sam', last_name: 'Jones' },
    })
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run from `backend/`:
```bash
npm test
```

Expected: 4 controller tests fail with `Cannot find module`.

- [ ] **Step 3: Create the controller**

Create `backend/src/controllers/authPublic.js`:
```javascript
import supabase from '../db/supabase.js'

const PASSWORD_MIN = 8

export async function forgotPassword(req, res) {
  const { email } = req.body
  try {
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email })
    if (error || !data?.properties?.action_link) {
      // Swallow: always return success to prevent account enumeration
      return res.status(200).json({ success: true })
    }
    const resetLink = buildAuthLink({ actionLink: data.properties.action_link, redirectTo: '/reset-password' })
    const { error: emailErr } = await sendPasswordResetEmail({ to: email, firstName: 'there', resetLink })
    if (emailErr) console.error('forgotPassword: email send failed', emailErr)
  } catch (err) {
    // Swallow: still return success
    console.error('forgotPassword: generateLink failed', err.message)
  }
  return res.status(200).json({ success: true })
}

export async function resetPassword(req, res) {
  const { access_token, refresh_token, password } = req.body

  if (!password || password.length < PASSWORD_MIN) {
    return res.status(400).json({ success: false, error: `Password must be at least ${PASSWORD_MIN} characters` })
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({ access_token, refresh_token })
  if (sessionErr || !sessionData?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }

  const { error: updateErr } = await supabase.auth.updateUser({ password })
  if (updateErr) {
    return res.status(400).json({ success: false, error: updateErr.message })
  }

  return res.json({ success: true })
}

export async function acceptInviteInfo(req, res) {
  const { access_token, refresh_token } = req.body
  const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({ access_token, refresh_token })
  if (sessionErr || !sessionData?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }
  const user = sessionData.user
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('first_name,last_name')
    .eq('id', user.id)
    .single()
  if (profileErr) {
    return res.status(500).json({ success: false, error: 'Failed to load profile' })
  }
  return res.json({
    success: true,
    data: {
      email: user.email,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  })
}

export async function acceptInvite(req, res) {
  const { access_token, refresh_token, password, first_name, last_name } = req.body

  if (!password || password.length < PASSWORD_MIN) {
    return res.status(400).json({ success: false, error: `Password must be at least ${PASSWORD_MIN} characters` })
  }
  if (!first_name || !last_name) {
    return res.status(400).json({ success: false, error: 'First and last name are required' })
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({ access_token, refresh_token })
  if (sessionErr || !sessionData?.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired link' })
  }
  const userId = sessionData.user.id

  const { error: updateErr } = await supabase.auth.updateUser({
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })
  if (updateErr) {
    return res.status(400).json({ success: false, error: updateErr.message })
  }

  const { error: dbErr } = await supabase
    .from('users')
    .update({ first_name, last_name })
    .eq('id', userId)
  if (dbErr) {
    return res.status(400).json({ success: false, error: dbErr.message })
  }

  return res.json({ success: true })
}
```

Note: `authPublic.js` does not need to import anything from `services/email.js` or `utils/authLinks.js` — those are used by `organisations.js` (Task 8). The final import block for this file is just `import supabase from '../db/supabase.js'`.

- [ ] **Step 4: Run the tests**

Run from `backend/`:
```bash
npm test
```

Expected: all 14 tests pass (5 from `emailService.test.js` + 9 from `authPublic.test.js`).

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/authPublic.js backend/tests/authPublic.test.js
git commit -m "feat(backend): authPublic controller (forgot/reset/accept-invite + info)"
```

---

## Task 7: Create the `authPublic` routes file and register it

**Files:**
- Create: `backend/src/routes/authPublic.js`
- Modify: `backend/src/index.js`

- [ ] **Step 1: Create the routes file**

Create `backend/src/routes/authPublic.js`:
```javascript
import { Router } from 'express'
import { body } from 'express-validator'
import { forgotPasswordLimiter } from '../middleware/rateLimiters.js'
import { validate } from '../middleware/validate.js'
import {
  forgotPassword,
  resetPassword,
  acceptInvite,
  acceptInviteInfo,
} from '../controllers/authPublic.js'

const router = Router()

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
  forgotPassword
)

router.post(
  '/reset-password',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  resetPassword
)

router.post(
  '/accept-invite',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  validate,
  acceptInvite
)

router.post(
  '/accept-invite-info',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  validate,
  acceptInviteInfo
)

export default router
```

- [ ] **Step 2: Register the routes in `index.js`**

Modify `backend/src/index.js`. Add the import near the other route imports (after `import authRoutes from './routes/auth.js'`):
```javascript
import authPublicRoutes from './routes/authPublic.js'
```

Modify the `app.use('/api/auth', authRoutes)` line to add a second mount right after:
```javascript
app.use('/api/auth', authRoutes)
app.use('/api/auth', authPublicRoutes)
```

- [ ] **Step 3: Verify the file still loads**

Run from `backend/`:
```bash
node -e "import('./src/index.js').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"
```

Expected: prints `OK` (it will also try to start the server, then exit when stdin closes — that's fine, we just want to confirm the file parses and imports correctly).

If you want a cleaner check, use:
```bash
node --check src/index.js && node --check src/routes/authPublic.js && echo "OK"
```

Expected: prints `OK` with no errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/authPublic.js backend/src/index.js
git commit -m "feat(backend): mount /api/auth public routes (forgot/reset/accept-invite)"
```

---

## Task 8: Update `createLearner` to use the invite flow

Replace the auto-generate-password-and-send-plaintext behaviour with: create the auth user with `email_confirm: false`, generate an invite link, send the branded invite email. Also update `createCompanyAdmin` to use the new `sendWelcomeEmail` helper for consistency (the spec says it stays out of scope for the creation flow change, but the welcome email template is now preferred over the inline one — keeping it on the new template is a small consistency win, not a behaviour change).

**Files:**
- Modify: `backend/src/controllers/organisations.js`

- [ ] **Step 1: Replace the imports at the top of the file**

Modify `backend/src/controllers/organisations.js`. Replace the existing top 2 lines:
```javascript
import supabase from '../db/supabase.js'
import { Resend } from 'resend'
```
with:
```javascript
import supabase from '../db/supabase.js'
import { sendWelcomeEmail, sendInviteEmail } from '../services/email.js'
import { buildAuthLink } from '../utils/authLinks.js'
```

- [ ] **Step 2: Replace the `createCompanyAdmin` body (use the shared welcome template)**

Modify the `createCompanyAdmin` function. Find the `await resend.emails.send({...})` block and replace it with:
```javascript
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
  const { error: emailErr } = await sendWelcomeEmail({
    to: email,
    firstName: first_name,
    loginUrl,
  })
  if (emailErr) console.error('Failed to send welcome email:', emailErr)
```

Leave the `generatePassword()` call in place — the new account is created with the auto-generated password and the welcome email is sent. The user can log in and (if you want to extend later) trigger a password reset to set their own. This matches the spec's "out of scope" note for company admin flow.

- [ ] **Step 3: Replace the `createLearner` body to use the invite flow**

Find the entire `createLearner` function and replace it with:
```javascript
export async function createLearner(req, res) {
  const { email, first_name, last_name } = req.body
  const organisation_id = req.user.organisation_id

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: false,
  })

  if (authErr) return res.status(400).json({ success: false, error: authErr.message })

  const { data: user, error: dbErr } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      role: 'learner',
      organisation_id,
      first_name,
      last_name,
    })
    .select()
    .single()

  if (dbErr) return res.status(400).json({ success: false, error: dbErr.message })

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email,
  })
  if (linkErr || !linkData?.properties?.action_link) {
    console.error('createLearner: generateLink failed', linkErr)
    return res.status(500).json({ success: false, error: 'Failed to generate invite link' })
  }

  const inviteLink = buildAuthLink({ actionLink: linkData.properties.action_link, redirectTo: '/accept-invite' })
  const { error: emailErr } = await sendInviteEmail({
    to: email,
    firstName: first_name,
    inviteLink,
    companyName: req.user.organisation_name || 'your company',
  })
  if (emailErr) console.error('Failed to send invite email:', emailErr)

  res.status(201).json({ success: true, data: user })
}
```

- [ ] **Step 4: Remove the now-unused `generatePassword` function and the unused `Resend` import**

After the previous step, `Resend` is no longer imported. Remove the `import { Resend } from 'resend'` from the top of the file (already done in Step 1).

Find the `function generatePassword() {...}` block at the bottom of the file and remove it (no longer used by `createLearner`). If you kept it for `createCompanyAdmin` (per Step 2), keep it.

- [ ] **Step 5: Verify the file parses**

Run from `backend/`:
```bash
node --check src/controllers/organisations.js && echo OK
```

Expected: prints `OK`.

- [ ] **Step 6: Run the full test suite to confirm nothing broke**

Run from `backend/`:
```bash
npm test
```

Expected: all 14 tests pass (no test exercises organisations.js directly, but we want to confirm the import chain still resolves).

- [ ] **Step 7: Commit**

```bash
git add backend/src/controllers/organisations.js
git commit -m "feat(backend): createLearner uses invite flow (no plaintext passwords)"
```

---

## Task 9: Add `api.auth` methods to the frontend

**Files:**
- Modify: `frontend/src/utils/api.js`

- [ ] **Step 1: Add the new methods to the `api.auth` block**

Modify `frontend/src/utils/api.js`. Find:
```javascript
  auth: {
    me: () => request('/api/auth/me'),
  },
```
and replace with:
```javascript
  auth: {
    me: () => request('/api/auth/me'),
    forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (data) => request('/api/auth/reset-password', { method: 'POST', body: data }),
    acceptInvite: (data) => request('/api/auth/accept-invite', { method: 'POST', body: data }),
    acceptInviteInfo: (data) => request('/api/auth/accept-invite-info', { method: 'POST', body: data }),
  },
```

- [ ] **Step 2: Verify the file still parses (Vite will catch this on next dev start)**

Run from `frontend/`:
```bash
npx eslint src/utils/api.js
```

Expected: no errors (or only the existing project-wide warnings, not a new one in this file).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/utils/api.js
git commit -m "feat(frontend): add api.auth methods (forgot/reset/accept-invite)"
```

---

## Task 10: Extract the `AuthShell` component from `Login.jsx`

The 3 new auth pages (Forgot/Reset/AcceptInvite) all need the same split-pane layout. Extract it into a reusable component so we don't duplicate the layout.

**Files:**
- Create: `frontend/src/components/AuthShell.jsx`
- Modify: `frontend/src/pages/Login.jsx`

- [ ] **Step 1: Read the current `Login.jsx` to understand the layout structure**

Already in context — the file is 96 lines and has a split-pane layout:
- Left side: gradient logo, marketing copy, footer
- Right side: form area with max-width container

- [ ] **Step 2: Create the `AuthShell` component**

Create `frontend/src/components/AuthShell.jsx`:
```jsx
export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-typography to-canvas">
      {/* Marketing side (Left) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
            <div className="w-full h-full bg-white rounded-sm" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ILMS</span>
        </div>

        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-96 h-96 border border-white/5 rounded-[3rem] flex items-center justify-center">
              <div className="w-64 h-64 border border-white/5 rounded-[2rem]" />
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
            Corporate learning,<br />made simple.
          </h2>
          <p className="text-lg text-white/60 max-w-sm">
            Manage your organisation's training, track progress, and issue certificates.
          </p>
        </div>

        <div className="text-white/40 text-xs tracking-wider uppercase font-semibold">
          © 2026 INCODET LMS PLATFORM
        </div>
      </div>

      {/* Form side (Right) */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-12">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
                <div className="w-full h-full bg-white rounded-sm" />
              </div>
              <span className="text-typography font-bold text-xl tracking-tight">ILMS</span>
            </div>
          </div>

          {title && (
            <h2 className="text-3xl font-display font-bold tracking-tight text-typography">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-typography/60 mb-8">{subtitle}</p>
          )}
          {!subtitle && title && <div className="mb-8" />}

          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Refactor `Login.jsx` to use `AuthShell`**

Replace the entire `frontend/src/pages/Login.jsx` content with:
```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const user = await login(email, password)
      toast.success('Welcome back')
      if (user.role === 'super_admin') navigate('/super-admin', { replace: true })
      else if (user.role === 'company_admin') navigate('/admin', { replace: true })
      else navigate('/dashboard', { replace: true })
    } catch (err) {
      const message =
        err.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : err.message
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Enter your credentials to access the platform">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="admin@company.com"
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-typography/60">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-typography/60 hover:text-typography transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full"
          />
        </div>

        <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-4">
          Sign in &rarr;
        </Button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 4: Run the dev server and confirm Login still works**

Run from `frontend/`:
```bash
npm run dev
```

In the browser: open `http://localhost:5173/login`, confirm the layout still looks right, click "Forgot password?" — it should navigate to `/forgot-password` (the page will 404 until Task 11 creates it; that's fine, we just want to confirm the link works).

Stop the dev server with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/AuthShell.jsx frontend/src/pages/Login.jsx
git commit -m "feat(frontend): extract AuthShell, add 'Forgot password?' link on Login"
```

---

## Task 11: Create the `ForgotPassword` page

**Files:**
- Create: `frontend/src/pages/ForgotPassword.jsx`

- [ ] **Step 1: Create the page**

Create `frontend/src/pages/ForgotPassword.jsx`:
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'
import { api } from '../utils/api'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.auth.forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">Check your email</p>
          <p>If an account exists for that address, a password reset link is on its way. The link expires in 1 hour.</p>
          <Link
            to="/login"
            className="inline-block mt-4 text-typography/80 hover:text-typography underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@company.com"
              className="w-full"
            />
          </div>

          <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-4">
            Send reset link &rarr;
          </Button>

          <p className="text-center text-sm text-typography/60">
            Remembered it?{' '}
            <Link to="/login" className="text-typography underline hover:text-typography/80">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ForgotPassword.jsx
git commit -m "feat(frontend): ForgotPassword page"
```

---

## Task 12: Create the `ResetPassword` page

**Files:**
- Create: `frontend/src/pages/ResetPassword.jsx`

- [ ] **Step 1: Create the page**

Create `frontend/src/pages/ResetPassword.jsx`:
```jsx
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'
import { api } from '../utils/api'

function readTokensFromHash() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const params = new URLSearchParams(hash)
  return {
    access_token: params.get('access_token') || '',
    refresh_token: params.get('refresh_token') || '',
  }
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const tokens = useMemo(() => readTokensFromHash(), [])
  const tokensValid = Boolean(tokens.access_token && tokens.refresh_token)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordsMatch = password === confirm
  const longEnough = password.length >= 8
  const canSubmit = tokensValid && passwordsMatch && longEnough && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await api.auth.resetPassword({ ...tokens, password })
      toast.success('Password updated. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tokensValid) {
    return (
      <AuthShell title="Reset password" subtitle="">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Invalid or expired link</p>
          <p>Please request a new password reset link.</p>
          <Link to="/forgot-password" className="inline-block mt-4 underline">
            Request a new link
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter a new password for your ILMS account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            New Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="w-full"
          />
          <p className="mt-1 text-xs text-typography/60">At least 8 characters.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            Confirm Password
          </label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="w-full"
          />
          {confirm && !passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>

        <Button type="submit" loading={submitting} disabled={!canSubmit} fullWidth size="lg" className="mt-4">
          Update password &rarr;
        </Button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ResetPassword.jsx
git commit -m "feat(frontend): ResetPassword page"
```

---

## Task 13: Create the `AcceptInvite` page

**Files:**
- Create: `frontend/src/pages/AcceptInvite.jsx`

- [ ] **Step 1: Create the page**

Create `frontend/src/pages/AcceptInvite.jsx`:
```jsx
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, useToast } from '../components/ui'
import AuthShell from '../components/AuthShell'
import { api } from '../utils/api'

function readTokensFromHash() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const params = new URLSearchParams(hash)
  return {
    access_token: params.get('access_token') || '',
    refresh_token: params.get('refresh_token') || '',
  }
}

export default function AcceptInvite() {
  const navigate = useNavigate()
  const toast = useToast()
  const tokens = useMemo(() => readTokensFromHash(), [])
  const tokensValid = Boolean(tokens.access_token && tokens.refresh_token)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [infoError, setInfoError] = useState('')

  useEffect(() => {
    if (!tokensValid) {
      setLoadingInfo(false)
      return
    }
    let cancelled = false
    api.auth.acceptInviteInfo(tokens)
      .then((data) => {
        if (cancelled) return
        setEmail(data.email)
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
      })
      .catch((err) => {
        if (cancelled) return
        setInfoError(err.message || 'Invalid or expired link')
      })
      .finally(() => {
        if (!cancelled) setLoadingInfo(false)
      })
    return () => { cancelled = true }
  }, [])

  const passwordsMatch = password === confirm
  const longEnough = password.length >= 8
  const canSubmit = tokensValid && firstName && lastName && passwordsMatch && longEnough && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await api.auth.acceptInvite({ ...tokens, password, first_name: firstName, last_name: lastName })
      toast.success('Account activated. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not activate account')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tokensValid) {
    return (
      <AuthShell title="Accept invitation" subtitle="">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Invalid or expired link</p>
          <p>Please ask your training manager to send a new invitation.</p>
          <Link to="/login" className="inline-block mt-4 underline">Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  if (loadingInfo) {
    return (
      <AuthShell title="Accept invitation" subtitle="Loading your invitation...">
        <div className="space-y-3">
          <div className="h-10 bg-typography/10 rounded animate-pulse" />
          <div className="h-10 bg-typography/10 rounded animate-pulse" />
          <div className="h-10 bg-typography/10 rounded animate-pulse" />
        </div>
      </AuthShell>
    )
  }

  if (infoError) {
    return (
      <AuthShell title="Accept invitation" subtitle="">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">{infoError}</p>
          <p>Please ask your training manager to send a new invitation.</p>
          <Link to="/login" className="inline-block mt-4 underline">Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={`Welcome, ${email}`}
      subtitle="Set your password to activate your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            First Name
          </label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
            placeholder="Sam"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            Last Name
          </label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
            placeholder="Jones"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="w-full"
          />
          <p className="mt-1 text-xs text-typography/60">At least 8 characters.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
            Confirm Password
          </label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="w-full"
          />
          {confirm && !passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>

        <Button type="submit" loading={submitting} disabled={!canSubmit} fullWidth size="lg" className="mt-4">
          Activate account &rarr;
        </Button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AcceptInvite.jsx
git commit -m "feat(frontend): AcceptInvite page"
```

---

## Task 14: Add the 3 new routes to `App.jsx`

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Add the imports**

Modify `frontend/src/App.jsx`. Add these 3 imports near the existing page imports (after `import Login from './pages/Login'`):
```javascript
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AcceptInvite from './pages/AcceptInvite'
```

- [ ] **Step 2: Add the 3 routes**

Modify `frontend/src/App.jsx`. Find the `<Route path="/login" element={<Login />} />` line and add the 3 new routes immediately after it (before the verify route):
```javascript
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
```

- [ ] **Step 3: Lint the file**

Run from `frontend/`:
```bash
npx eslint src/App.jsx
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat(frontend): add /forgot-password, /reset-password, /accept-invite routes"
```

---

## Task 15: Add the invite-info line to `Landing.jsx`

The landing page hero already has a "Get started" CTA pointing at `/login`. Add a small line below it telling visitors that self-service sign-up is invite-only.

**Files:**
- Modify: `frontend/src/pages/Landing.jsx`

- [ ] **Step 1: Locate the "Get started" CTA in the hero**

The Landing page has a button with text "Get started" or similar in the hero section. Find the parent container (likely a `<div>` with `mt-10` or similar spacing) and add a small line below it.

- [ ] **Step 2: Add the invite-info line**

Below the existing CTA button, add:
```jsx
<p className="mt-4 text-sm text-typography/60">
  Don't have an account? Ask your training manager to send you an invite.
</p>
```

Adjust the exact location and surrounding wrapper classes to match the existing hero layout. The key is the message text.

- [ ] **Step 3: Lint**

Run from `frontend/`:
```bash
npx eslint src/pages/Landing.jsx
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Landing.jsx
git commit -m "feat(frontend): add invite-info line on Landing"
```

---

## Task 16: Update backend `.env.example` with the new vars

**Files:**
- Modify: `backend/.env.example`

- [ ] **Step 1: Add the 2 new vars**

Modify `backend/.env.example`. Find the Resend block:
```
# Resend (https://resend.com) - transactional email
RESEND_API_KEY=re_...
```
and replace it with:
```
# Resend (https://resend.com) - transactional email
RESEND_API_KEY=re_...

# Verified sender address (verify your domain at resend.com/domains)
# For local dev, you can use the default test sender: onboarding@resend.dev
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=ILMS by incodet
```

- [ ] **Step 2: Commit**

```bash
git add backend/.env.example
git commit -m "docs(backend): add RESEND_FROM_EMAIL, RESEND_FROM_NAME env vars"
```

---

## Task 17: Update root `.env.example` (if it exists)

**Files:**
- Modify: `.env.example` (root, if exists)

- [ ] **Step 1: Check if the root `.env.example` exists**

Run from repo root:
```bash
test -f .env.example && echo "exists" || echo "missing"
```

If "exists", continue. If "missing", skip this task.

- [ ] **Step 2: If it exists, add the 2 new vars**

In `.env.example`, find the `# --- Resend ---` block and add `RESEND_FROM_EMAIL=` and `RESEND_FROM_NAME=` lines below `RESEND_API_KEY=`.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add new Resend env vars to root .env.example"
```

(If the file didn't exist, skip this commit.)

---

## Task 18: Update README with deployment prep section

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a "Deployment prep" section**

Modify `README.md`. Find the `## Setup` section and add a new section after it (or at the end of the README):

```markdown
## Deployment prep (auth-specific)

Before going live, complete these manual steps in addition to the PAUSE 5 steps in `AGENTS.md`:

1. **Resend** — verify your sender domain (e.g., `incodet.com`) at https://resend.com/domains. Set `RESEND_FROM_EMAIL` and `RESEND_FROM_NAME` in backend `.env` and in Railway's environment variables.
2. **Supabase Auth** — in Supabase dashboard → Authentication → URL Configuration:
   - Set **Site URL** to your production frontend URL.
   - Add the following to **Additional Redirect URLs**:
     - `https://<your-frontend>/reset-password`
     - `https://<your-frontend>/accept-invite`
3. **After deploy** — create a test organisation + test company admin via the existing dashboard, then invite a personal email address and confirm the invite email arrives and the link works end-to-end on the live URL.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: deployment prep section for invite/reset emails"
```

---

## Task 19: Run the full test suite + smoke-test the new endpoints manually

**Files:** none (verification only)

- [ ] **Step 1: Run backend tests**

Run from `backend/`:
```bash
npm test
```

Expected: all 14 tests pass (5 email service + 9 controller).

- [ ] **Step 2: Start the backend dev server**

Run from `backend/` (in one terminal):
```bash
npm run dev
```

Confirm the server is up: `curl http://localhost:3000/health` returns `{ "success": true, "data": { "status": "ok", ... } }`.

- [ ] **Step 3: Smoke-test `forgot-password`**

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@testcompany.com"}'
```

Expected: `{"success":true}`. (In dev, no actual email is sent unless your Resend key is configured — the request still returns success, which is the correct behaviour.)

- [ ] **Step 4: Smoke-test `reset-password` validation (no real tokens)**

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"access_token":"","refresh_token":"","password":"short"}'
```

Expected: `{"success":false,"error":"access_token is required"}` (from express-validator), or the password length error from the controller — either is fine, the point is it rejects bad input.

- [ ] **Step 5: Start the frontend dev server**

Run from `frontend/` (in another terminal):
```bash
npm run dev
```

Open `http://localhost:5173/login` in a browser, click "Forgot password?" — confirm the link works and the page renders.

Open `http://localhost:5173/forgot-password` directly — confirm the page renders.

Open `http://localhost:5173/reset-password` directly (no tokens in URL) — confirm the "Invalid or expired link" message appears with a link back.

- [ ] **Step 6: Stop both dev servers**

Stop both with Ctrl-C.

- [ ] **Step 7: Commit (no code changes — this is a verification task, skip if no changes)**

If anything was tweaked during smoke testing, commit the tweak. Otherwise nothing to commit.

---

## Done

The implementation is complete. Final checklist before deployment:

- [ ] All 19 tasks above are checked off
- [ ] `npm test` in `backend/` passes (14 tests)
- [ ] Frontend dev server starts without errors
- [ ] Backend dev server starts without errors
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` are set in backend `.env` (locally + Railway)
- [ ] Supabase Auth Site URL and redirect URLs are configured
- [ ] Domain verified in Resend (for production sender)
- [ ] Smoke-tested invite + password reset flows end-to-end against the deployed URLs (do this after Railway + Vercel deploy per PAUSE 5)
