import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Skeleton, SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'

export default function CompanyAdminReports() {
  const [rows, setRows] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    Promise.all([
      api.enrolments.report(),
      api.courses.list(),
    ])
      .then(([reportData, courseData]) => {
        setRows(reportData?.rows || [])
        setCourses(courseData?.rows || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function applyFilters() {
    setLoading(true)
    setError('')
    const params = {}
    if (courseFilter) params.course_id = courseFilter
    if (statusFilter) params.status = statusFilter
    try {
      const data = await api.enrolments.report(params)
      setRows(data?.rows || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    const headers = ['Learner Name', 'Email', 'Course', 'Progress %', 'Lessons Completed', 'Total Lessons', 'Certificate Issued', 'Certificate Date', 'Enrolled At']
    const csvRows = [headers.join(',')]

    rows.forEach(r => {
      csvRows.push([
        `"${r.learner_name}"`,
        `"${r.learner_email}"`,
        `"${r.course_title}"`,
        r.progress,
        r.completed_lessons,
        r.total_lessons,
        r.certificate_issued ? 'Yes' : 'No',
        r.certificate_date ? new Date(r.certificate_date).toLocaleDateString() : '',
        new Date(r.enrolled_at).toLocaleDateString(),
      ].join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compliance-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && rows.length === 0) return (
    <div className="font-sans space-y-8">
      <Skeleton variant="title" className="h-8 w-1/4" />
      <Skeleton variant="card" className="h-20" />
      <SkeletonList rows={5} />
    </div>
  )
  if (error) return <p className="text-danger">{error}</p>

  return (
    // This screen previously bypassed PageHeader, Button and the form
    // components entirely, which is why it was the only admin page with a
    // different heading treatment and a third button radius.
    <div>
      <PageHeader
        title="Compliance report"
        description="Progress and certificate status for every enrolment in your organisation."
        actions={
          rows.length > 0 ? (
            <Button variant="secondary" onClick={exportCSV}>
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <form
        className="card mb-8 flex flex-wrap items-end gap-4 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
      >
        <Select
          id="report-course"
          name="course_id"
          label="Course"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="min-w-52"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </Select>

        <Select
          id="report-status"
          name="status"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-w-44"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In progress</option>
          <option value="not_started">Not started</option>
        </Select>

        <Button type="submit" variant="secondary" loading={loading}>
          Apply filters
        </Button>
      </form>

      {rows.length === 0 && !loading && (
        <EmptyState
          title="No reports found"
          description="No data matches the selected filters."
        />
      )}

      {rows.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Compliance report: enrolment progress and certificate status
            </caption>
            <thead className="bg-structural">
              <tr>
                {['Learner', 'Email', 'Course', 'Progress', 'Lessons', 'Certificate'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left text-xs font-semibold text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-structural">
                  <td className="px-4 py-3 font-medium text-ink">{r.learner_name}</td>
                  <td className="px-4 py-3 text-body">{r.learner_email}</td>
                  <td className="px-4 py-3 text-ink">{r.course_title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-1.5 w-20 overflow-hidden rounded-[var(--radius-pill)] bg-structural"
                        role="progressbar"
                        aria-valuenow={r.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${r.learner_name} progress`}
                      >
                        <div
                          className="h-full rounded-[var(--radius-pill)] bg-accent"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                      <span data-numeric className="text-xs text-body">{r.progress}%</span>
                    </div>
                  </td>
                  <td data-numeric className="px-4 py-3 text-xs text-body">
                    {r.completed_lessons} / {r.total_lessons}
                  </td>
                  <td className="px-4 py-3">
                    {r.certificate_issued ? (
                      <span className="badge border-accent-200 bg-accent-soft text-accent-on-soft">
                        Issued
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Not issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
