import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import CourseCard from '../components/CourseCard'
import { SkeletonGrid } from '../components/ui/Skeleton'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.enrolments
      .myEnrolments()
      .then((rows) => setEnrolments(Array.isArray(rows) ? rows : rows.rows || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Only a genuinely unfinished course is "in progress". Falling back to
  // enrolments[0] made a fully-completed learner see "Continue learning" and a
  // "Resume" button on a course they had already finished.
  const inProgress = enrolments.find((e) => e.progress > 0 && e.progress < 100)
  const notStarted = enrolments.find((e) => !e.progress)
  const focus = inProgress || notStarted
  const allComplete = enrolments.length > 0 && !focus

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-mark.svg" alt="" width="28" height="28" />
            <span className="text-lg font-semibold tracking-tight text-ink">ILMS</span>
          </Link>
          <nav aria-label="Account" className="flex items-center gap-5">
            <Link
              to="/dashboard/certificates"
              className="text-sm font-medium text-body no-underline transition-colors hover:text-ink"
            >
              Certificates
            </Link>
            <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
            <span className="hidden text-sm text-muted sm:block">
              {user?.first_name} {user?.last_name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl">
            Welcome back, {user?.first_name || 'there'}.
          </h1>
          <p className="mt-3 max-w-lg text-body">
            {allComplete
              ? 'You are up to date on everything assigned to you.'
              : 'Pick up where you left off, or start something new.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-10 rounded-[var(--radius-control)] border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}

        {/* Focus panel */}
        {loading ? (
          <div className="mb-14 h-56 animate-pulse rounded-[var(--radius-surface)] bg-structural" />
        ) : focus ? (
          <section
            aria-labelledby="focus-heading"
            className="mb-14 rounded-[var(--radius-surface)] bg-panel-dark p-8 sm:p-10"
          >
            <p className="text-sm text-white/60">
              {focus.progress > 0 ? 'Continue where you left off' : 'Ready to start'}
            </p>
            <h2 id="focus-heading" className="mt-2 text-2xl text-white sm:text-3xl">
              {focus.course?.title || 'Untitled course'}
            </h2>
            {focus.course?.description && (
              <p className="mt-3 max-w-xl leading-relaxed text-white/65">
                {focus.course.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-4">
              <div>
                <p className="text-sm text-white/50">Progress</p>
                <p data-numeric className="mt-1 text-2xl font-semibold text-white">
                  {focus.progress || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/50">Lessons</p>
                <p data-numeric className="mt-1 text-2xl font-semibold text-white">
                  {focus.completed_lessons || 0}/{focus.total_lessons || 0}
                </p>
              </div>
            </div>

            <div
              className="mt-6 h-1.5 w-full max-w-xl overflow-hidden rounded-[var(--radius-pill)] bg-white/15"
              role="progressbar"
              aria-valuenow={focus.progress || 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course progress"
            >
              <div
                className="h-full rounded-[var(--radius-pill)] bg-accent-400 transition-[width] duration-500"
                style={{ width: `${focus.progress || 0}%` }}
              />
            </div>

            <button
              onClick={() => navigate(`/dashboard/courses/${focus.course_id}`)}
              className="btn mt-8 !border-transparent !bg-white !px-6 !py-3 !text-panel-dark hover:!bg-white/90"
            >
              {focus.progress > 0 ? 'Resume course' : 'Start course'}
            </button>
          </section>
        ) : allComplete ? (
          <section className="mb-14 rounded-[var(--radius-surface)] border border-accent-200 bg-accent-soft p-8 sm:p-10">
            <h2 className="text-2xl text-accent-on-soft">All courses complete</h2>
            <p className="mt-3 max-w-lg leading-relaxed text-accent-on-soft/85">
              You have finished every course assigned to you. Your certificates
              are ready to download.
            </p>
            <Link to="/dashboard/certificates" className="btn btn-primary mt-7">
              View certificates
            </Link>
          </section>
        ) : (
          <section className="card mb-14 p-10 text-center sm:p-12">
            <h2 className="text-xl">Nothing assigned yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-body">
              Your administrator has not assigned you any courses. They will
              appear here as soon as they do.
            </p>
          </section>
        )}

        {/* Library */}
        <section aria-labelledby="library-heading">
          <h2 id="library-heading" className="mb-6 text-xl">
            Your courses
          </h2>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : enrolments.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {enrolments.map((enrolment) => (
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
            <p className="card p-8 text-center text-sm text-muted">
              No courses in your library yet.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
