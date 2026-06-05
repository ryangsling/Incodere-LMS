import supabase from '../db/supabase.js'

export async function markComplete(req, res) {
  const { lesson_id } = req.body
  const userId = req.user.id

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, section_id')
    .eq('id', lesson_id)
    .single()

  if (lessonErr || !lesson) return res.status(404).json({ success: false, error: 'Lesson not found' })

  const { data: section, error: sectionErr } = await supabase
    .from('sections')
    .select('course_id')
    .eq('id', lesson.section_id)
    .single()

  if (sectionErr || !section) return res.status(404).json({ success: false, error: 'Section not found' })

  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('id')
    .eq('learner_id', userId)
    .eq('course_id', section.course_id)
    .single()

  if (!enrolment) return res.status(403).json({ success: false, error: 'Not enrolled in this course' })

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      { learner_id: userId, lesson_id, completed: true, completed_at: new Date().toISOString() },
      { onConflict: 'learner_id, lesson_id' }
    )
    .select()
    .single()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function getCourseProgress(req, res) {
  const userId = req.user.id
  const courseId = req.params.courseId

  const { data: sections } = await supabase
    .from('sections')
    .select('id')
    .eq('course_id', courseId)

  const sectionIds = sections?.map(s => s.id) || []

  let lessonIds = []
  if (sectionIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('section_id', sectionIds)
    lessonIds = lessons?.map(l => l.id) || []
  }

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, completed_at')
    .eq('learner_id', userId)
    .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['00000000-0000-0000-0000-000000000000'])

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}
