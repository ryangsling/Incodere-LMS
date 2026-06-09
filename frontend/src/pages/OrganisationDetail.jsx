import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button, Input, useToast } from '../components/ui'

export default function OrganisationDetail() {
  const { orgId } = useParams()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '' })
  const [submitting, setSubmitting] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [orgId])

  async function load() {
    setLoading(true)
    try {
      const data = await api.organisations.listUsers(orgId, { pageSize: 100 })
      setRows(data.rows || [])
    } catch (e) {
      toast.error(e.message)
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
      toast.success(`Admin ${form.email} added`)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (u) => <span className="font-medium text-navy-700">{u.first_name} {u.last_name}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => <Badge>{u.role}</Badge> },
    {
      key: 'is_active',
      label: 'Status',
      render: (u) => <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ]

  return (
    <div>
      <Link to="/super-admin/organisations" className="text-sm text-primary-600 hover:underline">&larr; Back to organisations</Link>
      <PageHeader
        title="Organisation Users"
        action={{ onClick: () => setShowForm(!showForm), label: showForm ? 'Cancel' : 'Add Company Admin' }}
      />

      {showForm && (
        <form onSubmit={handleCreateAdmin} className="bg-white rounded-md shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
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
        searchPlaceholder="Search users..."
        searchableFields={['first_name', 'last_name', 'email', 'role']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No users in this organisation" description="Add a company admin to get started." />}
      />
    </div>
  )
}
