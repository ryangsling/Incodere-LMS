import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { href: '#platform', label: 'Platform' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
]

const CAPABILITIES = [
  {
    title: 'Course builder',
    body: 'Organise a curriculum into sections, then fill them with YouTube video lessons and rich-text reading material. Publish when it is ready.',
  },
  {
    title: 'Progress tracking',
    body: 'See where every learner stands, lesson by lesson, with completion rates that update as people work.',
  },
  {
    title: 'Automatic certificates',
    body: 'A branded PDF certificate is generated and emailed the moment a learner finishes the last lesson.',
  },
  {
    title: 'Tenant isolation',
    body: 'Each organisation sees only its own learners, enrolments and certificates. Nothing leaks between companies.',
  },
]

const STEPS = [
  {
    verb: 'Build',
    body: 'Add sections, embed videos, write lesson notes. Your curriculum, structured your way.',
  },
  {
    verb: 'Assign',
    body: 'Invite employees individually or bulk-enrol existing ones into a course in a single action.',
  },
  {
    verb: 'Certify',
    body: 'Watch progress in real time. Certificates issue themselves on completion, and stay verifiable.',
  },
]

const ROLES = [
  {
    role: 'Super admin',
    body: 'Owns the course catalogue and the organisations on the platform. Sees cross-tenant statistics.',
  },
  {
    role: 'Company admin',
    body: 'Manages their own learners, assigns courses, and pulls compliance reports for their organisation.',
  },
  {
    role: 'Learner',
    body: 'Works through assigned courses, tracks their own progress, and collects certificates.',
  },
]

const FAQS = [
  {
    q: 'What does a course contain?',
    a: 'A course is organised into sections, and each section contains video lessons (YouTube embed) and reading material (rich text).',
  },
  {
    q: 'How are certificates issued?',
    a: 'When a learner completes every lesson in a course, ILMS automatically generates a branded PDF certificate and emails it to them.',
  },
  {
    q: 'Can I enrol multiple learners at once?',
    a: 'Yes. Company admins can add learners one at a time or bulk-enrol existing employees into a course.',
  },
  {
    q: 'Is my data isolated?',
    a: 'Yes. Each organisation only sees its own learners, enrolments, and certificates. Super admins manage the platform and course catalogue.',
  },
]

/**
 * A real progress card, the same composition the learner dashboard renders,
 * shown with sample values. This is a live component rather than a screenshot
 * mock built from styled divs, so it cannot drift away from the real product.
 */
function ProgressPreview() {
  const modules = [
    { title: 'Data handling basics', done: true },
    { title: 'Recognising phishing', done: true },
    { title: 'Reporting an incident', done: false },
  ]

  return (
    <div className="card p-6 sm:p-7" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted">Assigned course</p>
          <p className="mt-0.5 truncate font-semibold text-ink">
            Information security, 2026
          </p>
        </div>
        <p className="badge border-accent-200 bg-accent-soft text-accent-on-soft">
          In progress
        </p>
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-sm text-muted">Progress</span>
        <span data-numeric className="text-2xl font-semibold text-ink">
          67%
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-structural">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-accent"
          style={{ width: '67%' }}
        />
      </div>

      <ul className="mt-6 space-y-3 border-t border-border pt-5">
        {modules.map((m) => (
          <li key={m.title} className="flex items-center gap-3">
            <span
              className={[
                'flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border',
                m.done
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-strong',
              ].join(' ')}
            >
              {m.done && <CheckIcon className="size-3" strokeWidth={3} />}
            </span>
            <span
              className={m.done ? 'text-sm text-muted line-through' : 'text-sm text-ink'}
            >
              {m.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const routes = {
        super_admin: '/super-admin',
        company_admin: '/admin',
        learner: '/dashboard',
      }
      navigate(routes[user.role] || '/login', { replace: true })
    }
  }, [user, navigate])

  if (user) return null

  return (
    <div className="bg-canvas">
      {/* ── Nav: single line at desktop, 64px, real disclosure on mobile ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <img src="/logo-mark.svg" alt="" width="28" height="28" />
            <span className="text-lg font-semibold tracking-tight text-ink">ILMS</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex md:items-center md:gap-8">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-body no-underline transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-primary hidden !py-2 !text-sm sm:inline-flex">
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="-mr-2 flex size-10 items-center justify-center rounded-[var(--radius-control)] text-ink md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <XMarkIcon className="size-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="size-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* The previous nav hid every link below md with no replacement, so
            mobile visitors had no navigation at all. */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="border-t border-border bg-canvas px-5 py-4 md:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-[var(--radius-control)] px-3 py-2.5 text-base font-medium text-ink no-underline transition-colors hover:bg-structural"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/login" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main">
      {/* ── Hero: asymmetric split. 4 text elements max, no eyebrow. ── */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h1 className=" text-4xl leading-[1.08] tracking-[-0.028em] sm:text-5xl lg:text-[3.5rem]">
              Corporate training
              <br />
              that runs itself.
            </h1>
            <p className=" mt-6 max-w-md text-lg leading-relaxed text-body">
              Assign courses, watch progress, issue certificates. One place for
              your whole organisation.
            </p>
            <div className=" mt-9 flex flex-wrap items-center gap-3">
              <Link to="/login" className="btn btn-primary !px-6 !py-3.5 !text-base">
                Sign in
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="mailto:hello@incodet.com"
                className="btn btn-secondary !px-6 !py-3.5 !text-base"
              >
                Contact us
              </a>
            </div>
          </div>

          <div className=" lg:pl-4">
            <ProgressPreview />
          </div>
        </div>
      </section>

      {/* ── Platform: asymmetric 2-col with a tinted lead cell ── */}
      <section id="platform" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <h2 className="section-title max-w-xl">
            Everything you need to run training, and nothing you do not.
          </h2>

          {/* Exactly as many cells as there is content for: one full-width
              lead cell plus a three-up row. A 2-column grid left a hole. */}
          <div className="mt-14 rounded-[var(--radius-surface)] bg-accent-soft p-7 sm:flex sm:items-baseline sm:gap-10 sm:p-9">
            <h3 className="shrink-0 text-xl text-accent-on-soft sm:w-56">
              {CAPABILITIES[0].title}
            </h3>
            <p className="mt-3 max-w-xl leading-relaxed text-accent-on-soft/85 sm:mt-0">
              {CAPABILITIES[0].body}
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {CAPABILITIES.slice(1).map((c) => (
              <div key={c.title}>
                <h3 className="text-lg">{c.title}</h3>
                <p className="mt-2.5 leading-relaxed text-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works: horizontal flow, verbs as labels ── */}
      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <h2 className="section-title max-w-lg">Three moves, start to certificate.</h2>

          <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((s) => (
              <li key={s.verb} className="border-t-2 border-accent pt-5">
                <h3 className="text-xl">{s.verb}</h3>
                <p className="mt-2 max-w-xs leading-relaxed text-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Roles: divided vertical list, a different family again ── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 sm:py-28">
          <h2 className="section-title">Built around three kinds of user.</h2>
          <dl className="mt-12 divide-y divide-border">
            {ROLES.map((r) => (
              <div key={r.role} className="py-6 sm:flex sm:items-baseline sm:gap-10">
                <dt className="shrink-0 font-semibold text-ink sm:w-48">{r.role}</dt>
                <dd className="mt-1.5 leading-relaxed text-body sm:mt-0">{r.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-28">
          <h2 className="section-title">Questions</h2>
          <dl className="mt-10 space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="card p-6">
                <dt className="font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 leading-relaxed text-body">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="border-t border-border bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-md text-3xl text-white sm:text-4xl">
              Ready to train your team?
            </h2>
            <p className="mt-3 max-w-md text-white/70">
              Sign in to get started. New to ILMS? Get in touch and we will set
              up your organisation.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/login"
              className="btn !border-transparent !bg-white !px-6 !py-3.5 !text-base !text-ink hover:!bg-white/90"
            >
              Sign in
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="mailto:hello@incodet.com"
              className="btn !border-white/25 !px-6 !py-3.5 !text-base !text-white hover:!bg-white/10"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo-mark.svg" alt="" width="24" height="24" />
                <span className="font-semibold tracking-tight text-ink">ILMS</span>
              </div>
              <p className="mt-3 text-sm text-muted">Corporate learning, made simple.</p>
            </div>

            <div className="flex gap-12 sm:gap-16">
              <div>
                <h2 className="text-sm font-semibold text-ink">Product</h2>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link to="/login" className="text-sm text-body no-underline hover:text-ink">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <a href="#platform" className="text-sm text-body no-underline hover:text-ink">
                      Platform
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Company</h2>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="https://incodet.com"
                      className="text-sm text-body no-underline hover:text-ink"
                    >
                      incodet.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@incodet.com"
                      className="text-sm text-body no-underline hover:text-ink"
                    >
                      Contact us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-12 border-t border-border pt-6 text-sm text-muted">
            &copy; {new Date().getFullYear()} incodet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
