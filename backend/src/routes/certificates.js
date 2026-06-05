import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { writeLimiter, expensiveLimiter } from '../middleware/rateLimiters.js'
import { generateCertificate, listMyCertificates, listCertificates, downloadCertificate } from '../controllers/certificates.js'

const router = Router()

router.use(verifyAuth)

router.post(
  '/',
  requireRole('learner'),
  expensiveLimiter,
  body('course_id').notEmpty().withMessage('Course ID is required'),
  handleValidation,
  generateCertificate,
)

router.get('/mine', requireRole('learner'), listMyCertificates)

router.get('/:id/download', requireRole('super_admin', 'company_admin', 'learner'), downloadCertificate)

router.get('/', requireRole('super_admin', 'company_admin'), listCertificates)

export default router
