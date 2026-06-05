import { Router } from 'express'
import { verifyAuth } from '../middleware/verifyAuth.js'

const router = Router()

// GET /api/auth/me
// Returns the current user's profile from public.users.
// The frontend MUST go through this endpoint instead of querying
// public.users directly via supabase-js: with RLS enabled, the
// recursive EXISTS subqueries in the policies return null for
// the authenticated user, and any code that touches user.role
// then crashes with "Cannot read properties of null".
// The backend uses service_role, which bypasses RLS.
router.get('/me', verifyAuth, (req, res) => {
  res.json({ success: true, data: req.user })
})

export default router
