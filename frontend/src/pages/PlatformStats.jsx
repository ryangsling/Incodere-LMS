import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import PageHeader from '../components/ui/PageHeader'

export default function PlatformStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.stats
      .platform()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Organisations', value: stats.total_organisations },
        { label: 'Learners', value: stats.total_learners },
        { label: 'Completions', value: stats.total_certificates },
      ]
    : []

  return (
    <div>
      <PageHeader
        title="Platform statistics"
        description="Totals across every organisation on the platform."
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-3" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[var(--radius-surface)] bg-structural" />
          ))}
          <span className="sr-only">Loading statistics</span>
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-control)] border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : !stats ? (
        <p className="card p-8 text-center text-sm text-muted">No statistics available yet.</p>
      ) : (
        // font-light was requested here but weight 300 is not loaded, so the
        // browser silently rendered 400. Weights are now limited to ones the
        // font actually ships.
        <dl className="grid gap-5 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="card p-6">
              <dt className="text-sm text-muted">{card.label}</dt>
              <dd data-numeric className="mt-2 text-4xl font-semibold text-ink">
                {card.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
