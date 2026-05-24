import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
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

router.post('/',
  requireRole('super_admin'),
  body('title').notEmpty().withMessage('Title is required'),
  handleValidation,
  createCourse
)

router.put('/:id',
  requireRole('super_admin'),
  body('title').notEmpty().withMessage('Title is required'),
  handleValidation,
  updateCourse
)

router.delete('/:id',
  requireRole('super_admin'),
  deleteCourse
)

router.get('/:courseId/sections',
  requireRole('super_admin'),
  listSections
)
router.post('/:courseId/sections',
  requireRole('super_admin'),
  body('title').notEmpty().withMessage('Section title is required'),
  handleValidation,
  createSection
)
router.put('/sections/:id',
  requireRole('super_admin'),
  body('title').notEmpty().withMessage('Section title is required'),
  handleValidation,
  updateSection
)
router.delete('/sections/:id',
  requireRole('super_admin'),
  deleteSection
)

router.get('/sections/:sectionId/lessons',
  requireRole('super_admin'),
  listLessons
)
router.post('/sections/:sectionId/lessons',
  requireRole('super_admin'),
  body('title').notEmpty().withMessage('Lesson title is required'),
  body('type').isIn(['video', 'text']).withMessage('Type must be video or text'),
  handleValidation,
  createLesson
)
router.put('/lessons/:id',
  requireRole('super_admin'),
  updateLesson
)
router.delete('/lessons/:id',
  requireRole('super_admin'),
  deleteLesson
)

export default router
