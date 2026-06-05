import { Link, useNavigate } from 'react-router-dom'
import {
  AcademicCapIcon,
  ChartBarIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui'

// Composed from twp-components/Marketing/Page Sections/* v4
export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // If already logged in, send to role home
  if (user) {
    switch (user.role) {
      case 'super_admin':
        navigate('/super-admin', { replace: true })
        break
      case 'company_admin':
        navigate('/admin', { replace: true })
        break
      case 'learner':
        navigate('/dashboard', { replace: true })
        break
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2"><div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5"><div className="w-full h-full bg-white rounded-sm"></div></div><span className="text-white font-bold text-xl tracking-tight">ILMS</span></div>
          </Link>
          <div className="flex items-center gap-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-navy-700 hover:text-primary-600"
            >
              Sign in
            </Link>
            <Button onClick={() => navigate('/login')}>Get started</Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-50 to-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold text-primary-700 uppercase tracking-wider mb-3">
              Corporate Learning, Made Simple
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-700 tracking-tight">
              Train your team. Track their progress. Issue real certificates.
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
              ILMS is a multi-tenant learning management system built for corporate
              training. Onboard clients, assign courses, and let your learners learn.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button size="lg" onClick={() => navigate('/login')}>
                Sign in to your account
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  const el = document.getElementById('features')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn more
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted">
              Don't have an account? Ask your training manager to send you an invite.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">
              Everything you need to run training
            </h2>
            <p className="mt-4 text-lg text-muted">
              From course creation to certificate issuance, all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: AcademicCapIcon,
                title: 'Course Management',
                description:
                  'Create courses with sections, video lessons, and reading material. Drag-and-drop curriculum editor.',
              },
              {
                icon: ChartBarIcon,
                title: 'Progress Tracking',
                description:
                  'See at a glance which learners are progressing and which need nudging. Per-lesson completion, per-course progress.',
              },
              {
                icon: DocumentCheckIcon,
                title: 'Automatic Certificates',
                description:
                  'When a learner finishes a course, ILMS generates a branded PDF certificate and emails it to them automatically.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-gray-200 bg-surface p-6 shadow-xs"
              >
                <div className="size-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-navy-700 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {[
              { value: '3', label: 'roles' },
              { value: '8', label: 'data tables' },
              { value: '12+', label: 'API routes' },
              { value: '1', label: 'click deploy' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-4xl font-extrabold text-primary-600">{stat.value}</dt>
                <dd className="mt-2 text-sm text-muted uppercase tracking-wider">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">
              How it works
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Create a course', body: 'Add sections, upload YouTube videos, write lesson notes.' },
              { step: '2', title: 'Enrol your learners', body: 'Bulk-add employees via CSV or one at a time. Assign them to the right course.' },
              { step: '3', title: 'Track and certify', body: 'Watch progress in real time. Get a PDF certificate on completion.' },
            ].map((item) => (
              <li key={item.step} className="relative">
                <div className="flex items-center gap-x-3 mb-3">
                  <span className="size-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-navy-700">{item.title}</h3>
                </div>
                <p className="text-sm text-muted pl-11">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to train your team?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Sign in to get started. New here? Contact us to set up your organisation.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
            <a
              href="mailto:hello@incodet.com"
              className="text-sm font-semibold text-white hover:text-primary-100"
            >
              Contact us <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 bg-canvas">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">Frequently asked</h2>
          </div>
          <dl className="space-y-6">
            {[
              {
                q: 'What does a course contain?',
                a: 'A course is organised into sections, and each section contains video lessons (YouTube embed) and reading material (text).',
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
                a: 'Yes. Each organisation only sees its own learners, enrolments, and certificates. Super admins manage the platform and the course catalogue.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-lg border border-gray-200 bg-surface p-6"
              >
                <dt className="text-base font-semibold text-navy-700">{item.q}</dt>
                <dd className="mt-2 text-sm text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5"><div className="w-full h-full bg-white rounded-sm"></div></div><span className="text-typography font-bold text-xl tracking-tight">ILMS</span></div>
              <p className="text-sm text-navy-100">
                Corporate learning, made simple.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-navy-100">
                <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-navy-100">
                <li><a href="https://incodet.com" className="hover:text-white">incodet.com</a></li>
                <li><a href="mailto:hello@incodet.com" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Legal</h3>
              <p className="text-sm text-navy-100">
                &copy; {new Date().getFullYear()} incodet. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
