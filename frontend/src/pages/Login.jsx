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
