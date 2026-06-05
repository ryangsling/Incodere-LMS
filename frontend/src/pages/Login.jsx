import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, useToast } from '../components/ui'

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
    <div className="min-h-screen flex bg-gradient-to-r from-typography to-canvas">

      {/* Marketing side (Left) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12">

          {/* Top Logo */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ILMS</span>
          </div>

          {/* Center Content */}
          <div className="relative flex flex-col items-center justify-center text-center">
            {/* Subtle Bento Background Elements */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
               <div className="w-96 h-96 border border-white/5 rounded-[3rem] flex items-center justify-center">
                 <div className="w-64 h-64 border border-white/5 rounded-[2rem]"></div>
               </div>
            </div>

            <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
              Corporate learning,<br />made simple.
            </h2>
            <p className="text-lg text-white/60 max-w-sm">
              Manage your organisation's training, track progress, and issue certificates.
            </p>
          </div>

          {/* Bottom Footer */}
          <div className="text-white/40 text-xs tracking-wider uppercase font-semibold">
            © 2026 INCODET LMS PLATFORM
          </div>

      </div>

      {/* Form side (Right) */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-12 sm:px-6 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
             <div className="flex items-center gap-2">
                <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
                  <div className="w-full h-full bg-white rounded-sm"></div>
                </div>
                <span className="text-typography font-bold text-xl tracking-tight">ILMS</span>
              </div>
          </div>

          <h2 className="text-3xl font-display font-bold tracking-tight text-typography">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-typography/60 mb-8">
            Enter your credentials to access the platform
          </p>

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
              <label className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-2">
                Password
              </label>
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
        </div>
      </div>

    </div>
  )
}
