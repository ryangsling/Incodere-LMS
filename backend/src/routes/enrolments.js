import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
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

router.get('/',
  requireRole('super_admin', 'company_admin'),
  listEnrolments
)

router.post('/',
  requireRole('company_admin'),
  body('learner_ids').isArray({ min: 1 }).withMessage('At least one learner is required'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  handleValidation,
  createEnrolment
)

router.delete('/:id',
  requireRole('super_admin', 'company_admin'),
  deleteEnrolment
)

router.get('/report',
  requireRole('company_admin'),
  getReport
)

router.get('/me',
  requireRole('learner'),
  myEnrolments
)

router.get('/me/:courseId',
  requireRole('learner'),
  getEnrolledCourse
)

export default router
