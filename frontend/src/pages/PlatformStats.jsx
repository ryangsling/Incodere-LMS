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
    { label: 'Organisations', value: stats.total_organisations, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Learners', value: stats.total_learners, color: 'bg-green-100 text-accent-600' },
    { label: 'Total Courses', value: stats.total_courses, color: 'bg-purple-100 text-purple-600' },
    { label: 'Published Courses', value: stats.published_courses, color: 'bg-teal-100 text-primary-600' },
    { label: 'Certificates Issued', value: stats.total_certificates, color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-navy-700 mb-6">Platform Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded shadow-sm p-6">
            <p className="text-sm text-muted mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
