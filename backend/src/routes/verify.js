import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// GET /api/verify/:certificateId
// Public, no auth. Returns minimal proof of a real certificate.
router.get('/:certificateId', async (req, res) => {
  const { certificateId } = req.params

  const { data: cert, error } = await supabase
    .from('certificates')
    .select(`
      id, issued_at,
      learner:users!learner_id(first_name, last_name),
      course:courses(title)
    `)
    .eq('id', certificateId)
    .maybeSingle()

  if (error) return res.status(500).json({ success: false, error: 'Verification failed' })
  if (!cert) return res.status(404).json({ success: false, error: 'Certificate not found' })

  res.json({
    success: true,
    data: {
      valid: true,
      certificate_id: cert.id,
      learner_name: `${cert.learner.first_name} ${cert.learner.last_name}`,
      course_title: cert.course.title,
      issued_at: cert.issued_at,
    },
  })
})

export default router
