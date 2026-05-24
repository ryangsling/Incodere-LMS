import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.enrolments.myEnrolments()
      .then(setEnrolments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="bg-[#01696f] text-white px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg">ILMS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.first_name} {user?.last_name}</span>
          <button onClick={logout} className="text-sm bg-white text-[#01696f] px-3 py-1 rounded hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold text-[#032147] mb-6">My Courses</h2>

        {loading && <p className="text-[#888888]">Loading...</p>}

        {!loading && enrolments.length === 0 && (
          <p className="text-[#888888] text-sm">No courses enrolled yet.</p>
        )}

        <div className="grid gap-4">
          {enrolments.map(enr => (
            <button
              key={enr.id}
              onClick={() => navigate(`/dashboard/courses/${enr.course_id}`)}
              className="bg-white rounded shadow-sm p-4 text-left w-full hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-[#032147]">{enr.course?.title}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${enr.progress === 100 ? 'bg-[#437a22] text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {enr.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#01696f] h-2 rounded-full transition-all"
                  style={{ width: `${enr.progress}%` }}
                />
              </div>
              <p className="text-xs text-[#888888] mt-1">{enr.completed_lessons} / {enr.total_lessons} lessons</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
