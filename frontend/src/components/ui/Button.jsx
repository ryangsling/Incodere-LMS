import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Elements/Buttons (multiple variants) and Heroicons
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-x-2 font-semibold rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-xs',
    secondary: 'bg-white text-navy-700 border border-gray-300 hover:bg-gray-50 shadow-xs',
    ghost: 'bg-transparent text-navy-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 shadow-xs',
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames(
        base,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
