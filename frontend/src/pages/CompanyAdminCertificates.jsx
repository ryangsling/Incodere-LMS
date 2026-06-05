import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { PageHeader, DataTable, EmptyState, Button } from '../components/ui'

export default function CompanyAdminCertificates() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.certificates.list({ pageSize: 100 })
      .then((data) => setRows(data.rows || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    {
      key: 'learner',
      label: 'Learner',
      render: (c) => <span className="font-medium text-typography">{c.learner?.first_name} {c.learner?.last_name}</span>,
    },
    {
      key: 'course',
      label: 'Course',
      render: (c) => c.course?.title || '—',
    },
    {
      key: 'issued_at',
      label: 'Issued',
      render: (c) => c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—',
    },
    {
      key: 'id',
      label: 'Verify',
      render: (c) => (
        <a href={`/verify/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
          Link
        </a>
      ),
    },
    {
      key: 'download',
      label: '',
      render: (c) => (
        <Button
          size="xs"
          onClick={() => {
            api.certificates.download(c.id).catch((e) => {
              const toast = (window).toast
              if (toast) toast.error(e.message)
            })
          }}
        >
          Download
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Certificates" />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search certificates..."
        searchableFields={['learner.first_name', 'learner.last_name', 'course.title']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No certificates issued yet" description="Certificates appear here once learners complete courses." />}
      />
    </div>
  )
}
