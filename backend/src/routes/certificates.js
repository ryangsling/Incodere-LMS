import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { generateCertificate, listMyCertificates, listCertificates } from '../controllers/certificates.js'

const router = Router()

router.use(verifyAuth)

router.post('/',
  requireRole('learner'),
  body('course_id').notEmpty().withMessage('Course ID is required'),
  handleValidation,
  generateCertificate
)

router.get('/mine',
  requireRole('learner'),
  listMyCertificates
)

router.get('/',
  requireRole('super_admin', 'company_admin'),
  listCertificates
)

export default router
