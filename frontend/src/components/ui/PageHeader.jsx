import { Link } from 'react-router-dom'
import Button from './Button'

// Accepts either { actions } (array of nodes) or { action } ({ to?, onClick?, label })
// to keep both legacy and ergonomic call sites working.
export default function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  action,
  className = '',
}) {
  let actionNode = actions
  if (!actionNode && action) {
    if (action.to) {
      actionNode = (
        <Link to={action.to}>
          <Button>{action.label}</Button>
        </Link>
      )
    } else {
      actionNode = <Button onClick={action.onClick}>{action.label}</Button>
    }
  }

  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-2 text-sm text-muted">
          {breadcrumb.map((item, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="mx-2 text-muted" aria-hidden="true">/</span>}
              {item.to ? (
                <Link to={item.to} className="hover:text-link">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {/* This is the page's only h1. The app shell renders a plain label,
              not a second h1 with the same text. `font-bold` is deliberately
              absent: it previously forced weight 700 on a 400-only typeface,
              so the browser synthesized a smeared faux-bold. */}
          <h1 className="text-2xl sm:text-[1.75rem] leading-tight">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-prose text-sm text-muted">{description}</p>
          )}
        </div>
        {actionNode && (
          <div className="flex shrink-0 items-center gap-x-2">{actionNode}</div>
        )}
      </div>
    </div>
  )
}
