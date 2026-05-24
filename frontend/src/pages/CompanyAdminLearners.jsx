import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function CompanyAdminLearners() {
  const { user } = useAuth()
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadLearners() }, [])

  async function loadLearners() {
    try {
      const data = await api.organisations.listUsers(user.organisation_id)
      setLearners(data.filter(u => u.role === 'learner'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.organisations.createLearner(user.organisation_id, form)
      setForm({ email: '', first_name: '', last_name: '' })
      setShowForm(false)
      loadLearners()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(userId) {
    if (!confirm('Deactivate this learner? They will not be able to log in.')) return
    try {
      await api.organisations.deactivateUser(userId)
      loadLearners()
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <p className="text-[#888888]">Loading learners...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#032147]">Learners</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
        >
          {showForm ? 'Cancel' : 'Add Learner'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded shadow-sm p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-[#888888] mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#888888] mb-1">First Name</label>
            <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#888888] mb-1">Last Name</label>
            <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <button type="submit" disabled={submitting} className="bg-[#01696f] text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {learners.length === 0 && <p className="text-[#888888] text-sm">No learners yet.</p>}

      <div className="grid gap-3">
        {learners.map(learner => (
          <div key={learner.id} className="bg-white rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#032147]">{learner.first_name} {learner.last_name}</p>
              <p className="text-xs text-[#888888]">{learner.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${learner.is_active ? 'bg-[#437a22] text-white' : 'bg-red-100 text-red-600'}`}>
                {learner.is_active ? 'Active' : 'Inactive'}
              </span>
              {learner.is_active && (
                <button
                  onClick={() => handleDeactivate(learner.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
