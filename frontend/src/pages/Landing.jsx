import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    title: 'Course Builder',
    description:
      'Create structured courses with YouTube video lessons and rich-text reading material. Organise by sections, publish when ready.',
    color: '#0d9488',
    bg: '#e6f7f5',
  },
  {
    title: 'Progress Tracking',
    description:
      'See exactly where each learner stands. Completion rates, lesson-by-lesson progress, all in real time.',
    color: '#4865FF',
    bg: '#eef2ff',
  },
  {
    title: 'Auto Certificates',
    description:
      'Branded PDF certificates generated and emailed the moment a learner finishes a course.',
    color: '#d946ef',
    bg: '#fdf4ff',
  },
]

const STEPS = [
  {
    title: 'Create a course',
    body: 'Add sections, embed YouTube videos, write lesson notes. Your curriculum, your way.',
  },
  {
    title: 'Enrol learners',
    body: 'Bulk-add employees or invite them one at a time. Assign courses with a single click.',
  },
  {
    title: 'Track and certify',
    body: 'Watch progress in real time. Certificates are issued automatically on completion.',
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

const TRUSTED = [
  'Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Pied Piper',
  'Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Pied Piper',
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const navRef = useRef(null)

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

  useEffect(() => {
    if (user) return
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -20,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1,
      })

      const heroEls = heroRef.current?.querySelectorAll('[data-hero]')
      if (heroEls) {
        gsap.from(heroEls, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.3,
        })
      }

      // ponytail: removed scroll-triggered animations — they hid content when triggers didn't fire
    }, containerRef)

    return () => ctx.revert()
  }, [user])

  if (user) return null

  return (
    <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: '#F8F3EB' }}>

      {/* ═══ NAVBAR ═══ */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'rgba(248, 243, 235, 0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-sans)', color: '#0f172a' }}
            >
              ILMS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium no-underline transition-opacity hover:opacity-60" style={{ color: '#0f172a' }}>Platform</a>
            <a href="#how-it-works" className="text-sm font-medium no-underline transition-opacity hover:opacity-60" style={{ color: '#0f172a' }}>How it works</a>
            <a href="#faq" className="text-sm font-medium no-underline transition-opacity hover:opacity-60" style={{ color: '#0f172a' }}>FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-sm font-medium cursor-pointer bg-transparent border-none transition-opacity hover:opacity-60"
              style={{ fontFamily: 'var(--font-sans)', color: '#0f172a' }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-all duration-200"
              style={{
                backgroundColor: '#0f172a',
                color: 'white',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Request demo
            </button>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-8 sm:pt-36 sm:pb-12 overflow-hidden" ref={heroRef}>
        {/* Decorative concentric circles — August Health style */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="hero-circle" style={{ width: 960, height: 960 }} />
          <div className="hero-circle hero-circle--inner" style={{ width: 680, height: 680 }} />
          <div className="hero-circle hero-circle--core" style={{ width: 400, height: 400 }} />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h1
            data-hero
            className="mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6vw, 5rem)',
              lineHeight: 1.02,
              color: '#0f172a',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            The LMS platform<br />teams actually use
          </h1>

          <p
            data-hero
            className="mb-10 mx-auto"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              color: '#64748b',
              maxWidth: '38ch',
            }}
          >
            Manage your organisation's training, track progress, and issue certificates — all in one place.
          </p>

          <div data-hero className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium cursor-pointer border-none transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: '#0d9488',
                color: 'white',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 1px 3px rgba(13, 148, 136, 0.3)',
              }}
            >
              Request demo
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium cursor-pointer border transition-all duration-200 bg-transparent hover:bg-white/50"
              style={{
                borderColor: '#0f172a',
                color: '#0f172a',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      {/* ═══ LOGO TICKER ═══ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p
            className="text-center text-xs font-semibold uppercase tracking-widest mb-10"
            style={{ color: '#94a3b8', fontFamily: 'var(--font-sans)' }}
          >
            Trusted by forward-thinking organisations
          </p>
          <div className="logo-ticker" aria-hidden="true">
            <div className="logo-ticker__track">
              {TRUSTED.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="logo-ticker__item"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                lineHeight: 1.1,
                color: '#0f172a',
                fontWeight: 400,
                textWrap: 'balance',
              }}
            >
              Everything you need to run training
            </h2>
            <p
              className="mx-auto"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                color: '#64748b',
                maxWidth: '40ch',
              }}
            >
              From course creation to certificate issuance, all in one place.
            </p>
          </div>

          <div data-feature-grid className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                data-feature
                className="group relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{
                  backgroundColor: f.bg,
                  minHeight: '340px',
                }}
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: f.color }}
                  >
                    <div className="w-5 h-5 bg-white rounded-sm" />
                  </div>
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'var(--font-display)', color: '#0f172a', fontWeight: 400 }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-sans)', color: '#475569' }}
                  >
                    {f.description}
                  </p>
                </div>

                <div
                  className="mt-8 flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                  style={{ color: f.color, fontFamily: 'var(--font-sans)' }}
                >
                  Learn more
                  <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Dark section ═══ */}
      <section id="how-it-works" className="py-24 sm:py-32" style={{ backgroundColor: '#0f172a' }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-20">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                lineHeight: 1.1,
                color: 'white',
                fontWeight: 400,
                textWrap: 'balance',
              }}
            >
              Three steps to better training
            </h2>
            <p
              className="mx-auto"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '36ch',
              }}
            >
              Get your team learning in minutes, not months.
            </p>
          </div>

          <div data-step-grid className="relative">
            <div
              className="hidden md:block absolute top-14 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {STEPS.map((s, i) => (
                <div data-step key={s.title} className="text-center relative">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 text-base font-semibold relative z-10"
                    style={{
                      backgroundColor: '#0d9488',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3
                    className="text-lg mb-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 400 }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-xs mx-auto"
                    style={{ fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.45)' }}
                  >
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Decorative circles — same as hero */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="hero-circle" style={{ width: 800, height: 800 }} />
          <div className="hero-circle hero-circle--inner" style={{ width: 560, height: 560 }} />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <div data-cta>
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                lineHeight: 1.1,
                color: '#0f172a',
                fontWeight: 400,
                textWrap: 'balance',
              }}
            >
              Ready to train your team?
            </h2>
            <p
              className="mb-10 mx-auto"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                color: '#64748b',
                maxWidth: '36ch',
              }}
            >
              Sign in to get started. New here? Contact us to set up your organisation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium cursor-pointer border-none transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 1px 3px rgba(13, 148, 136, 0.3)',
                }}
              >
                Sign in
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <a
                href="mailto:hello@incodet.com"
                className="inline-flex items-center gap-1.5 text-sm font-medium no-underline transition-opacity hover:opacity-70"
                style={{ color: '#64748b', fontFamily: 'var(--font-sans)' }}
              >
                Contact us <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24 sm:py-32" style={{ backgroundColor: 'white' }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-14">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                lineHeight: 1.1,
                color: '#0f172a',
                fontWeight: 400,
              }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div data-faq-grid className="space-y-3">
            {FAQS.map((item) => (
              <div
                data-faq
                key={item.q}
                className="rounded-xl p-6 transition-all duration-200 hover:shadow-sm"
                style={{
                  backgroundColor: '#F8F3EB',
                  border: '1px solid rgba(15, 23, 42, 0.05)',
                }}
              >
                <dt
                  className="text-sm font-semibold mb-1.5"
                  style={{ fontFamily: 'var(--font-sans)', color: '#0f172a' }}
                >
                  {item.q}
                </dt>
                <dd
                  className="text-sm leading-relaxed m-0"
                  style={{ fontFamily: 'var(--font-sans)', color: '#64748b' }}
                >
                  {item.a}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ backgroundColor: '#0f172a' }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0d9488' }}>
                  <div className="w-3 h-3 bg-white rounded-sm" />
                </div>
                <span
                  className="text-base font-semibold"
                  style={{ fontFamily: 'var(--font-sans)', color: 'white' }}
                >
                  ILMS
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Corporate learning, made simple.
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Product
              </h3>
              <ul className="space-y-2 list-none p-0 m-0">
                <li>
                  <Link to="/login" className="text-sm no-underline transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Company
              </h3>
              <ul className="space-y-2 list-none p-0 m-0">
                <li>
                  <a href="https://incodet.com" className="text-sm no-underline transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    incodet.com
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@incodet.com" className="text-sm no-underline transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Legal
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                &copy; {new Date().getFullYear()} incodet. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
