import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { supabase } from '../utils/supabase'

export default function CourseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft',
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      api.courses.get(id).then(course => {
        setForm({
          title: course.title,
          description: course.description || '',
          category: course.category || '',
          status: course.status,
        })
        setThumbnailUrl(course.thumbnail_url || '')
      }).catch(e => setError(e.message))
    }
  }, [id, isEdit])

  async function handleThumbnailUpload(file) {
    const ext = file.name.split('.').pop()
    const path = `course-thumbnails/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('course-thumbnails')
      .upload(path, file)

    if (uploadErr) throw new Error(uploadErr.message)

    const { data: { publicUrl } } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(path)

    return publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      let url = thumbnailUrl

      if (thumbnail) {
        url = await handleThumbnailUpload(thumbnail)
      }

      const payload = { ...form, thumbnail_url: url }

      if (isEdit) {
        await api.courses.update(id, payload)
      } else {
        await api.courses.create(payload)
      }

      navigate('/super-admin/courses')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-typography mb-6">
        {isEdit ? 'Edit Course' : 'New Course'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-typography/60 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-border-hairline bg-canvas text-typography rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-typography/60 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-border-hairline bg-canvas text-typography rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-typography/60 mb-1">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-border-hairline bg-canvas text-typography rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-typography/60 mb-1">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              setThumbnail(e.target.files[0])
              setThumbnailUrl('')
            }}
            className="w-full text-sm"
          />
          {thumbnailUrl && !thumbnail && (
            <p className="text-xs text-muted mt-1">Current thumbnail uploaded</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-typography/60 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-border-hairline bg-canvas text-typography rounded text-sm focus:outline-none focus:border-accent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white px-4 py-2 rounded text-sm hover:bg-accent-soft disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/super-admin/courses')}
            className="px-4 py-2 rounded text-sm border border-border-hairline text-typography/60 hover:bg-black/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
