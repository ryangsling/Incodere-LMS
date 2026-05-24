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

  const loadData = useCallback(async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        api.progress.getEnrolledCourse(courseId),
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
    await api.progress.markComplete({ lesson_id: activeLesson.id })
    loadData()
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
      <header className="bg-[#01696f] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm hover:underline">&larr; Back</button>
          <h1 className="font-bold text-sm">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs">{completedCount}/{totalLessons}</span>
          <span className="text-sm">{user?.first_name}</span>
          <button onClick={logout} className="text-sm bg-white text-[#01696f] px-2 py-0.5 rounded">Sign Out</button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
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
                      onClick={() => setActiveLesson(lesson)}
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

        <main className="flex-1 p-6 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold text-[#032147] mb-4">{activeLesson.title}</h2>

              {activeLesson.type === 'video' && activeLesson.video_url && (
                <div className="aspect-video mb-6">
                  <iframe
                    src={activeLesson.video_url.replace('watch?v=', 'embed/')}
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
        </main>
      </div>
    </div>
  )
}
