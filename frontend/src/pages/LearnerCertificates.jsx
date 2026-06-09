import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { PageHeader, DataTable, EmptyState, Button, useToast } from '../components/ui'

export default function LearnerCertificates() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    api.certificates.mine({ pageSize: 100 })
      .then((data) => setRows(data.rows || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [toast])

  async function handleDownload(id) {
    setDownloadingId(id)
    try {
      await api.certificates.download(id)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDownloadingId(null)
    }
  }

  const columns = [
    {
      key: 'course',
      label: 'Course',
      render: (c) => <span className="font-medium text-typography">{c.course?.title || '—'}</span>,
    },
    {
      key: 'issued_at',
      label: 'Issued',
      render: (c) => c.issued_at ? new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    },
    {
      key: 'verify',
      label: '',
      render: (c) => (
        <a href={`/verify/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
          Verify
        </a>
      ),
    },
    {
      key: 'download',
      label: '',
      render: (c) => (
        <Button
          size="xs"
          onClick={() => handleDownload(c.id)}
          disabled={downloadingId === c.id}
        >
          {downloadingId === c.id ? 'Downloading...' : 'Download'}
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-structural">
      <header className="bg-canvas border-b border-border-hairline px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gradient-to-br from-[#312E81] to-[#06B6D4] flex items-center justify-center p-1.5">
            <div className="w-full h-full bg-white rounded-sm"></div>
          </div>
          <span className="text-typography font-bold text-xl tracking-tight">ILMS</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-typography opacity-60 hover:opacity-100 transition-all duration-300"
          >
            Dashboard
          </button>
          <span className="text-sm font-medium text-typography opacity-80 hidden sm:block">
            {user?.first_name} {user?.last_name}
          </span>
          <button
            onClick={logout}
            className="text-sm font-semibold text-typography opacity-60 hover:opacity-100 hover:text-accent transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <PageHeader title="My Certificates" />

        <DataTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search certificates..."
          searchableFields={['course.title']}
          pageSize={20}
          loading={loading}
          emptyState={<EmptyState title="No certificates yet" description="Complete a course to earn your first certificate." />}
        />
      </main>
    </div>
  )
}
