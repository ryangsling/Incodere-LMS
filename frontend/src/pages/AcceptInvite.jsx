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
  const [infoLoaded, setInfoLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [infoError, setInfoError] = useState('')
  const loadingInfo = tokensValid && !infoLoaded

  useEffect(() => {
    if (!tokensValid) return
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
        if (!cancelled) setInfoLoaded(true)
      })
    return () => { cancelled = true }
  }, [tokens, tokensValid])

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
