import { Router } from 'express'
import { body, param } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { writeLimiter } from '../middleware/rateLimiters.js'
import { listCourses, getCourse, listPublishedCourses, getPublishedCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courses.js'
import { listSections, createSection, updateSection, deleteSection } from '../controllers/sections.js'
import { listLessons, createLesson, updateLesson, deleteLesson } from '../controllers/lessons.js'

const router = Router()

router.use(verifyAuth)

router.get('/', (req, res, next) => {
  if (req.user.role === 'super_admin') return listCourses(req, res, next)
  return listPublishedCourses(req, res, next)
})

router.get('/:id', (req, res, next) => {
  if (req.user.role === 'super_admin') return getCourse(req, res, next)
  return getPublishedCourse(req, res, next)
})

router.post(
  '/',
  requireRole('super_admin'),
  writeLimiter,
  body('title').notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
  body('description').optional().isLength({ max: 5000 }),
  body('category').optional().isLength({ max: 100 }),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  handleValidation,
  createCourse,
)

router.put(
  '/:id',
  requireRole('super_admin'),
  writeLimiter,
  body('title').optional().notEmpty().isLength({ max: 200 }).withMessage('Title cannot be empty (max 200 chars)'),
  body('description').optional().isLength({ max: 5000 }),
  body('category').optional().isLength({ max: 100 }),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  handleValidation,
  updateCourse,
)

router.delete('/:id', requireRole('super_admin'), writeLimiter, deleteCourse)

router.get('/:courseId/sections', requireRole('super_admin'), listSections)

router.post(
  '/:courseId/sections',
  requireRole('super_admin'),
  writeLimiter,
  body('title').notEmpty().isLength({ max: 200 }).withMessage('Section title is required (max 200 chars)'),
  handleValidation,
  createSection,
)

router.put(
  '/sections/:id',
  requireRole('super_admin'),
  writeLimiter,
  body('title').optional().notEmpty().isLength({ max: 200 }).withMessage('Section title cannot be empty'),
  handleValidation,
  updateSection,
)

router.delete('/sections/:id', requireRole('super_admin'), writeLimiter, deleteSection)

router.get('/sections/:sectionId/lessons', requireRole('super_admin'), listLessons)

router.post(
  '/sections/:sectionId/lessons',
  requireRole('super_admin'),
  writeLimiter,
  body('title').notEmpty().isLength({ max: 200 }).withMessage('Lesson title is required (max 200 chars)'),
  body('type').isIn(['video', 'text']).withMessage('Type must be video or text'),
  body('video_url').optional().isURL().withMessage('Video URL must be valid'),
  handleValidation,
  createLesson,
)

router.put(
  '/lessons/:id',
  requireRole('super_admin'),
  writeLimiter,
  body('title').optional().notEmpty().isLength({ max: 200 }).withMessage('Lesson title cannot be empty'),
  body('type').optional().isIn(['video', 'text']).withMessage('Type must be video or text'),
  body('video_url').optional().isURL().withMessage('Video URL must be valid'),
  handleValidation,
  updateLesson,
)

router.delete('/lessons/:id', requireRole('super_admin'), writeLimiter, deleteLesson)

export default router
