import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import CourseCard from '../components/CourseCard'
import { Skeleton, SkeletonGrid } from '../components/ui/Skeleton'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [upcomingModules, setUpcomingModules] = useState([])

  useEffect(() => {
    api.enrolments.myEnrolments()
      .then(async (rows) => {
        const enrolmentsData = Array.isArray(rows) ? rows : rows.rows || []
        setEnrolments(enrolmentsData)

        const active = enrolmentsData.find(e => e.progress > 0 && e.progress < 100) || enrolmentsData[0]
        
        if (active?.course_id) {
          try {
            const courseData = await api.enrolments.getEnrolledCourse(active.course_id)
            const progressData = await api.progress.getCourseProgress(active.course_id)
            
            const progressMap = {}
            progressData.forEach(p => { progressMap[p.lesson_id] = p })

            const allLessons = courseData.sections?.flatMap(s => s.lessons || []) || []
            const incomplete = allLessons.filter(l => !progressMap[l.id]?.completed)
            
            setUpcomingModules(incomplete.slice(0, 3))
          } catch (e) {
            console.error("Failed to load upcoming modules", e)
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const activeCourse = enrolments.find(e => e.progress > 0 && e.progress < 100) || enrolments[0]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-hairline)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-deep-ink)' }}
          >
            ILMS
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span
            className="text-sm font-medium hidden sm:block"
            style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-stone)' }}
          >
            {user?.first_name} {user?.last_name}
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--color-stone)' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-stone)'}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Welcome */}
        <div className="mb-12">
          <h1
            className="text-3xl sm:text-4xl mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)', fontWeight: 400 }}
          >
            Welcome back, {user?.first_name || 'Learner'}.
          </h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--color-stone)' }}>
            Pick up where you left off or explore your assigned courses.
          </p>
        </div>

        {error && (
          <div
            className="mb-8 p-4 rounded-lg text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        {/* Active Course Hero */}
        {loading ? (
          <div className="mb-16">
            <Skeleton variant="block" className="h-[320px] rounded-2xl" />
          </div>
        ) : activeCourse ? (
          <div
            className="mb-16 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start"
            style={{ backgroundColor: 'var(--color-deep-ink)' }}
          >
            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                Continue Learning
              </div>
              <h2
                className="text-3xl sm:text-4xl mb-3 leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 400 }}
              >
                {activeCourse.course?.title || 'Untitled Course'}
              </h2>
              <p className="text-sm mb-6 max-w-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {activeCourse.course?.description || 'Your next module is ready.'}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Progress
                  </span>
                  <span className="text-2xl font-semibold" style={{ color: 'white', fontFamily: 'var(--font-sans)' }}>
                    {activeCourse.progress || 0}%
                  </span>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Modules
                  </span>
                  <span className="text-lg font-semibold" style={{ color: 'white', fontFamily: 'var(--font-sans)' }}>
                    {activeCourse.completed_lessons || 0}/{activeCourse.total_lessons || 0}
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${activeCourse.progress || 0}%`, backgroundColor: 'var(--color-accent)' }}
                />
              </div>

              <button
                onClick={() => navigate(`/dashboard/courses/${activeCourse?.course_id}`)}
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  boxShadow: '0 1px 3px rgba(13, 148, 136, 0.3)',
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'var(--color-primary-indigo-hover)'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'var(--color-accent)'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                Resume Learning
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mb-16 rounded-2xl p-8 sm:p-12 text-center"
            style={{ backgroundColor: 'var(--color-pure-white)', border: '1px solid var(--color-border-hairline)' }}
          >
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)' }}
            >
              No Active Courses
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-stone)' }}>
              Your company admin hasn't assigned you any courses yet.
            </p>
          </div>
        )}

        {/* Upcoming Modules */}
        {upcomingModules.length > 0 && (
          <div className="mb-16">
            <h3
              className="text-xl mb-5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)' }}
            >
              Up Next
            </h3>
            <div className="space-y-2">
              {upcomingModules.map((module, idx) => (
                <div
                  key={module.id}
                  onClick={() => navigate(`/dashboard/courses/${activeCourse?.course_id}`)}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: 'var(--color-pure-white)', border: '1px solid var(--color-border-hairline)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.3)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border-hairline)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                    style={{ backgroundColor: 'var(--color-structural)', color: 'var(--color-stone)' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm font-medium truncate"
                      style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-deep-ink)' }}
                    >
                      {module.title}
                    </h4>
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-stone)' }}>
                      {module.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Library */}
        <div>
          <h3
            className="text-xl mb-5"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-deep-ink)' }}
          >
            Your Courses
          </h3>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : enrolments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolments.map(enrolment => (
                <CourseCard
                  key={enrolment.id || enrolment.course_id}
                  course={enrolment.course}
                  progress={enrolment.progress}
                  completedLessons={enrolment.completed_lessons}
                  totalLessons={enrolment.total_lessons}
                  onContinue={() => navigate(`/dashboard/courses/${enrolment.course_id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 text-center text-sm"
              style={{ backgroundColor: 'var(--color-pure-white)', border: '1px solid var(--color-border-hairline)', color: 'var(--color-stone)' }}
            >
              No courses found in your library.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
