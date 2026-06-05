import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, useToast } from '../components/ui'
import { AcademicCapIcon } from '@heroicons/react/24/outline'

// Adapted from twp-components/Application UI/Forms/Sign-in and Registration/Split screen/v4
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
    <div className="min-h-screen flex bg-canvas">
      {/* Form side */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/" className="inline-block">
            <img src="/logo.svg" alt="ILMS by incodet" className="h-10 w-auto" />
          </Link>
          <h2 className="mt-8 text-2xl font-bold tracking-tight text-navy-700">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted">
            Don't have an account?{' '}
            <a href="mailto:hello@incodet.com" className="font-semibold text-primary-600 hover:text-primary-700">
              Contact your administrator
            </a>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-x-2 text-sm text-navy-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                Remember me
              </label>
              <a
                href="mailto:hello@incodet.com"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" loading={submitting} fullWidth size="lg">
              Sign in
            </Button>
          </form>
        </div>
      </div>

      {/* Marketing side */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-navy-700 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <AcademicCapIcon className="size-12 mb-6 text-primary-200" />
            <h2 className="text-3xl font-bold mb-4">
              Corporate learning, made simple
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Sign in to manage your organisation's training, track learner
              progress, and issue certificates of completion.
            </p>
            <ul className="space-y-3 text-primary-50">
              <li className="flex items-start gap-x-3">
                <span className="shrink-0 mt-1 size-5 rounded-full bg-primary-500/30 flex items-center justify-center">
                  <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Multi-tenant organisation isolation
              </li>
              <li className="flex items-start gap-x-3">
                <span className="shrink-0 mt-1 size-5 rounded-full bg-primary-500/30 flex items-center justify-center">
                  <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Per-lesson progress tracking
              </li>
              <li className="flex items-start gap-x-3">
                <span className="shrink-0 mt-1 size-5 rounded-full bg-primary-500/30 flex items-center justify-center">
                  <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Auto-generated PDF certificates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
