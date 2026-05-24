import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function OrganisationDetail() {
  const { orgId } = useParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadUsers() }, [orgId])

  async function loadUsers() {
    try {
      const data = await api.organisations.listUsers(orgId)
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.organisations.createCompanyAdmin(orgId, form)
      setForm({ email: '', first_name: '', last_name: '' })
      setShowForm(false)
      loadUsers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-[#888888]">Loading...</p>

  return (
    <div>
      <Link to="/super-admin/organisations" className="text-sm text-[#01696f] hover:underline">&larr; Back to organisations</Link>
      <h2 className="text-xl font-bold text-[#032147] mt-2 mb-6">Organisation Users</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f] mb-4"
      >
        {showForm ? 'Cancel' : 'Add Company Admin'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateAdmin} className="bg-white rounded shadow-sm p-4 mb-6 flex gap-3 items-end">
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

      {users.length === 0 && <p className="text-[#888888] text-sm">No users in this organisation.</p>}

      <div className="grid gap-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#032147]">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-[#888888]">{user.email} &middot; {user.role}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${user.is_active ? 'bg-[#437a22] text-white' : 'bg-red-100 text-red-600'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
