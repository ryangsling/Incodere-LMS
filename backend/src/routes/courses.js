import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courses.js'
import { listSections, createSection, updateSection, deleteSection } from '../controllers/sections.js'
import { listLessons, createLesson, updateLesson, deleteLesson } from '../controllers/lessons.js'

const router = Router()

router.use(verifyAuth, requireRole('super_admin'))

router.get('/', listCourses)
router.get('/:id', getCourse)

router.post('/',
  body('title').notEmpty().withMessage('Title is required'),
  handleValidation,
  createCourse
)

router.put('/:id',
  body('title').notEmpty().withMessage('Title is required'),
  handleValidation,
  updateCourse
)

router.delete('/:id', deleteCourse)

router.get('/:courseId/sections', listSections)
router.post('/:courseId/sections',
  body('title').notEmpty().withMessage('Section title is required'),
  handleValidation,
  createSection
)
router.put('/sections/:id',
  body('title').notEmpty().withMessage('Section title is required'),
  handleValidation,
  updateSection
)
router.delete('/sections/:id', deleteSection)

router.get('/sections/:sectionId/lessons', listLessons)
router.post('/sections/:sectionId/lessons',
  body('title').notEmpty().withMessage('Lesson title is required'),
  body('type').isIn(['video', 'text']).withMessage('Type must be video or text'),
  handleValidation,
  createLesson
)
router.put('/lessons/:id', updateLesson)
router.delete('/lessons/:id', deleteLesson)

export default router
