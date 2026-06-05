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
