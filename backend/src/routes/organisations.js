import { Router } from 'express'
import { body } from 'express-validator'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { handleValidation } from '../middleware/validate.js'
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

router.get('/',
  requireRole('super_admin'),
  listOrganisations
)

router.post('/',
  requireRole('super_admin'),
  body('name').notEmpty().withMessage('Organisation name is required'),
  body('contact_email').isEmail().withMessage('Valid contact email is required'),
  handleValidation,
  createOrganisation
)

router.post('/:orgId/company-admin',
  requireRole('super_admin'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  handleValidation,
  createCompanyAdmin
)

router.get('/:orgId/users',
  requireRole('super_admin', 'company_admin'),
  listUsersByOrganisation
)

router.post('/:orgId/learners',
  requireRole('company_admin'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  handleValidation,
  createLearner
)

router.put('/users/:id/deactivate',
  requireRole('super_admin', 'company_admin'),
  deactivateUser
)

export default router
