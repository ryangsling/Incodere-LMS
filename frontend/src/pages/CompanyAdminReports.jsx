import { useState, useEffect } from 'react'
import { api } from '../utils/api'

import { Skeleton, SkeletonList } from '../components/ui/Skeleton'

import EmptyState from '../components/ui/EmptyState'

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
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="display-title !text-2xl text-typography">Compliance Report</h2>
        {rows.length > 0 && (
          <button
            onClick={exportCSV}
            className="bg-accent text-canvas px-4 py-2 rounded text-sm hover:bg-accent-soft transition-colors duration-300 ease-[var(--ease-expo)]"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-canvas border border-border-hairline rounded p-4 mb-8 flex flex-wrap gap-4 items-end bento-card">
        <div>
          <label className="block text-xs text-typography opacity-80 mb-1 font-medium">Course</label>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-border-hairline bg-canvas rounded text-sm text-typography min-w-[200px] focus:outline-none focus-visible:border-accent"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-typography opacity-80 mb-1 font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border-hairline bg-canvas rounded text-sm text-typography min-w-[150px] focus:outline-none focus-visible:border-accent"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
        <button
          onClick={applyFilters}
          className="bg-structural border border-border-hairline text-typography px-4 py-2 rounded text-sm hover:border-accent transition-colors duration-300 ease-[var(--ease-expo)]"
        >
          Filter
        </button>
      </div>

      {rows.length === 0 && !loading && (
        <EmptyState
          title="No reports found"
          description="No data matches the selected filters."
        />
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto border border-border-hairline rounded bento-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural border-b border-border-hairline text-left">
                <th className="px-4 py-3 font-medium text-typography">Learner</th>
                <th className="px-4 py-3 font-medium text-typography">Email</th>
                <th className="px-4 py-3 font-medium text-typography">Course</th>
                <th className="px-4 py-3 font-medium text-typography">Progress</th>
                <th className="px-4 py-3 font-medium text-typography">Lessons</th>
                <th className="px-4 py-3 font-medium text-typography">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border-hairline last:border-0 hover:bg-structural transition-colors duration-300 ease-[var(--ease-expo)]">
                  <td className="px-4 py-3 text-typography font-medium">{r.learner_name}</td>
                  <td className="px-4 py-3 text-typography opacity-70">{r.learner_email}</td>
                  <td className="px-4 py-3 text-typography">{r.course_title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-border-hairline rounded-full h-2 overflow-hidden">
                        <div className="bg-accent h-full rounded-full" style={{ width: `${r.progress}%` }} />
                      </div>
                      <span className="text-xs text-typography opacity-80">{r.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-typography opacity-70">{r.completed_lessons} / {r.total_lessons}</td>
                  <td className="px-4 py-3">
                    {r.certificate_issued ? (
                      <span className="text-accent font-medium text-xs bg-accent/10 px-2 py-1 rounded">Issued</span>
                    ) : (
                      <span className="text-typography opacity-50 text-xs">--</span>
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
