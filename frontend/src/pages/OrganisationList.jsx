import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button, Input, useToast } from '../components/ui'

const FREE_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'proton.me', 'zoho.com',
  'yandex.com', 'gmx.com', 'fastmail.com', 'tutanota.com', 'inbox.com',
  'live.com', 'msn.com', 'ymail.com', 'rocketmail.com', 'me.com',
  'comcast.net', 'att.net', 'verizon.net', 'cox.net', 'charter.net',
  'sbcglobal.net', 'bellsouth.net', 'earthlink.net', 'juno.com',
  'netzero.com', 'aim.com', 'windowslive.com', 'hotmail.co.uk',
  'yahoo.co.uk', 'yahoo.co.in', 'rediffmail.com', 'laposte.net',
  'web.de', 't-online.de', 'baidu.com', 'qq.com', '163.com', '126.com',
]

function isBusinessEmail(email) {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return !FREE_EMAIL_PROVIDERS.includes(domain)
}

export default function OrganisationList() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', contact_email: '', first_name: '', last_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')

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

  function handleEmailChange(e) {
    const val = e.target.value
    setForm({ ...form, contact_email: val })
    if (val && !isBusinessEmail(val)) {
      setEmailError('Please use a business email (no Gmail, Yahoo, etc.)')
    } else {
      setEmailError('')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!isBusinessEmail(form.contact_email)) {
      setEmailError('Please use a business email (no Gmail, Yahoo, etc.)')
      return
    }
    setSubmitting(true)
    try {
      const result = await api.organisations.create(form)
      if (result?.warning) toast.warning(result.warning)
      else toast.success(`Organisation "${form.name}" created and invite sent to ${form.contact_email}`)
      setForm({ name: '', contact_email: '', first_name: '', last_name: '' })
      setShowForm(false)
      setEmailError('')
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivateAdmin(orgId, email) {
    if (!confirm(`Deactivate admin for ${email}? They will not be able to log in.`)) return
    try {
      const org = rows.find(r => r.id === orgId)
      if (!org?.admin?.id) return toast.error('No admin found for this organisation')
      await api.organisations.deactivateUser(org.admin.id)
      toast.success(`Admin ${email} deactivated`)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function handleActivateAdmin(orgId, email) {
    try {
      const org = rows.find(r => r.id === orgId)
      if (!org?.admin?.id) return toast.error('No admin found for this organisation')
      await api.organisations.activateUser(org.admin.id)
      toast.success(`Admin ${email} activated`)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function handleResendInvite(orgId, email) {
    try {
      const org = rows.find(r => r.id === orgId)
      if (!org?.admin?.id) return toast.error('No admin found for this organisation')
      await api.organisations.resendInvite(org.admin.id)
      toast.success(`Invite re-sent to ${email}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function handleDeleteAdmin(orgId, email) {
    if (!confirm(`Permanently delete admin ${email}? This cannot be undone.`)) return
    try {
      const org = rows.find(r => r.id === orgId)
      if (!org?.admin?.id) return toast.error('No admin found for this organisation')
      await api.organisations.deleteUser(org.admin.id)
      toast.success(`Admin ${email} deleted`)
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Organisation',
      render: (o) => (
        <div>
          <Link to={`/super-admin/organisations/${o.id}`} className="font-medium text-navy-700 hover:text-primary-600">
            {o.name}
          </Link>
          {o.admin && (
            <p className="text-xs text-typography opacity-50 mt-0.5">{o.admin.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'admin_status',
      label: 'Admin Status',
      render: (o) => o.admin
        ? <Badge variant={o.admin.is_active ? 'success' : 'danger'}>{o.admin.is_active ? 'Active' : 'Inactive'}</Badge>
        : <span className="text-xs text-typography opacity-40">No admin</span>,
    },
    {
      key: 'is_active',
      label: 'Org Status',
      render: (o) => <Badge variant={o.is_active ? 'success' : 'default'}>{o.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'id',
      label: '',
      render: (o) => o.admin ? (
        <div className="flex gap-3 justify-end text-xs">
          {o.admin.is_active ? (
            <button onClick={() => handleDeactivateAdmin(o.id, o.admin.email)} className="text-red-600 hover:underline">
              Deactivate
            </button>
          ) : (
            <button onClick={() => handleActivateAdmin(o.id, o.admin.email)} className="text-green-700 hover:underline">
              Activate
            </button>
          )}
          <button onClick={() => handleResendInvite(o.id, o.admin.email)} className="text-navy-600 hover:underline">
            Resend invite
          </button>
          <button onClick={() => handleDeleteAdmin(o.id, o.admin.email)} className="text-red-600 hover:underline">
            Delete
          </button>
        </div>
      ) : (
        <Link to={`/super-admin/organisations/${o.id}`} className="text-xs text-accent hover:underline">
          Add admin
        </Link>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Organisations"
        action={{ onClick: () => { setShowForm(!showForm); setEmailError('') }, label: showForm ? 'Cancel' : 'Invite Organisation' }}
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-md shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-muted mb-1">Company Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Acme Corp"
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-muted mb-1">Business Email</label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={handleEmailChange}
                placeholder="e.g. admin@acmecorp.com"
                required
              />
              {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-muted mb-1">Admin First Name</label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-muted mb-1">Admin Last Name</label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <Button type="submit" disabled={submitting || !!emailError}>
              {submitting ? 'Creating...' : 'Create & Invite'}
            </Button>
          </div>
          <p className="text-xs text-typography opacity-40 mt-2">
            If admin name is provided, an invite email will be sent. Otherwise, add an admin from the organisation page later.
          </p>
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
        emptyState={<EmptyState title="No organisations yet" description="Invite your first organisation to get started." />}
      />
    </div>
  )
}
