import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newLesson, setNewLesson] = useState({ sectionId: '', title: '', type: 'video', video_url: '', content: '' })

  useEffect(() => {
    loadCourse()
  }, [id])

  async function loadCourse() {
    try {
      const data = await api.courses.get(id)
      setCourse(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function addSection() {
    if (!newSectionTitle.trim()) return
    try {
      await api.courses.createSection(id, { title: newSectionTitle })
      setNewSectionTitle('')
      loadCourse()
    } catch (e) {
      setError(e.message)
    }
  }

  async function deleteSection(sectionId) {
    try {
      await api.courses.deleteSection(sectionId)
      loadCourse()
    } catch (e) {
      setError(e.message)
    }
  }

  async function addLesson() {
    if (!newLesson.title.trim()) return
    try {
      await api.courses.createLesson(newLesson.sectionId, {
        title: newLesson.title,
        type: newLesson.type,
        video_url: newLesson.video_url || null,
        content: newLesson.content || null,
      })
      setNewLesson({ sectionId: '', title: '', type: 'video', video_url: '', content: '' })
      loadCourse()
    } catch (e) {
      setError(e.message)
    }
  }

  async function deleteLesson(lessonId) {
    try {
      await api.courses.deleteLesson(lessonId)
      loadCourse()
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <p className="text-[#888888]">Loading course...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!course) return <p className="text-[#888888]">Course not found</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/super-admin/courses" className="text-sm text-[#01696f] hover:underline">&larr; Back to courses</Link>
          <h2 className="text-xl font-bold text-[#032147] mt-1">{course.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'published' ? 'bg-[#437a22] text-white' : 'bg-gray-200 text-[#888888]'}`}>
            {course.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/super-admin/courses/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={async () => {
              if (!confirm('Delete this course?')) return
              try {
                await api.courses.delete(id)
                navigate('/super-admin/courses')
              } catch (e) {
                setError(e.message)
              }
            }}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {course.description && (
        <p className="text-sm text-[#888888] mb-6">{course.description}</p>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-[#032147] mb-3">Sections</h3>

          {(!course.sections || course.sections.length === 0) && (
            <p className="text-sm text-[#888888] mb-3">No sections yet.</p>
          )}

          {course.sections?.map(section => (
            <div key={section.id} className="bg-white rounded shadow-sm mb-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-[#032147]">{section.title}</h4>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              {section.lessons?.length > 0 && (
                <div className="space-y-2 mb-3">
                  {section.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded text-sm">
                      <span>
                        {lesson.type === 'video' ? '🎬' : '📄'} {lesson.title}
                      </span>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Lesson title"
                  value={newLesson.sectionId === section.id ? newLesson.title : ''}
                  onChange={e => setNewLesson({ ...newLesson, sectionId: section.id, title: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <select
                  value={newLesson.sectionId === section.id ? newLesson.type : 'video'}
                  onChange={e => setNewLesson({ ...newLesson, type: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                </select>
              </div>

              {newLesson.sectionId === section.id && newLesson.type === 'video' && (
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={newLesson.video_url}
                  onChange={e => setNewLesson({ ...newLesson, video_url: e.target.value })}
                  className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}

              {newLesson.sectionId === section.id && newLesson.type === 'text' && (
                <textarea
                  placeholder="Lesson content"
                  value={newLesson.content}
                  onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
                  rows={3}
                  className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}

              {newLesson.sectionId === section.id && newLesson.title && (
                <button
                  onClick={addLesson}
                  className="mt-2 text-xs bg-[#01696f] text-white px-3 py-1 rounded hover:bg-[#015a5f]"
                >
                  Add Lesson
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2 items-center mt-4">
            <input
              type="text"
              placeholder="New section title"
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={addSection}
              disabled={!newSectionTitle.trim()}
              className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f] disabled:opacity-50"
            >
              Add Section
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
