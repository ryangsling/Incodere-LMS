import supabase from '../db/supabase.js'

// Fetches lesson + progress counts for many courseIds in 3 round trips
// (1 for sections, 1 for lessons, 1 for progress) and returns a Map keyed by courseId.
async function fetchProgressByCourseIds(supabase, courseIds, learnerId) {
  const progressByCourse = new Map()

  if (courseIds.length === 0) return progressByCourse

  const { data: sections } = await supabase
    .from('sections')
    .select('id, course_id')
    .in('course_id', courseIds)

  const sectionsByCourse = new Map()
  for (const s of sections || []) {
    if (!sectionsByCourse.has(s.course_id)) sectionsByCourse.set(s.course_id, [])
    sectionsByCourse.get(s.course_id).push(s.id)
  }

  const allSectionIds = [...sectionsByCourse.values()].flat()
  if (allSectionIds.length === 0) {
    for (const cid of courseIds) progressByCourse.set(cid, { total: 0, completed: 0 })
    return progressByCourse
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, section_id')
    .in('section_id', allSectionIds)

  const lessonsBySection = new Map()
  for (const l of lessons || []) {
    if (!lessonsBySection.has(l.section_id)) lessonsBySection.set(l.section_id, [])
    lessonsBySection.get(l.section_id).push(l.id)
  }

  const allLessonIds = (lessons || []).map((l) => l.id)
  const completedSet = new Set()
  if (allLessonIds.length > 0) {
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('learner_id', learnerId)
      .eq('completed', true)
      .in('lesson_id', allLessonIds)
    for (const p of progress || []) completedSet.add(p.lesson_id)
  }

  for (const cid of courseIds) {
    const sectionIds = sectionsByCourse.get(cid) || []
    const lessonIds = sectionIds.flatMap((sid) => lessonsBySection.get(sid) || [])
    const completed = lessonIds.filter((id) => completedSet.has(id)).length
    progressByCourse.set(cid, { total: lessonIds.length, completed })
  }

  return progressByCourse
}

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
    const learnerIds = orgLearners.map((l) => l.id)
    if (learnerIds.length === 0) return res.json({ success: true, data: [] })
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
  if (course.status !== 'published') {
    return res.status(400).json({ success: false, error: 'Course is not published' })
  }

  const { data: learners, error: learnerErr } = await supabase
    .from('users')
    .select('id')
    .in('id', learner_ids)
    .eq('organisation_id', orgId)
    .eq('role', 'learner')

  if (learnerErr) return res.status(500).json({ success: false, error: learnerErr.message })

  const validIds = learners.map((l) => l.id)
  const invalidIds = learner_ids.filter((id) => !validIds.includes(id))
  if (invalidIds.length > 0) {
    return res.status(403).json({ success: false, error: 'Some learners do not belong to your organisation' })
  }

  // NOTE: the user's enrolments table does not have an organisation_id
  // column (schema drift from docs/schema.sql). Org scope is enforced via
  // the learner_id FK + the org-scoped lookup above, and the RLS policy
  // derives organisation_id from learner_id -> users.organisation_id.
  const records = validIds.map((id) => ({ learner_id: id, course_id }))

  const { data, error } = await supabase
    .from('enrolments')
    .upsert(records, { onConflict: 'learner_id,course_id', ignoreDuplicates: true })
    .select()

  if (error) return res.status(400).json({ success: false, error: error.message })

  const created = (data || []).map((d) => d.learner_id)
  const skipped = validIds.filter((id) => !created.includes(id))

  res.status(201).json({
    success: true,
    data: { enrolled: created, already_enrolled: skipped, count: created.length },
  })
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
  const learnerId = req.user.id

  const { data: enrolments, error: enrolErr } = await supabase
    .from('enrolments')
    .select(`
      *,
      course:courses!course_id(id, title, thumbnail_url, status)
    `)
    .eq('learner_id', learnerId)
    .order('enrolled_at', { ascending: false })

  if (enrolErr) return res.status(500).json({ success: false, error: enrolErr.message })

  const courseIds = (enrolments || []).map((e) => e.course_id)
  const progressByCourse = await fetchProgressByCourseIds(supabase, courseIds, learnerId)

  const result = (enrolments || []).map((enr) => {
    const { total, completed } = progressByCourse.get(enr.course_id) || { total: 0, completed: 0 }
    return {
      ...enr,
      total_lessons: total,
      completed_lessons: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })

  res.json({ success: true, data: result })
}

export async function getReport(req, res) {
  const orgId = req.user.organisation_id
  const { course_id, status, q, page = 1, pageSize = 50 } = req.query

  const { data: orgLearners } = await supabase
    .from('users')
    .select('id')
    .eq('organisation_id', orgId)
  const learnerIds = orgLearners.map((l) => l.id)

  if (learnerIds.length === 0) return res.json({ success: true, data: { rows: [], total: 0, page: 1, pageSize } })

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

  const courseIds = [...new Set((enrolments || []).map((e) => e.course_id))]

  // Compute per-(learner, course) progress in batched queries
  const progressMap = new Map() // key = `${learnerId}:${courseId}`
  const { data: sections } = await supabase
    .from('sections')
    .select('id, course_id')
    .in('course_id', courseIds)
  const sectionsByCourse = new Map()
  for (const s of sections || []) {
    if (!sectionsByCourse.has(s.course_id)) sectionsByCourse.set(s.course_id, [])
    sectionsByCourse.get(s.course_id).push(s.id)
  }
  const allSectionIds = [...sectionsByCourse.values()].flat()
  if (allSectionIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, section_id')
      .in('section_id', allSectionIds)
    const lessonsBySection = new Map()
    for (const l of lessons || []) {
      if (!lessonsBySection.has(l.section_id)) lessonsBySection.set(l.section_id, [])
      lessonsBySection.get(l.section_id).push(l.id)
    }
    const allLessonIds = (lessons || []).map((l) => l.id)
    if (allLessonIds.length > 0) {
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, learner_id')
        .eq('completed', true)
        .in('lesson_id', allLessonIds)
        .in('learner_id', learnerIds)
      for (const p of progress || []) {
        const lessonSection = (lessons || []).find((l) => l.id === p.lesson_id)?.section_id
        const courseId = (sections || []).find((s) => s.id === lessonSection)?.course_id
        if (!courseId) continue
        const key = `${p.learner_id}:${courseId}`
        progressMap.set(key, (progressMap.get(key) || 0) + 1)
      }
      progressMap.totalByKey = (learnerId, courseId) => {
        const sectionIds = sectionsByCourse.get(courseId) || []
        return sectionIds.reduce((sum, sid) => sum + (lessonsBySection.get(sid)?.length || 0), 0)
      }
    }
  }

  // Fetch all certificates in one query
  const { data: certs } = await supabase
    .from('certificates')
    .select('id, issued_at, learner_id, course_id')
    .in('learner_id', learnerIds)
  const certMap = new Map()
  for (const c of certs || []) certMap.set(`${c.learner_id}:${c.course_id}`, c)

  const rows = (enrolments || []).map((enr) => {
    const key = `${enr.learner_id}:${enr.course_id}`
    const completed = progressMap.get(key) || 0
    const total = progressMap.totalByKey ? progressMap.totalByKey(enr.learner_id, enr.course_id) : 0
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    const cert = certMap.get(key)
    return {
      learner_name: `${enr.learner.first_name} ${enr.learner.last_name}`,
      learner_email: enr.learner.email,
      course_title: enr.course.title,
      progress,
      total_lessons: total,
      completed_lessons: completed,
      certificate_issued: !!cert,
      certificate_date: cert?.issued_at || null,
      enrolled_at: enr.enrolled_at,
    }
  })

  let filtered = rows
  if (status === 'completed') filtered = filtered.filter((r) => r.progress === 100)
  else if (status === 'in_progress') filtered = filtered.filter((r) => r.progress > 0 && r.progress < 100)
  else if (status === 'not_started') filtered = filtered.filter((r) => r.progress === 0)

  if (q) {
    const needle = q.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.learner_name.toLowerCase().includes(needle) ||
        r.learner_email.toLowerCase().includes(needle) ||
        r.course_title.toLowerCase().includes(needle),
    )
  }

  const total = filtered.length
  const start = (Math.max(1, parseInt(page)) - 1) * Math.max(1, Math.min(200, parseInt(pageSize)))
  const paged = filtered.slice(start, start + parseInt(pageSize))

  res.json({ success: true, data: { rows: paged, total, page: parseInt(page), pageSize: parseInt(pageSize) } })
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
