import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CheckIcon,
  ListBulletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import Button from '../components/ui/Button'

export default function LearnerCoursePlayer() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState({})
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        api.enrolments.getEnrolledCourse(courseId),
        api.progress.getCourseProgress(courseId),
      ])
      setCourse(courseData)

      const progressMap = {}
      progressData.forEach((p) => { progressMap[p.lesson_id] = p })
      setProgress(progressMap)

      if (!courseData.sections?.length) return

      const all = courseData.sections.flatMap((s) => s.lessons || [])
      if (all.length > 0) {
        setActiveLesson(all.find((l) => !progressMap[l.id]?.completed) || all[0])
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData() }, [loadData])

  async function handleMarkComplete() {
    if (!activeLesson) return
    try {
      await api.progress.markComplete({ lesson_id: activeLesson.id })
      loadData()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleGetCertificate() {
    try {
      await api.certificates.generate({ course_id: courseId })
      navigate('/dashboard/certificates')
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDownloadExistingCertificate() {
    setIsDownloading(true)
    try {
      const certs = await api.certificates.mine()
      const myCert = certs.rows?.find((c) => c.course_id === courseId)
      if (myCert?.id) {
        await api.certificates.download(myCert.id)
      } else {
        setError('Could not locate your certificate file.')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setIsDownloading(false)
    }
  }

  const lessons = course?.sections?.flatMap((s) => s.lessons || []) ?? []
  const activeIdx = lessons.findIndex((l) => l.id === activeLesson?.id)
  const prev = activeIdx > 0 ? lessons[activeIdx - 1] : null
  const next = activeIdx >= 0 && activeIdx < lessons.length - 1 ? lessons[activeIdx + 1] : null

  const totalLessons = lessons.length
  const completedCount = lessons.filter((l) => progress[l.id]?.completed).length
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  function goTo(lesson) {
    setActiveLesson(lesson)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="w-full max-w-md space-y-4 px-6" aria-busy="true" aria-live="polite">
          <div className="h-8 w-2/3 animate-pulse rounded bg-structural" />
          <div className="h-64 animate-pulse rounded-[var(--radius-surface)] bg-structural" />
          <span className="sr-only">Loading lesson</span>
        </div>
      </div>
    )
  }

  if (error) {
    const isCertError = error === 'Certificate already exists'
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
        <div className="card w-full max-w-md p-8">
          <h1 className="mb-2 text-xl">
            {isCertError ? 'Your certificate is ready' : 'Could not load this course'}
          </h1>
          <p className="text-sm text-body">
            {isCertError
              ? 'You have already completed this course, so your certificate has been issued.'
              : error}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant={isCertError ? 'secondary' : 'primary'}
              onClick={() => navigate('/dashboard/certificates')}
            >
              View certificates
            </Button>
            {isCertError && (
              <Button onClick={handleDownloadExistingCertificate} loading={isDownloading}>
                Download certificate
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="text-body">Course not found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-canvas/90 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border text-ink transition-colors hover:bg-structural"
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
          </button>
          <p className="truncate text-sm font-medium text-ink sm:text-base">{course.title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <p className="hidden text-sm text-muted sm:block">
            <span data-numeric className="font-medium text-ink">{pct}%</span> complete
          </p>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-structural lg:hidden"
          >
            <ListBulletIcon className="size-4" aria-hidden="true" />
            Syllabus
          </button>
          <button
            onClick={logout}
            className="hidden text-sm text-muted transition-colors hover:text-ink sm:block"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {activeLesson ? (
            <>
              <article className="card overflow-hidden">
                <div className="flex flex-col justify-between gap-4 border-b border-border px-6 py-6 sm:flex-row sm:items-start sm:px-8">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted">
                      {activeLesson.type === 'video' ? 'Video lesson' : 'Reading'}
                    </p>
                    <h1 className="text-2xl sm:text-3xl">{activeLesson.title}</h1>
                  </div>
                  {progress[activeLesson.id]?.completed && (
                    <p className="badge shrink-0 border-accent-200 bg-accent-soft text-accent-on-soft">
                      <CheckIcon className="size-3.5" aria-hidden="true" />
                      Completed
                    </p>
                  )}
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  {activeLesson.type === 'video' && activeLesson.video_url ? (
                    <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-control)] border border-border bg-structural">
                      <iframe
                        src={activeLesson.video_url
                          .replace('watch?v=', 'embed/')
                          .replace('youtu.be/', 'www.youtube.com/embed/')}
                        title={`Video lesson: ${activeLesson.title}`}
                        className="size-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                      />
                    </div>
                  ) : activeLesson.type === 'text' && activeLesson.content ? (
                    <div className="max-w-[68ch] space-y-4 text-body leading-relaxed">
                      {/* Split on real newlines. This previously split on an
                          escaped backslash-newline sequence, so multi-paragraph
                          lessons rendered as one unbroken block. */}
                      {activeLesson.content
                        .split(/\n{2,}|\n/)
                        .filter((p) => p.trim())
                        .map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                  ) : (
                    <p className="py-16 text-center text-muted">
                      This lesson has no content yet.
                    </p>
                  )}
                </div>
              </article>

              <div className="card flex flex-col items-stretch gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                {/* Only render pager buttons that can actually act. A single
                    lesson previously produced two permanently disabled
                    controls sitting in the primary action row. */}
                <div className="flex items-center gap-2">
                  {prev && (
                    <Button variant="secondary" onClick={() => goTo(prev)}>
                      Previous
                    </Button>
                  )}
                  {next && (
                    <Button variant="secondary" onClick={() => goTo(next)}>
                      Next
                    </Button>
                  )}
                  {totalLessons > 1 && (
                    <p className="ml-1 text-sm text-muted">
                      <span data-numeric>{activeIdx + 1}</span> of{' '}
                      <span data-numeric>{totalLessons}</span>
                    </p>
                  )}
                </div>

                <div className="sm:shrink-0">
                  {!progress[activeLesson.id]?.completed ? (
                    <Button fullWidth onClick={handleMarkComplete} className="sm:w-auto">
                      Mark as complete
                    </Button>
                  ) : pct === 100 ? (
                    <Button fullWidth onClick={handleGetCertificate} className="sm:w-auto">
                      Claim certificate
                    </Button>
                  ) : next ? (
                    <Button fullWidth onClick={() => goTo(next)} className="sm:w-auto">
                      Continue
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex min-h-80 flex-col items-center justify-center p-12 text-center">
              <h1 className="mb-2 text-xl">No lessons yet</h1>
              <p className="text-sm text-muted">
                This course has no published lessons. Your administrator will add them.
              </p>
            </div>
          )}
        </div>

        {/* Syllabus */}
        <div
          className={
            sidebarOpen
              ? 'fixed inset-0 z-40 overflow-y-auto bg-canvas p-4 lg:static lg:z-auto lg:w-80 lg:shrink-0 lg:overflow-visible lg:p-0'
              : 'hidden lg:block lg:w-80 lg:shrink-0'
          }
        >
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-[var(--radius-control)] border border-border text-ink lg:hidden"
              aria-label="Close syllabus"
            >
              <XMarkIcon className="size-5" aria-hidden="true" />
            </button>
          )}

          <nav
            aria-label="Syllabus"
            className="card sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto p-6"
          >
            <h2 className="mb-4 text-lg">Syllabus</h2>

            <div className="mb-6">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-muted">Course progress</span>
                <span data-numeric className="text-sm font-semibold text-ink">{pct}%</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-structural"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Course progress"
              >
                <div
                  className="h-full rounded-[var(--radius-pill)] bg-accent transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="space-y-5">
              {course.sections?.map((section, sIdx) => (
                <div key={section.id}>
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    {section.title || `Part ${sIdx + 1}`}
                  </h3>
                  <ul className="space-y-1">
                    {section.lessons?.map((lesson, lIdx) => {
                      const isCompleted = progress[lesson.id]?.completed
                      const isActive = activeLesson?.id === lesson.id
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => goTo(lesson)}
                            aria-current={isActive ? 'true' : undefined}
                            className={[
                              'flex w-full items-start gap-3 rounded-[var(--radius-control)] p-2.5 text-left transition-colors',
                              isActive ? 'bg-structural' : 'hover:bg-structural',
                            ].join(' ')}
                          >
                            <span
                              aria-hidden="true"
                              className={[
                                'mt-px flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border text-[11px] font-semibold',
                                isCompleted
                                  ? 'border-accent bg-accent text-white'
                                  : 'border-border-strong text-muted',
                              ].join(' ')}
                            >
                              {isCompleted ? <CheckIcon className="size-3" /> : lIdx + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={[
                                  'block truncate text-sm',
                                  isActive ? 'font-medium text-ink' : 'text-body',
                                ].join(' ')}
                              >
                                {lesson.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted">
                                {lesson.type === 'video' ? 'Video' : 'Reading'}
                                {isCompleted && ' · Completed'}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </main>
    </div>
  )
}
