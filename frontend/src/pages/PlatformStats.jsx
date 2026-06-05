import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function PlatformStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.stats.platform()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted">Loading stats...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!stats) return <p className="text-muted">No stats available.</p>

  const cards = [
    { label: 'Total Organisations', value: stats.total_organisations },
    { label: 'Total Learners', value: stats.total_learners },
    { label: 'Total Completions', value: stats.total_certificates },
  ]

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-typography mb-6">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-canvas border border-border-hairline p-6 flex flex-col items-start justify-center">
            <p className="text-sm font-medium text-typography/60 mb-2 uppercase tracking-wider">{card.label}</p>
            <p className="text-4xl font-light text-typography">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
