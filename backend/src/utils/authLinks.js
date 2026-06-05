const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Build a frontend URL that carries the same session fragment Supabase
 * returns in its action_link, but points at one of our pages instead of
 * Supabase's /auth/v1/verify endpoint.
 *
 * Example: buildAuthLink({ actionLink, redirectTo: '/accept-invite' })
 *   -> 'http://localhost:5173/accept-invite#access_token=...&refresh_token=...&type=invite'
 */
export function buildAuthLink({ actionLink, redirectTo }) {
  if (!actionLink) throw new Error('buildAuthLink: actionLink is required')
  const hashIndex = actionLink.indexOf('#')
  const fragment = hashIndex >= 0 ? actionLink.slice(hashIndex) : ''
  return `${FRONTEND_URL}${redirectTo}${fragment}`
}
