import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
import { writeLimiter } from '../middleware/rateLimiters.js'
import {
  listOrganisations,
  createOrganisation,
  createCompanyAdmin,
  listUsersByOrganisation,
  createLearner,
  deactivateUser,
} from '../controllers/organisations.js'

const router = Router()

router.use(verifyAuth)

router.get('/', requireRole('super_admin'), listOrganisations)

router.post(
  '/',
  requireRole('super_admin'),
  writeLimiter,
  body('name').notEmpty().isLength({ max: 200 }).withMessage('Organisation name is required (max 200 chars)'),
  body('contact_email').isEmail().withMessage('Valid contact email is required'),
  handleValidation,
  createOrganisation,
)

router.post(
  '/:orgId/company-admin',
  requireRole('super_admin'),
  writeLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().isLength({ max: 100 }).withMessage('First name is required (max 100 chars)'),
  body('last_name').notEmpty().isLength({ max: 100 }).withMessage('Last name is required (max 100 chars)'),
  handleValidation,
  createCompanyAdmin,
)

router.get('/:orgId/users', requireRole('super_admin', 'company_admin'), listUsersByOrganisation)

router.post(
  '/:orgId/learners',
  requireRole('company_admin'),
  writeLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().isLength({ max: 100 }).withMessage('First name is required (max 100 chars)'),
  body('last_name').notEmpty().isLength({ max: 100 }).withMessage('Last name is required (max 100 chars)'),
  handleValidation,
  createLearner,
)

router.put('/users/:id/deactivate', requireRole('super_admin', 'company_admin'), writeLimiter, deactivateUser)

export default router
