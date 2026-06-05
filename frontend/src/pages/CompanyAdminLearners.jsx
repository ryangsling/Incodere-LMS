import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button, Input, useToast } from '../components/ui'

export default function CompanyAdminLearners() {
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await api.organisations.listUsers(user.organisation_id, { role: 'learner', pageSize: 100 })
      setRows(data.rows || [])
    } catch (e) {
      toast.error(e.message)
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
      toast.success(`Learner ${form.email} added`)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(id, email) {
    if (!confirm(`Deactivate ${email}? They will not be able to log in.`)) return
    try {
      await api.organisations.deactivateUser(id)
      toast.success(`${email} deactivated`)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (l) => <span className="font-medium text-navy-700">{l.first_name} {l.last_name}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'is_active',
      label: 'Status',
      render: (l) => <Badge variant={l.is_active ? 'success' : 'danger'}>{l.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'id',
      label: '',
      render: (l) =>
        l.is_active ? (
          <button onClick={() => handleDeactivate(l.id, l.email)} className="text-xs text-red-600 hover:underline">
            Deactivate
          </button>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Learners"
        action={{ onClick: () => setShowForm(!showForm), label: showForm ? 'Cancel' : 'Add Learner' }}
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-md shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-muted mb-1">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-muted mb-1">First Name</label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-muted mb-1">Last Name</label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </form>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search learners..."
        searchableFields={['first_name', 'last_name', 'email']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No learners yet" description="Add learners to enrol them in courses." />}
      />
    </div>
  )
}
