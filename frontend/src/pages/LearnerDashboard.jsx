import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button } from '../components/ui'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('courses')
  const [enrolments, setEnrolments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabError, setTabError] = useState('')

  useEffect(() => {
    setTabError('')
    setLoading(true)
    if (tab === 'courses') {
      api.enrolments.myEnrolments()
        .then((rows) => setEnrolments(Array.isArray(rows) ? rows : rows.rows || []))
        .catch((e) => setTabError(e.message))
        .finally(() => setLoading(false))
    } else {
      api.certificates.mine()
        .then((data) => setCertificates(data.rows || []))
        .catch((e) => setTabError(e.message))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const courseColumns = [
    {
      key: 'title',
      label: 'Course',
      render: (e) => <span className="font-medium text-navy-700">{e.course?.title}</span>,
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (e) => (
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted">{e.completed_lessons}/{e.total_lessons}</span>
            <span className="text-xs font-medium text-navy-700">{e.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${e.progress}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (e) => <Badge variant={e.progress === 100 ? 'success' : 'info'}>{e.progress === 100 ? 'Completed' : 'In progress'}</Badge>,
    },
    {
      key: 'id',
      label: '',
      render: (e) => <Button size="xs" onClick={() => navigate(`/dashboard/courses/${e.course_id}`)}>Continue</Button>,
    },
  ]

  const certColumns = [
    {
      key: 'title',
      label: 'Course',
      render: (c) => <span className="font-medium text-navy-700">{c.course?.title}</span>,
    },
    {
      key: 'issued_at',
      label: 'Issued',
      render: (c) => c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—',
    },
    {
      key: 'id',
      label: 'Verify',
      render: (c) => <a href={`/verify/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">Link</a>,
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
    <div className="min-h-screen bg-canvas">
      <header className="bg-primary-600 text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold text-base sm:text-lg">ILMS</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{user?.first_name} {user?.last_name}</span>
          <button onClick={logout} className="text-xs sm:text-sm bg-white text-primary-600 px-2 sm:px-3 py-1 rounded hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:p-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setTab('courses') }}
            className={`pb-2 text-sm font-medium ${tab === 'courses' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-muted'}`}
          >
            My Courses
          </button>
          <button
            onClick={() => { setTab('certificates') }}
            className={`pb-2 text-sm font-medium ${tab === 'certificates' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-muted'}`}
          >
            My Certificates
          </button>
        </div>

        {loading && <p className="text-muted">Loading...</p>}
        {tabError && <p className="text-red-600 text-sm mb-4">{tabError}</p>}

        {!loading && tab === 'courses' && (
          <DataTable
            columns={courseColumns}
            rows={enrolments}
            searchPlaceholder="Search courses..."
            searchableFields={['course.title']}
            pageSize={20}
            emptyState={<EmptyState title="No courses enrolled yet" description="Your company admin will enrol you on courses." />}
          />
        )}

        {!loading && tab === 'certificates' && (
          <DataTable
            columns={certColumns}
            rows={certificates}
            searchPlaceholder="Search certificates..."
            searchableFields={['course.title']}
            pageSize={20}
            emptyState={<EmptyState title="No certificates yet" description="Complete a course to earn one." />}
          />
        )}
      </main>
    </div>
  )
}
