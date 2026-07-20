import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  AcademicCapIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────
   August Health Design System — ILMS Landing
   Warm cream canvas · Indigo accents · Pill geometry
   ───────────────────────────────────────────── */

const FEATURES = [
  {
    icon: AcademicCapIcon,
    title: 'Course Management',
    description:
      'Create rich courses with sections, video lessons, and reading material. Drag-and-drop curriculum builder.',
    bg: '#f098d7',
    dark: false,
  },
  {
    icon: ChartBarIcon,
    title: 'Progress Tracking',
    description:
      'Real-time dashboards showing learner engagement, completion rates, and areas needing attention.',
    bg: '#328a3b',
    dark: true,
  },
  {
    icon: DocumentCheckIcon,
    title: 'Auto Certificates',
    description:
      'Branded PDF certificates generated and emailed the moment a learner completes a course.',
    bg: '#ff6d39',
    dark: false,
  },
]

const STATS = [
  { value: 3, suffix: '', label: 'User Roles' },
  { value: 12, suffix: '+', label: 'API Routes' },
  { value: 100, suffix: '%', label: 'Tenant Isolation' },
  { value: 1, suffix: '', label: 'Click Deploy' },
]

const STEPS = [
  {
    num: '01',
    title: 'Create a course',
    body: 'Add sections, embed YouTube videos, write lesson notes. Your curriculum, your way.',
  },
  {
    num: '02',
    title: 'Enrol learners',
    body: 'Bulk-add employees or invite them one at a time. Assign courses with a single click.',
  },
  {
    num: '03',
    title: 'Track & certify',
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

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: function () {
            setCount(Math.round(this.targets()[0].val))
          },
        })
      },
    })

    return () => trigger.kill()
  }, [target, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

/* ─── Main Component ─── */
export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const navRef = useRef(null)

  // Redirect logged-in users
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

  // ─── GSAP Animations ───
  useEffect(() => {
    if (user) return
    const ctx = gsap.context(() => {
      // Nav entrance
      gsap.from(navRef.current, {
        y: -40,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      })

      // Hero text stagger
      const heroEls = heroRef.current?.querySelectorAll('[data-hero]')
      if (heroEls) {
        gsap.from(heroEls, {
          y: 50,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.4,
        })
      }

      // Hero decorative circles
      gsap.from('[data-circle]', {
        scale: 0,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.8,
      })

      // Feature cards
      gsap.from('[data-feature]', {
        scrollTrigger: {
          trigger: '[data-feature-grid]',
          start: 'top 80%',
          once: true,
        },
        y: 60,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // Section headers
      gsap.utils.toArray('[data-section-header]').forEach((el) => {
        gsap.from(el.children, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        })
      })

      // Steps
      gsap.from('[data-step]', {
        scrollTrigger: {
          trigger: '[data-step-grid]',
          start: 'top 80%',
          once: true,
        },
        x: -40,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // FAQ items
      gsap.from('[data-faq]', {
        scrollTrigger: {
          trigger: '[data-faq-grid]',
          start: 'top 80%',
          once: true,
        },
        y: 30,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })

      // CTA section
      gsap.from('[data-cta]', {
        scrollTrigger: {
          trigger: '[data-cta]',
          start: 'top 85%',
          once: true,
        },
        scale: 0.95,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    }, containerRef)

    return () => ctx.revert()
  }, [user])

  if (user) return null

  return (
    <div ref={containerRef} className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* ═══ NAVBAR — Pill-shaped floating bar ═══ */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <nav
          ref={navRef}
          className="flex items-center justify-between px-6 py-3 rounded-full"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 4px 0 rgba(75,68,57,0.05), 0 32px 16px 0 rgba(75,68,57,0.08)',
          }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-white rounded-sm" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)' }}
            >
              ILMS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-transparent border-none"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-deep-ink)' }}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-sm !py-2 !px-5"
            >
              Get started
            </button>
          </div>
        </nav>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden" ref={heroRef}>
        {/* Gradient accent background */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ background: 'linear-gradient(121deg, rgb(204,122,181) 0%, rgb(72,101,255) 50%, rgb(27,20,99) 100%)' }}
        />

        {/* Decorative circles */}
        <div
          data-circle
          className="absolute top-24 right-[10%] w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--color-blossom)' }}
        />
        <div
          data-circle
          className="absolute bottom-16 left-[8%] w-16 h-16 rounded-full opacity-15"
          style={{ backgroundColor: 'var(--color-ember)' }}
        />
        <div
          data-circle
          className="absolute top-40 left-[15%] w-10 h-10 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-forest)' }}
        />
        <div
          data-circle
          className="absolute bottom-32 right-[20%] w-8 h-8 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--color-primary-indigo)' }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Badge pill */}
          <div data-hero className="inline-flex mb-6">
            <span
              className="badge-pill"
              style={{
                backgroundColor: 'rgba(72,101,255,0.08)',
                color: 'var(--color-primary-indigo)',
              }}
            >
              <RocketLaunchIcon className="w-3.5 h-3.5" />
              Corporate Learning, Made Simple
            </span>
          </div>

          {/* Headline */}
          <h1
            data-hero
            className="display-title mb-6"
            style={{ color: 'var(--color-deep-ink)' }}
          >
            Train your team.<br />
            Track their progress.<br />
            Issue real certificates.
          </h1>

          {/* Subtitle */}
          <p
            data-hero
            className="body-copy max-w-xl mx-auto mb-10"
            style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-stone)' }}
          >
            A multi-tenant LMS built for corporate training.
            Onboard clients, assign courses, and let your learners learn.
          </p>

          {/* CTAs */}
          <div data-hero className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base !py-3 !px-8"
            >
              Sign in to your account
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost group"
            >
              Learn more
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <p data-hero className="mt-5 text-sm" style={{ color: 'var(--color-stone)', opacity: 0.7 }}>
            Don't have an account? Ask your training manager to send you an invite.
          </p>
        </div>
      </section>

      {/* ═══ FEATURES — Tinted Cards ═══ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div data-section-header className="text-center mb-16">
            <span
              className="badge-pill inline-flex mb-4"
              style={{ backgroundColor: 'rgba(72,101,255,0.08)', color: 'var(--color-primary-indigo)' }}
            >
              The Platform
            </span>
            <h2 className="section-title" style={{ color: 'var(--color-deep-ink)' }}>
              Everything you need to run training
            </h2>
            <p className="body-copy mt-4 max-w-lg mx-auto">
              From course creation to certificate issuance, all in one beautiful place.
            </p>
          </div>

          <div data-feature-grid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                data-feature
                className="tinted-card flex flex-col group cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                style={{ backgroundColor: f.bg }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                  >
                    <f.icon className="w-6 h-6" style={{ color: f.dark ? 'white' : 'var(--color-deep-ink)' }} />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:shadow-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                  >
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: 'var(--color-deep-ink)' }} />
                  </div>
                </div>
                <h3
                  className="text-xl mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    color: f.dark ? 'white' : 'var(--color-deep-ink)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{
                    color: f.dark ? 'rgba(255,255,255,0.85)' : 'rgba(8,3,49,0.75)',
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS — Counter Animation ═══ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-pure-white)' }}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-4xl sm:text-5xl font-light mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-indigo)' }}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div
                  className="text-xs uppercase tracking-widest font-medium"
                  style={{ color: 'var(--color-stone)' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div data-section-header className="text-center mb-16">
            <span
              className="badge-pill inline-flex mb-4"
              style={{ backgroundColor: 'rgba(50,138,59,0.08)', color: 'var(--color-forest)' }}
            >
              How It Works
            </span>
            <h2 className="section-title" style={{ color: 'var(--color-deep-ink)' }}>
              Three steps to better training
            </h2>
          </div>

          <div data-step-grid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div data-step key={s.num} className="relative">
                <div
                  className="text-5xl font-light mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary-indigo)',
                    opacity: 0.3,
                  }}
                >
                  {s.num}
                </div>
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-deep-ink)' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-stone)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div
            data-cta
            className="rounded-3xl px-8 py-16 sm:px-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1b1463 0%, #4865ff 60%, #a2baff 100%)',
              boxShadow: '0 48px 48px 0 rgba(75,68,57,0.12)',
            }}
          >
            {/* Decorative dots */}
            <div className="absolute top-6 right-8 w-3 h-3 rounded-full bg-white/10" />
            <div className="absolute bottom-8 left-12 w-2 h-2 rounded-full bg-white/15" />
            <div className="absolute top-12 left-20 w-4 h-4 rounded-full bg-white/5" />

            <h2
              className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'white' }}
            >
              Ready to train your team?
            </h2>
            <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Sign in to get started. New here? Contact us to set up your organisation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium text-sm cursor-pointer border-none transition-all duration-300"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--color-deep-ink)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 8px 16px 0 rgba(0,0,0,0.15)',
                }}
              >
                Sign in
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <a
                href="mailto:hello@incodet.com"
                className="inline-flex items-center gap-1.5 text-sm font-medium no-underline transition-opacity hover:opacity-80"
                style={{ color: 'white', fontFamily: 'var(--font-sans)' }}
              >
                Contact us <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-pure-white)' }}>
        <div className="mx-auto max-w-3xl px-4">
          <div data-section-header className="text-center mb-12">
            <span
              className="badge-pill inline-flex mb-4"
              style={{ backgroundColor: 'rgba(72,101,255,0.08)', color: 'var(--color-primary-indigo)' }}
            >
              FAQ
            </span>
            <h2 className="section-title" style={{ color: 'var(--color-deep-ink)' }}>
              Frequently asked
            </h2>
          </div>

          <div data-faq-grid className="space-y-4">
            {FAQS.map((item) => (
              <div
                data-faq
                key={item.q}
                className="rounded-2xl p-6 transition-all duration-300 hover:shadow-md cursor-default"
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              >
                <dt
                  className="text-base font-medium mb-2"
                  style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-deep-ink)' }}
                >
                  {item.q}
                </dt>
                <dd className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-stone)' }}>
                  {item.a}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ backgroundColor: 'var(--color-deep-ink)' }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{ fontFamily: 'var(--font-display)', color: 'white' }}
                >
                  ILMS
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Corporate learning, made simple.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3
                className="text-xs uppercase tracking-widest font-medium mb-4"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Product
              </h3>
              <ul className="space-y-2 list-none p-0 m-0">
                <li>
                  <Link
                    to="/login"
                    className="text-sm no-underline transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3
                className="text-xs uppercase tracking-widest font-medium mb-4"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Company
              </h3>
              <ul className="space-y-2 list-none p-0 m-0">
                <li>
                  <a
                    href="https://incodet.com"
                    className="text-sm no-underline transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    incodet.com
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@incodet.com"
                    className="text-sm no-underline transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3
                className="text-xs uppercase tracking-widest font-medium mb-4"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Legal
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                &copy; {new Date().getFullYear()} incodet. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
