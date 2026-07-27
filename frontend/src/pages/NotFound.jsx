import { useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * Unknown routes previously redirected silently to `/`, so every mistyped or
 * stale URL rendered the landing page at HTTP 200. That reads as duplicate
 * content to crawlers and hides the mistake from the user. A static host cannot
 * return a 404 status for an SPA route, so we do the next best thing: show a
 * real not-found page and mark it noindex.
 */
export default function NotFound() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, follow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <img src="/logo-mark.svg" alt="" width="36" height="36" className="mb-8" />
      <p data-numeric className="text-sm font-medium text-muted">404</p>
      <h1 className="mt-2 text-2xl sm:text-3xl">This page does not exist</h1>
      <p className="mt-3 max-w-sm text-body">
        The link may be out of date, or the page may have moved.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to ILMS
      </Link>
    </main>
  )
}
