import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function LearnerCoursePlayer() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState({})
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
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

  if (loading) return <p className="text-[#888888] p-6">Loading course...</p>
  if (error) return <p className="text-red-600 p-6">{error}</p>
  if (!course) return <p className="text-[#888888] p-6">Course not found</p>

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col">
      <header className="bg-[#01696f] text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm hover:underline">&larr; Back</button>
          <h1 className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{course.title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sm:hidden text-sm px-2 py-1 bg-white/20 rounded">
            {sidebarOpen ? 'Close' : 'Menu'}
          </button>
          <span className="text-xs hidden sm:inline">{completedCount}/{totalLessons}</span>
          <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{user?.first_name}</span>
          <button onClick={logout} className="text-xs sm:text-sm bg-white text-[#01696f] px-2 py-0.5 rounded">Sign Out</button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 absolute sm:relative z-10 sm:z-auto min-h-full shadow-lg sm:shadow-none`}>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#01696f] h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-[#888888] mt-1">{pct}% complete</p>
          </div>

          {course.sections?.map(section => (
            <div key={section.id} className="mb-4">
              <h3 className="text-xs font-bold text-[#032147] uppercase mb-2">{section.title}</h3>
              <div className="space-y-1">
                {section.lessons?.map(lesson => {
                  const done = progress[lesson.id]?.completed
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => { setActiveLesson(lesson); setSidebarOpen(false) }}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${
                        activeLesson?.id === lesson.id
                          ? 'bg-[#01696f] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">{done ? '✓' : lesson.type === 'video' ? '▶' : '📄'}</span>
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-[#032147] mb-4">{activeLesson.title}</h2>

              {activeLesson.type === 'video' && activeLesson.video_url && (
                <div className="aspect-video mb-6">
                  <iframe
                    src={activeLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    className="w-full h-full rounded"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
              )}

              {activeLesson.type === 'text' && activeLesson.content && (
                <div className="bg-white rounded shadow-sm p-6 mb-6 whitespace-pre-wrap text-sm">
                  {activeLesson.content}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {prevLesson() && (
                    <button
                      onClick={() => setActiveLesson(prevLesson())}
                      className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      &larr; Previous
                    </button>
                  )}
                  {nextLesson() && (
                    <button
                      onClick={() => setActiveLesson(nextLesson())}
                      className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Next &rarr;
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {!progress[activeLesson.id]?.completed && (
                    <button
                      onClick={handleMarkComplete}
                      className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
                    >
                      Mark as Complete
                    </button>
                  )}
                  {progress[activeLesson.id]?.completed && (
                    <span className="text-[#437a22] text-sm flex items-center gap-1">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[#888888] text-center mt-20">No lessons in this course.</p>
          )}

          {totalLessons > 0 && pct === 100 && (
            <div className="max-w-3xl mx-auto mt-6 text-center">
              <button
                onClick={handleGetCertificate}
                className="bg-[#437a22] text-white px-6 py-3 rounded text-sm hover:bg-[#3a6b1d] font-medium"
              >
                Get Certificate
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
