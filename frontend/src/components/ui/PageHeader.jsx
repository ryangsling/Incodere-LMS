import { Link } from 'react-router-dom'
import Button from './Button'

// Adapted from twp-components/Application UI/Page Examples/Detail Screens
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
    <div className={`mb-6 ${className}`}>
      {breadcrumb && (
        <nav className="mb-2 text-sm text-muted">
          {breadcrumb.map((item, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="mx-2 text-gray-300">/</span>}
              {item.to ? (
                <Link to={item.to} className="hover:text-primary-600">
                  {item.label}
                </Link>
              ) : (
                <span className="text-navy-700">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actionNode && <div className="flex items-center gap-x-2 shrink-0">{actionNode}</div>}
      </div>
    </div>
  )
}
