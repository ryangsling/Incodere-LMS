import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Proximity } from 'z-proximity-engine'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

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
  const [isFinePointer, setIsFinePointer] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    const handler = (e) => setIsFinePointer(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        api.enrolments.getEnrolledCourse(courseId),
        api.progress.getCourseProgress(courseId),
      ])
      setCourse(courseData)

      const progressMap = {}
      progressData.forEach(p => { progressMap[p.lesson_id] = p })
      setProgress(progressMap)

      if (!courseData.sections?.length) return

      const allLessons = courseData.sections.flatMap(s => s.lessons || [])
      if (allLessons.length > 0) {
        const firstIncomplete = allLessons.find(l => !progressMap[l.id]?.completed)
        setActiveLesson(firstIncomplete || allLessons[0])
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
      const myCert = certs.rows?.find(c => c.course_id === courseId)
      if (myCert && myCert.id) {
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

  function allLessons() {
    if (!course?.sections) return []
    return course.sections.flatMap(s => s.lessons || [])
  }

  function nextLesson() {
    const lessons = allLessons()
    const idx = lessons.findIndex(l => l.id === activeLesson?.id)
    return idx < lessons.length - 1 ? lessons[idx + 1] : null
  }

  function prevLesson() {
    const lessons = allLessons()
    const idx = lessons.findIndex(l => l.id === activeLesson?.id)
    return idx > 0 ? lessons[idx - 1] : null
  }

  const totalLessons = allLessons().length
  const completedCount = allLessons().filter(l => progress[l.id]?.completed).length
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-structural flex items-center justify-center">
        <span className="font-display text-xl font-bold tracking-tight text-typography opacity-40 animate-pulse">
          Loading module...
        </span>
      </div>
    )
  }

  if (error) {
    const isCertError = error === 'Certificate already exists'

    return (
      <div className="min-h-screen bg-structural flex items-center justify-center p-6">
        <div className={`bento-card rounded-2xl p-8 max-w-md w-full ${isCertError ? 'border-accent' : 'border-red-200'}`}>
           <h3 className={`font-display text-xl font-bold mb-2 ${isCertError ? 'text-accent' : 'text-red-600'}`}>
             {isCertError ? 'Certificate Ready' : 'Error Loading Course'}
           </h3>
           <p className="body-copy opacity-70 text-typography">
             {isCertError ? 'You have already completed this course and your certificate is ready.' : error}
           </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => navigate('/dashboard/certificates')} className="px-4 py-2 bg-typography text-canvas rounded-lg text-sm font-bold">
                View Certificates
              </button>
              {isCertError && (
                <button onClick={handleDownloadExistingCertificate} disabled={isDownloading} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-bold hover:opacity-90 flex items-center justify-center disabled:opacity-50">
                  {isDownloading ? 'Downloading...' : 'Download Certificate'}
                </button>
              )}
           </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-structural flex items-center justify-center">
        <p className="font-display text-xl font-bold tracking-tight text-typography opacity-40">Course not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-structural flex flex-col font-sans">
      {/* Structural Header */}
      <header className="bg-canvas border-b border-border-hairline px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full border border-border-hairline flex items-center justify-center hover:bg-structural transition-colors"
            aria-label="Back to dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="hidden sm:block h-6 w-[1px] bg-border-hairline"></div>
          <motion.h1
            layoutId={`course-title-${courseId}`}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-lg font-bold tracking-tight text-typography truncate max-w-[200px] sm:max-w-md"
          >
            {course.title}
          </motion.h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Progress</span>
            <span className="text-sm font-bold">{pct}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-sm font-bold px-4 py-2 bg-structural border border-border-hairline rounded-lg"
          >
            {sidebarOpen ? 'Close Syllabus' : 'Syllabus'}
          </button>
          <div className="hidden sm:block h-6 w-[1px] bg-border-hairline"></div>
          <button onClick={logout} className="hidden sm:block text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* Main Content Area (8 cols) */}
        <div className="flex-1 lg:w-2/3 flex flex-col min-w-0">
          {activeLesson ? (
            <div className="flex flex-col h-full gap-6">
              {/* Content Bento */}
              <div className="bento-card rounded-3xl overflow-hidden flex flex-col bg-canvas border border-border-hairline relative">

                {/* Lesson Header */}
                <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-border-hairline flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                     <div className="inline-flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-structural border border-border-hairline rounded text-[10px] font-bold uppercase tracking-widest text-typography opacity-70">
                          {activeLesson.type}
                        </span>
                     </div>
                     <h2 className="display-title !text-3xl sm:!text-4xl">{activeLesson.title}</h2>
                  </div>
                  {progress[activeLesson.id]?.completed && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                    </div>
                  )}
                </div>

                {/* Lesson Body */}
                <div className="flex-1 p-6 sm:p-10">
                  {activeLesson.type === 'video' && activeLesson.video_url ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-border-hairline bg-structural">
                      <iframe
                        src={activeLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                      />
                    </div>
                  ) : activeLesson.type === 'text' && activeLesson.content ? (
                    <div className="prose prose-lg max-w-none prose-headings:font-display prose-p:body-copy text-typography opacity-90">
                      {activeLesson.content.split('\\\
').map((paragraph, i) => (
                        <p key={i} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20 text-typography opacity-40 font-medium">
                      No content available for this lesson.
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Bento */}
              <div className="bento-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-canvas border border-border-hairline">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => prevLesson() && setActiveLesson(prevLesson())}
                    disabled={!prevLesson()}
                    className="flex-1 sm:flex-none px-6 py-3 bg-structural border border-border-hairline text-typography text-sm font-bold rounded-xl hover:bg-border-hairline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => nextLesson() && setActiveLesson(nextLesson())}
                    disabled={!nextLesson()}
                    className="flex-1 sm:flex-none px-6 py-3 bg-structural border border-border-hairline text-typography text-sm font-bold rounded-xl hover:bg-border-hairline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <div className="w-full sm:w-auto">
                  {!progress[activeLesson.id]?.completed ? (
                    (() => {
                      const cta = (
                        <button
                          onClick={handleMarkComplete}
                          className="w-full sm:w-auto px-8 py-3 bg-typography text-canvas text-sm font-bold tracking-wide rounded-xl hover:bg-accent transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          Mark as Complete
                        </button>
                      )
                      return isFinePointer ? (
                        <Proximity magnetic={0.2} tilt={0.1} distance={50}>
                          {cta}
                        </Proximity>
                      ) : cta
                    })()
                  ) : (
                    totalLessons > 0 && pct === 100 ? (
                      (() => {
                        const cta = (
                          <button
                            onClick={handleGetCertificate}
                            className="w-full sm:w-auto px-8 py-3 bg-accent text-canvas text-sm font-bold tracking-wide rounded-xl hover:opacity-90 transition-opacity"
                          >
                            Claim Certificate
                          </button>
                        )
                        return isFinePointer ? (
                          <Proximity magnetic={0.2} tilt={0.1} distance={50}>
                            {cta}
                          </Proximity>
                        ) : cta
                      })()
                    ) : (
                      (() => {
                        const cta = (
                          <button
                            onClick={() => nextLesson() && setActiveLesson(nextLesson())}
                            className="w-full sm:w-auto px-8 py-3 bg-typography text-canvas text-sm font-bold tracking-wide rounded-xl hover:bg-accent transition-colors duration-300"
                          >
                            Continue to Next
                          </button>
                        )
                        return isFinePointer ? (
                          <Proximity magnetic={0.2} tilt={0.1} distance={50}>
                            {cta}
                          </Proximity>
                        ) : cta
                      })()
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="bento-card rounded-3xl p-12 min-h-[400px] flex items-center justify-center text-center">
                <h3 className="font-display text-2xl font-bold mb-3">No lessons found</h3>
                <p className="body-copy opacity-60">This course currently has no published lessons.</p>
             </div>
          )}
        </div>

        {/* Sidebar / Syllabus Area (4 cols) */}
        <div className={`
          lg:w-1/3 lg:block flex-shrink-0
          ${sidebarOpen ? 'fixed inset-0 z-40 bg-canvas lg:static p-4 overflow-y-auto' : 'hidden'}
        `}>
          {sidebarOpen && (
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-6 right-6 p-2 bg-structural rounded-full border border-border-hairline">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M18 6L6 18M6 6l12 12"/>
               </svg>
             </button>
          )}

          <div className="bento-card rounded-3xl bg-canvas border border-border-hairline p-6 lg:p-8 sticky top-28 lg:max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">

            {/* Overall Progress */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-bold mb-4 tracking-tight">Syllabus</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Course Progress</span>
                <span className="text-lg font-bold">{pct}%</span>
              </div>
              <div className="w-full bg-structural h-2 rounded-full overflow-hidden border border-border-hairline">
                <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, transitionTimingFunction: 'var(--ease-expo)' }} />
              </div>
            </div>

            {/* Sections & Lessons Map */}
            <div className="space-y-6">
              {course.sections?.map((section, sIdx) => (
                <div key={section.id}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-typography opacity-50 mb-3 ml-1 flex items-center gap-2">
                    <span>Part {sIdx + 1}</span>
                    <span className="w-1 h-1 rounded-full bg-typography opacity-30"></span>
                    <span>{section.title}</span>
                  </h4>
                  <div className="space-y-2">
                    {section.lessons?.map((lesson, lIdx) => {
                      const isCompleted = progress[lesson.id]?.completed
                      const isActive = activeLesson?.id === lesson.id

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          className={`
                            w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-300
                            ${isActive ? 'bg-structural border-border-hairline' : 'border-transparent hover:bg-structural hover:border-border-hairline'}
                          `}
                        >
                          <div className={`
                            mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border
                            ${isCompleted ? 'bg-typography border-typography text-canvas' : 'bg-canvas border-border-hairline text-typography opacity-30'}
                          `}>
                            {isCompleted ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            ) : (
                              <span className="text-[10px] font-bold">{lIdx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className={`text-sm font-bold tracking-tight truncate ${isActive ? 'text-typography' : 'opacity-80'}`}>
                              {lesson.title}
                            </h5>
                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-40 mt-1 block">
                              {lesson.type}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
