import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Feedback/Alerts (badge variants inside lists)
const variantClasses = {
  default: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-accent-50 text-accent-700 border-accent-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-danger-soft text-danger border-danger-border',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-structural text-ink border-border',
}

export default function Badge({
  variant = 'default',
  children,
  className = '',
  ...rest
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-x-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
