import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Feedback/Alerts/With description/v4
const variantClasses = {
  default: 'bg-primary-50 text-primary-800 border-primary-200',
  success: 'bg-accent-50 text-accent-800 border-accent-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

const iconColorClasses = {
  default: 'text-primary-600',
  success: 'text-accent-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
}

export default function Alert({
  variant = 'default',
  title,
  children,
  onDismiss,
  actions,
  className = '',
  ...rest
}) {
  return (
    <div
      role="alert"
      className={classNames(
        'rounded-md border p-4 flex gap-x-3',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      <div className={classNames('shrink-0 mt-0.5', iconColorClasses[variant])}>
        {variant === 'success' && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === 'danger' && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.94 6.94a1.5 1.5 0 1 1 2.12 2.12L8.94 11.18l-2.12-2.12a1.5 1.5 0 1 1 2.12-2.12l2.12 2.12 2.12-2.12z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {(variant === 'info' || variant === 'default' || variant === 'warning') && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
        {children && <div className="text-sm">{children}</div>}
        {actions && <div className="mt-3 flex gap-x-3">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 -m-1.5 p-1.5 rounded-md hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          aria-label="Dismiss"
        >
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  )
}
