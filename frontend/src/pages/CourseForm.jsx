import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { supabase } from '../utils/supabase'
import { Button, Input, Textarea, Select, PageHeader } from '../components/ui'

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
      <PageHeader
        breadcrumb={[{ to: '/super-admin/courses', label: 'Courses' }, { label: isEdit ? 'Edit' : 'New' }]}
        title={isEdit ? 'Edit course' : 'New course'}
      />

      {/* Every field now carries an id, a name, and a label bound with htmlFor.
          Previously these were bare inputs with no id, name or association, so
          screen readers announced five unlabelled fields and autofill had
          nothing to match on. */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
        <Input
          id="course-title"
          name="title"
          label="Title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <Textarea
          id="course-description"
          name="description"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          helperText="Shown to learners on their dashboard and course card."
        />

        <Input
          id="course-category"
          name="category"
          label="Category"
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <div>
          <label htmlFor="course-thumbnail" className="field-label">
            Thumbnail
          </label>
          <input
            id="course-thumbnail"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setThumbnail(e.target.files[0])
              setThumbnailUrl('')
            }}
            aria-describedby="course-thumbnail-help"
            className="block w-full text-sm text-body file:mr-3 file:rounded-[var(--radius-control)] file:border file:border-border-strong file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-structural"
          />
          <p id="course-thumbnail-help" className="mt-1.5 text-xs text-muted">
            {thumbnailUrl && !thumbnail
              ? 'A thumbnail is already uploaded. Choosing a file replaces it.'
              : 'Optional. PNG or JPG.'}
          </p>
        </div>

        <Select
          id="course-status"
          name="status"
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          helperText="Drafts are hidden from company admins until published."
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>

        {error && (
          <p
            role="alert"
            className="rounded-[var(--radius-control)] border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create course'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/super-admin/courses')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
