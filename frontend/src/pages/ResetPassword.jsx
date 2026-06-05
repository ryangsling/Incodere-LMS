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
