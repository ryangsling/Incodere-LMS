import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.courses.list()
      .then(setCourses)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-[#888888]">Loading courses...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#032147]">Courses</h2>
        <Link
          to="/super-admin/courses/new"
          className="bg-[#01696f] text-white px-4 py-2 rounded text-sm hover:bg-[#015a5f]"
        >
          New Course
        </Link>
      </div>

      {courses.length === 0 && (
        <p className="text-[#888888] text-sm">No courses yet. Create your first course.</p>
      )}

      <div className="grid gap-4">
        {courses.map(course => (
          <Link
            key={course.id}
            to={`/super-admin/courses/${course.id}`}
            className="bg-white rounded shadow-sm p-4 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <h3 className="font-medium text-[#032147]">{course.title}</h3>
              {course.category && (
                <span className="text-xs text-[#888888]">{course.category}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'published' ? 'bg-[#437a22] text-white' : 'bg-gray-200 text-[#888888]'}`}>
                {course.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
