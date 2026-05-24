import { supabase } from '../index.js'

export async function listLessons(req, res) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('section_id', req.params.sectionId)
    .order('sort_order')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function createLesson(req, res) {
  const { title, type, video_url, content, sort_order } = req.body
  const { data, error } = await supabase
    .from('lessons')
    .insert({ section_id: req.params.sectionId, title, type, video_url, content, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function updateLesson(req, res) {
  const { title, type, video_url, content, sort_order } = req.body
  const { data, error } = await supabase
    .from('lessons')
    .update({ title, type, video_url, content, sort_order })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function deleteLesson(req, res) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data: null })
}
