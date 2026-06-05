import supabase from '../db/supabase.js'
import { parsePagination, parseSearchQuery, runPaged } from '../utils/listQuery.js'

const COURSE_SEARCH_FIELDS = ['title', 'description', 'category']

export async function listCourses(req, res) {
  const searchExpr = parseSearchQuery(req.query, COURSE_SEARCH_FIELDS)
  let query = supabase
    .from('courses')
    .select('id, title, category, thumbnail_url, status, created_at, created_by', { count: 'exact' })
  if (req.query.status) query = query.eq('status', req.query.status)
  if (searchExpr) query = query.or(searchExpr)

  const { page, pageSize } = parsePagination(req.query)
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return res.status(500).json({ success: false, error: error.message })
  // Total count requires a second lightweight query (Supabase range + count is fine but
  // we re-use the same filter to keep contract simple for the admin UI).
  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .match({ ...(req.query.status && { status: req.query.status }) })
    .or(searchExpr || 'id.is.not.null')

  res.json({
    success: true,
    data: { rows: data || [], total: count || 0, page, pageSize },
  })
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
  const updates = {}
  for (const f of ['title', 'description', 'category', 'thumbnail_url', 'status']) {
    if (req.body[f] !== undefined) updates[f] = req.body[f]
  }
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
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
  const searchExpr = parseSearchQuery(req.query, COURSE_SEARCH_FIELDS)
  let query = supabase
    .from('courses')
    .select('id, title, category, thumbnail_url, status, created_at', { count: 'exact' })
    .eq('status', 'published')
  if (req.query.category) query = query.eq('category', req.query.category)
  if (searchExpr) query = query.or(searchExpr)

  const { page, pageSize } = parsePagination(req.query)
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return res.status(500).json({ success: false, error: error.message })

  const { count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .or(searchExpr || 'id.is.not.null')

  res.json({
    success: true,
    data: { rows: data || [], total: count || 0, page, pageSize },
  })
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
