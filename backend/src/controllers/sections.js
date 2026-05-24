import { supabase } from '../index.js'

export async function listSections(req, res) {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', req.params.courseId)
    .order('sort_order')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function createSection(req, res) {
  const { title, sort_order } = req.body
  const { data, error } = await supabase
    .from('sections')
    .insert({ course_id: req.params.courseId, title, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function updateSection(req, res) {
  const { title, sort_order } = req.body
  const { data, error } = await supabase
    .from('sections')
    .update({ title, sort_order })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function deleteSection(req, res) {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data: null })
}
