import { useState, useEffect } from 'react'
import { api } from '../utils/api'

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
        setRows(reportData)
        setCourses(courseData)
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
      setRows(data)
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

  if (loading && rows.length === 0) return <p className="text-[#888888]">Loading report...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#032147]">Compliance Report</h2>
        {rows.length > 0 && (
          <button
            onClick={exportCSV}
            className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow-sm p-4 mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-xs text-[#888888] mb-1">Course</label>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#888888] mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
        <button
          onClick={applyFilters}
          className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
        >
          Filter
        </button>
      </div>

      {rows.length === 0 && (
        <p className="text-[#888888] text-sm">No data matches the selected filters.</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2 font-medium text-[#032147]">Learner</th>
              <th className="px-3 py-2 font-medium text-[#032147]">Email</th>
              <th className="px-3 py-2 font-medium text-[#032147]">Course</th>
              <th className="px-3 py-2 font-medium text-[#032147]">Progress</th>
              <th className="px-3 py-2 font-medium text-[#032147]">Lessons</th>
              <th className="px-3 py-2 font-medium text-[#032147]">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-[#032147]">{r.learner_name}</td>
                <td className="px-3 py-2 text-[#888888]">{r.learner_email}</td>
                <td className="px-3 py-2 text-[#032147]">{r.course_title}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#01696f] h-2 rounded-full" style={{ width: `${r.progress}%` }} />
                    </div>
                    <span className="text-xs">{r.progress}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-[#888888]">{r.completed_lessons}/{r.total_lessons}</td>
                <td className="px-3 py-2">
                  {r.certificate_issued ? (
                    <span className="text-[#437a22] text-xs">Issued</span>
                  ) : (
                    <span className="text-[#888888] text-xs">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
