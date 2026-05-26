import supabase from '../db/supabase.js'

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

  const records = validIds.map(id => ({ learner_id: id, course_id }))
  const { data, error } = await supabase.from('enrolments').insert(records).select()

  if (error) return res.status(400).json({ success: false, error: error.message })
  res.status(201).json({ success: true, data })
}

export async function deleteEnrolment(req, res) {
  const { id } = req.params

  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('id, learner:users!learner_id(organisation_id)')
    .eq('id', id)
    .single()

  if (!enrolment) return res.status(404).json({ success: false, error: 'Enrolment not found' })

  if (req.user.role !== 'super_admin' && enrolment.learner?.organisation_id !== req.user.organisation_id) {
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
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .eq('course_id', enr.course_id)

    const sectionIds = sections?.map(s => s.id) || []

    let totalLessons = 0
    let completedLessons = 0

    if (sectionIds.length > 0) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .in('section_id', sectionIds)

      const lessonIds = lessons?.map(l => l.id) || []
      totalLessons = lessonIds.length

      if (lessonIds.length > 0) {
        const { count } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('learner_id', req.user.id)
          .eq('completed', true)
          .in('lesson_id', lessonIds)
        completedLessons = count || 0
      }
    }

    return {
      ...enr,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    }
  }))

  res.json({ success: true, data: result })
}

export async function getReport(req, res) {
  const orgId = req.user.organisation_id
  const { course_id, status } = req.query

  const { data: orgLearners } = await supabase
    .from('users')
    .select('id')
    .eq('organisation_id', orgId)
  const learnerIds = orgLearners.map(l => l.id)

  let query = supabase
    .from('enrolments')
    .select(`
      *,
      learner:users!learner_id(id, email, first_name, last_name),
      course:courses(id, title)
    `)
    .in('learner_id', learnerIds)
    .order('enrolled_at', { ascending: false })

  if (course_id) query = query.eq('course_id', course_id)

  const { data: enrolments, error } = await query
  if (error) return res.status(500).json({ success: false, error: error.message })

  const result = await Promise.all(enrolments.map(async (enr) => {
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .eq('course_id', enr.course_id)

    const sectionIds = sections?.map(s => s.id) || []
    let totalLessons = 0
    let completedLessons = 0

    if (sectionIds.length > 0) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .in('section_id', sectionIds)

      const lessonIds = lessons?.map(l => l.id) || []
      totalLessons = lessonIds.length

      if (lessonIds.length > 0) {
        const { count } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('learner_id', enr.learner_id)
          .eq('completed', true)
          .in('lesson_id', lessonIds)
        completedLessons = count || 0
      }
    }

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const { data: cert } = await supabase
      .from('certificates')
      .select('id, issued_at')
      .eq('learner_id', enr.learner_id)
      .eq('course_id', enr.course_id)
      .maybeSingle()

    return {
      learner_name: `${enr.learner.first_name} ${enr.learner.last_name}`,
      learner_email: enr.learner.email,
      course_title: enr.course.title,
      progress,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      certificate_issued: !!cert,
      certificate_date: cert?.issued_at || null,
      enrolled_at: enr.enrolled_at,
    }
  }))

  const filtered = status
    ? result.filter(r => {
        if (status === 'completed') return r.progress === 100
        if (status === 'in_progress') return r.progress > 0 && r.progress < 100
        if (status === 'not_started') return r.progress === 0
        return true
      })
    : result

  res.json({ success: true, data: filtered })
}

export async function getEnrolledCourse(req, res) {
  const userId = req.user.id
  const courseId = req.params.courseId

  const { data: enrolment } = await supabase
    .from('enrolments')
    .select('id')
    .eq('learner_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!enrolment) return res.status(403).json({ success: false, error: 'Not enrolled in this course' })

  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, description, category, thumbnail_url,
      sections (
        id, title, sort_order,
        lessons (id, title, type, video_url, content, sort_order)
      )
    `)
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (error) return res.status(404).json({ success: false, error: 'Course not found' })
  res.json({ success: true, data })
}
