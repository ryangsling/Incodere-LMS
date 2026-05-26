import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

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
    if (tab === 'courses') {
      api.enrolments.myEnrolments()
        .then(setEnrolments)
        .catch(e => setTabError(e.message))
        .finally(() => setLoading(false))
    } else {
      api.certificates.mine()
        .then(setCertificates)
        .catch(e => setTabError(e.message))
        .finally(() => setLoading(false))
    }
  }, [tab])

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="bg-[#01696f] text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold text-base sm:text-lg">ILMS</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{user?.first_name} {user?.last_name}</span>
          <button onClick={logout} className="text-xs sm:text-sm bg-white text-[#01696f] px-2 sm:px-3 py-1 rounded hover:bg-gray-100">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:p-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setTab('courses'); setLoading(true) }}
            className={`pb-2 text-sm font-medium ${tab === 'courses' ? 'text-[#01696f] border-b-2 border-[#01696f]' : 'text-[#888888]'}`}
          >
            My Courses
          </button>
          <button
            onClick={() => { setTab('certificates'); setLoading(true) }}
            className={`pb-2 text-sm font-medium ${tab === 'certificates' ? 'text-[#01696f] border-b-2 border-[#01696f]' : 'text-[#888888]'}`}
          >
            My Certificates
          </button>
        </div>

        {loading && <p className="text-[#888888]">Loading...</p>}
        {tabError && <p className="text-red-600 text-sm mb-4">{tabError}</p>}

        {!loading && tab === 'courses' && (
          <>
            {enrolments.length === 0 && (
              <p className="text-[#888888] text-sm">No courses enrolled yet.</p>
            )}
            <div className="grid gap-3 sm:gap-4">
              {enrolments.map(enr => (
                <button
                  key={enr.id}
                  onClick={() => navigate(`/dashboard/courses/${enr.course_id}`)}
                  className="bg-white rounded shadow-sm p-3 sm:p-4 text-left w-full hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#032147]">{enr.course?.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${enr.progress === 100 ? 'bg-[#437a22] text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {enr.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#01696f] h-2 rounded-full transition-all" style={{ width: `${enr.progress}%` }} />
                  </div>
                  <p className="text-xs text-[#888888] mt-1">{enr.completed_lessons} / {enr.total_lessons} lessons</p>
                </button>
              ))}
            </div>
          </>
        )}

        {!loading && tab === 'certificates' && (
          <>
            {certificates.length === 0 && (
              <p className="text-[#888888] text-sm">No certificates yet. Complete a course to earn one.</p>
            )}
            <div className="grid gap-3 sm:gap-4">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded shadow-sm p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[#032147]">{cert.course?.title}</h3>
                    <p className="text-xs text-[#888888]">Issued {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ''}</p>
                  </div>
                  <a
                    href={cert.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#01696f] text-white px-3 py-1.5 rounded text-sm hover:bg-[#015a5f]"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
