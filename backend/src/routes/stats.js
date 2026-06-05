import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { getPlatformStats } from '../controllers/stats.js'

const router = Router()

router.use(verifyAuth)

router.get('/',
  requireRole('super_admin'),
  getPlatformStats
)

export default router
