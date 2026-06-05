import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button, Input } from '../components/ui'

export default function OrganisationList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', contact_email: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await api.organisations.list({ pageSize: 100 })
      setRows(data.rows || [])
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
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (o) => <Link to={`/super-admin/organisations/${o.id}`} className="font-medium text-navy-700 hover:text-primary-600">{o.name}</Link>,
    },
    { key: 'contact_email', label: 'Email' },
    {
      key: 'is_active',
      label: 'Status',
      render: (o) => <Badge variant={o.is_active ? 'success' : 'default'}>{o.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Organisations"
        action={{ onClick: () => setShowForm(!showForm), label: showForm ? 'Cancel' : 'New Organisation' }}
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-md shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted mb-1">Contact Email</label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search organisations..."
        searchableFields={['name', 'contact_email']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No organisations yet" description="Create your first organisation to onboard a client." />}
      />
    </div>
  )
}
