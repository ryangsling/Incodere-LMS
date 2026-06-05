import { Router } from 'express'
import { body } from 'express-validator'
import { forgotPasswordLimiter } from '../middleware/rateLimiters.js'
import { handleValidation as validate } from '../middleware/validate.js'
import {
  forgotPassword,
  resetPassword,
  acceptInvite,
  acceptInviteInfo,
} from '../controllers/authPublic.js'

const router = Router()

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
  forgotPassword
)

router.post(
  '/reset-password',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  resetPassword
)

router.post(
  '/accept-invite',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  validate,
  acceptInvite
)

router.post(
  '/accept-invite-info',
  body('access_token').notEmpty().withMessage('access_token is required'),
  body('refresh_token').notEmpty().withMessage('refresh_token is required'),
  validate,
  acceptInviteInfo
)

export default router
