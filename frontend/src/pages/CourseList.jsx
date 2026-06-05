import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { PageHeader, DataTable, Badge, EmptyState } from '../components/ui'

export default function CourseList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    try {
      const data = await api.courses.list({ pageSize: 100 })
      setRows(data.rows || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (c) => <span className="font-medium text-navy-700">{c.title}</span>,
    },
    { key: 'category', label: 'Category', render: (c) => c.category || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (c) => <Badge variant={c.status === 'published' ? 'success' : 'default'}>{c.status}</Badge>,
    },
    {
      key: 'id',
      label: '',
      render: (c) => <Link to={`/super-admin/courses/${c.id}`} className="text-primary-600 text-xs hover:underline">Open</Link>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Courses"
        action={{ to: '/super-admin/courses/new', label: 'New Course' }}
      />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <DataTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search courses..."
        searchableFields={['title', 'category']}
        pageSize={20}
        loading={loading}
        emptyState={<EmptyState title="No courses yet" description="Create your first course to get started." />}
      />
    </div>
  )
}
