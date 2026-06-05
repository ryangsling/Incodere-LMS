import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Feedback/Empty States/Simple/v4
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  ...rest
}) {
  const defaultIcon = (
    <svg
      className="mx-auto size-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      />
    </svg>
  )

  return (
    <div
      className={classNames(
        'text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-canvas/50',
        className,
      )}
      {...rest}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      {title && (
        <h3 className="text-sm font-semibold text-navy-700 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted max-w-sm mx-auto mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
