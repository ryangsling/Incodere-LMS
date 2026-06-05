import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState, Button, useToast } from '../components/ui'

export default function CompanyAdminEnrolments() {
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [learners, setLearners] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ learner_ids: [], course_id: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [enrolData, learnerData, courseData] = await Promise.all([
        api.enrolments.list({ pageSize: 100 }),
        api.organisations.listUsers(user.organisation_id, { role: 'learner' }),
        api.courses.list({ pageSize: 100 }),
      ])
      setRows(enrolData.rows || [])
      setLearners((learnerData.rows || []).filter((u) => u.is_active))
      setCourses((courseData.rows || []).filter((c) => c.status === 'published'))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEnrol(e) {
    e.preventDefault()
    if (form.learner_ids.length === 0 || !form.course_id) return
    setSubmitting(true)
    try {
      const result = await api.enrolments.create({ learner_ids: form.learner_ids, course_id: form.course_id })
      const created = result?.count ?? 0
      const skipped = result?.already_enrolled?.length ?? 0
      const requested = form.learner_ids.length
      let msg
      if (created === 0 && skipped === requested) {
        msg = `All ${requested} selected learner(s) were already enrolled in this course`
      } else if (created > 0 && skipped > 0) {
        msg = `Enrolled ${created} learner(s); ${skipped} were already enrolled`
      } else if (created > 0) {
        msg = `Enrolled ${created} learner(s)`
      } else {
        msg = 'No learners were enrolled'
      }
      toast.success(msg)
      setForm({ learner_ids: [], course_id: '' })
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.message || 'Failed to enrol learners')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnenrol(enr) {
    if (!confirm(`Remove ${enr.learner?.first_name} ${enr.learner?.last_name} from ${enr.course?.title}?`)) return
    try {
      await api.enrolments.delete(enr.id)
      toast.success('Enrolment removed')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  function toggleLearner(id) {
    setForm((prev) => ({
      ...prev,
      learner_ids: prev.learner_ids.includes(id)
        ? prev.learner_ids.filter((l) => l !== id)
        : [...prev.learner_ids, id],
    }))
  }

  const columns = [
    {
      key: 'learner',
      label: 'Learner',
      render: (e) => <span className="font-medium text-typography">{e.learner?.first_name} {e.learner?.last_name}</span>,
    },
    { key: 'course', label: 'Course', render: (e) => e.course?.title },
    {
      key: 'status',
      label: 'Status',
      render: (e) => <Badge variant={e.status === 'completed' ? 'success' : 'info'}>{e.status}</Badge>,
    },
    {
      key: 'id',
      label: '',
      render: (e) => (
        <button onClick={() => handleUnenrol(e)} className="text-xs text-red-600 hover:underline">
          Remove
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Enrolments"
        action={{ onClick: () => setShowForm(!showForm), label: showForm ? 'Cancel' : 'Enrol Learners' }}
      />

      {showForm && (
        <form onSubmit={handleEnrol} className="bg-white rounded-md shadow-sm p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm text-muted mb-2">Select Learners</label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-md p-2">
              {learners.length === 0 && <p className="text-xs text-muted">No active learners in your organisation.</p>}
              {learners.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.learner_ids.includes(l.id)}
                    onChange={() => toggleLearner(l.id)}
                  />
                  {l.first_name} {l.last_name} ({l.email})
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted mb-1">Select Course</label>
            <select
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">-- Choose a course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={submitting || form.learner_ids.length === 0 || !form.course_id}
          >
            {submitting ? 'Enrolling...' : `Enrol ${form.learner_ids.length} Learner(s)`}
          </Button>
        </form>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search enrolments..."
        searchableFields={['learner.first_name', 'learner.last_name', 'course.title']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No enrolments yet" description="Enrol learners on a published course to get started." />}
      />
    </div>
  )
}
