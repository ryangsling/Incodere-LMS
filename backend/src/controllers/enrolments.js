import { supabase } from '../index.js'

export async function listEnrolments(req, res) {
  const isSuperAdmin = req.user.role === 'super_admin'

  let query = supabase
    .from('enrolments')
    .select(`
      *,
      learner:users!learner_id(id, email, first_name, last_name, organisation_id),
      course:courses(id, title, status)
    `)

  if (!isSuperAdmin) {
    const { data: orgLearners } = await supabase
      .from('users')
      .select('id')
      .eq('organisation_id', req.user.organisation_id)
    const learnerIds = orgLearners.map(l => l.id)
    query = query.in('learner_id', learnerIds)
  }

  const { data, error } = await query.order('enrolled_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
}

export async function createEnrolment(req, res) {
  const { learner_ids, course_id } = req.body
  const orgId = req.user.organisation_id

  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id, status')
    .eq('id', course_id)
    .single()

  if (courseErr || !course) return res.status(404).json({ success: false, error: 'Course not found' })
  if (course.status !== 'published') return res.status(400).json({ success: false, error: 'Course is not published' })

  const { data: learners, error: learnerErr } = await supabase
    .from('users')
    .select('id')
    .in('id', learner_ids)
    .eq('organisation_id', orgId)
    .eq('role', 'learner')

  if (learnerErr) return res.status(500).json({ success: false, error: learnerErr.message })

  const validIds = learners.map(l => l.id)
  const invalidIds = learner_ids.filter(id => !validIds.includes(id))
  if (invalidIds.length > 0) {
    return res.status(403).json({ success: false, error: 'Some learners do not belong to your organisation' })
  }

  const records = validIds.map(id => ({ learner_id: id, course_id, organisation_id: orgId }))
  const { data, error } = await supabase.from('enrolments').insert(records).select()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function deleteEnrolment(req, res) {
  const { id } = req.params

  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('organisation_id')
    .eq('id', id)
    .single()

  if (!enrolment) return res.status(404).json({ success: false, error: 'Enrolment not found' })

  if (req.user.role !== 'super_admin' && enrolment.organisation_id !== req.user.organisation_id) {
    return res.status(403).json({ success: false, error: 'Forbidden' })
  }

  const { error } = await supabase.from('enrolments').delete().eq('id', id)
  if (error) return res.status(400).json({ success: false, error: error.message })
  res.json({ success: true, data: null })
}

export async function myEnrolments(req, res) {
  const { data: enrolments, error: enrolErr } = await supabase
    .from('enrolments')
    .select('*, course:courses!course_id(id, title, thumbnail_url, status)')
    .eq('learner_id', req.user.id)
    .order('enrolled_at', { ascending: false })

  if (enrolErr) return res.status(500).json({ success: false, error: enrolErr.message })

  const result = await Promise.all(enrolments.map(async (enr) => {
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .in('section_id', supabase
        .from('sections')
        .select('id')
        .eq('course_id', enr.course_id)
      )

    const { count: completedLessons } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('learner_id', req.user.id)
      .eq('completed', true)
      .in('lesson_id', supabase
        .from('lessons')
        .select('id')
        .in('section_id', supabase
          .from('sections')
          .select('id')
          .eq('course_id', enr.course_id)
        )
      )

    return {
      ...enr,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    }
  }))

  res.json({ success: true, data: result })
}
