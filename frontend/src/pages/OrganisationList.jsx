import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function OrganisationList() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', contact_email: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadOrgs() }, [])

  async function loadOrgs() {
    try {
      const data = await api.organisations.list()
      setOrgs(data)
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
      await api.organisations.create(form)
      setForm({ name: '', contact_email: '' })
      setShowForm(false)
      loadOrgs()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-[#888888]">Loading organisations...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#032147]">Organisations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
        >
          {showForm ? 'Cancel' : 'New Organisation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded shadow-sm p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-[#888888] mb-1">Name</label>
            <input
              type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[#888888] mb-1">Contact Email</label>
            <input
              type="email" value={form.contact_email}
              onChange={e => setForm({ ...form, contact_email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <button
            type="submit" disabled={submitting}
            className="bg-[#01696f] text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {orgs.length === 0 && (
        <p className="text-[#888888] text-sm">No organisations yet.</p>
      )}

      <div className="grid gap-3">
        {orgs.map(org => (
          <Link
            key={org.id}
            to={`/super-admin/organisations/${org.id}`}
            className="bg-white rounded shadow-sm p-4 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <h3 className="font-medium text-[#032147]">{org.name}</h3>
              <p className="text-xs text-[#888888]">{org.contact_email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${org.is_active ? 'bg-[#437a22] text-white' : 'bg-gray-200 text-[#888888]'}`}>
              {org.is_active ? 'Active' : 'Inactive'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
