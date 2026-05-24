import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function CompanyAdminEnrolments() {
  const { user } = useAuth()
  const [enrolments, setEnrolments] = useState([])
  const [learners, setLearners] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ learner_ids: [], course_id: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [enrolData, learnerData, courseData] = await Promise.all([
        api.enrolments.list(),
        api.organisations.listUsers(user.organisation_id),
        api.courses.list(),
      ])
      setEnrolments(enrolData)
      setLearners(learnerData.filter(u => u.role === 'learner' && u.is_active))
      setCourses(courseData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEnrol(e) {
    e.preventDefault()
    if (form.learner_ids.length === 0 || !form.course_id) return
    setSubmitting(true)
    try {
      await api.enrolments.create({ learner_ids: form.learner_ids, course_id: form.course_id })
      setForm({ learner_ids: [], course_id: '' })
      setShowForm(false)
      loadAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnenrol(id) {
    if (!confirm('Remove this enrolment?')) return
    try {
      await api.enrolments.delete(id)
      loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  function toggleLearner(id) {
    setForm(prev => ({
      ...prev,
      learner_ids: prev.learner_ids.includes(id)
        ? prev.learner_ids.filter(l => l !== id)
        : [...prev.learner_ids, id],
    }))
  }

  if (loading) return <p className="text-[#888888]">Loading enrolments...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#032147]">Enrolments</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
        >
          {showForm ? 'Cancel' : 'Enrol Learners'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleEnrol} className="bg-white rounded shadow-sm p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm text-[#888888] mb-2">Select Learners</label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {learners.map(l => (
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
            <label className="block text-sm text-[#888888] mb-1">Select Course</label>
            <select
              value={form.course_id}
              onChange={e => setForm({ ...form, course_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">-- Choose a course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting || form.learner_ids.length === 0 || !form.course_id}
            className="bg-[#01696f] text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {submitting ? 'Enrolling...' : `Enrol ${form.learner_ids.length} Learner(s)`}
          </button>
        </form>
      )}

      {enrolments.length === 0 && !showForm && (
        <p className="text-[#888888] text-sm">No enrolments yet.</p>
      )}

      <div className="grid gap-3">
        {enrolments.map(enr => (
          <div key={enr.id} className="bg-white rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#032147]">{enr.learner?.first_name} {enr.learner?.last_name}</p>
              <p className="text-xs text-[#888888]">{enr.course?.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${enr.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-[#437a22] text-white'}`}>
                {enr.status}
              </span>
              <button
                onClick={() => handleUnenrol(enr.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
