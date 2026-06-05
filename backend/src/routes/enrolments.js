import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { writeLimiter, expensiveLimiter } from '../middleware/rateLimiters.js'
import {
  listEnrolments,
  createEnrolment,
  deleteEnrolment,
  myEnrolments,
  getEnrolledCourse,
  getReport,
} from '../controllers/enrolments.js'

const router = Router()

router.use(verifyAuth)

router.get('/', requireRole('super_admin', 'company_admin'), listEnrolments)

router.post(
  '/',
  requireRole('company_admin'),
  writeLimiter,
  body('learner_ids').isArray({ min: 1, max: 500 }).withMessage('learner_ids must be an array of 1-500 IDs'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  handleValidation,
  createEnrolment,
)

router.delete('/:id', requireRole('super_admin', 'company_admin'), writeLimiter, deleteEnrolment)

router.get('/report', requireRole('company_admin'), expensiveLimiter, getReport)

router.get('/me', requireRole('learner'), myEnrolments)

router.get('/me/:courseId', requireRole('learner'), getEnrolledCourse)

export default router
