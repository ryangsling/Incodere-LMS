import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { markComplete, getCourseProgress, getEnrolledCourse } from '../controllers/progress.js'

const router = Router()

router.use(verifyAuth)

router.get('/me/:courseId',
  requireRole('learner'),
  getEnrolledCourse
)

router.post('/',
  requireRole('learner'),
  body('lesson_id').notEmpty().withMessage('Lesson ID is required'),
  handleValidation,
  markComplete
)

router.get('/:courseId',
  requireRole('learner'),
  getCourseProgress
)

export default router
