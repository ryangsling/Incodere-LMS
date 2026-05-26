import supabase from '../db/supabase.js'

export async function listCourses(req, res) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, category, thumbnail_url, status, created_at, created_by')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function getCourse(req, res) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        id, title, sort_order,
        lessons (id, title, type, video_url, content, sort_order)
      )
    `)
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ success: false, error: 'Course not found' })
  res.json({ success: true, data })
}

export async function createCourse(req, res) {
  const { title, description, category, thumbnail_url, status } = req.body
  const { data, error } = await supabase
    .from('courses')
    .insert({ title, description, category, thumbnail_url, status, created_by: req.user.id })
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function updateCourse(req, res) {
  const { title, description, category, thumbnail_url, status } = req.body
  const { data, error } = await supabase
    .from('courses')
    .update({ title, description, category, thumbnail_url, status })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function deleteCourse(req, res) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data: null })
}

export async function listPublishedCourses(req, res) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, category, thumbnail_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function getPublishedCourse(req, res) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        id, title, sort_order,
        lessons (id, title, type, video_url, content, sort_order)
      )
    `)
    .eq('id', req.params.id)
    .eq('status', 'published')
    .single()

  if (error) return res.status(404).json({ success: false, error: 'Course not found' })
  res.json({ success: true, data })
}
