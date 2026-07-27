import { classNames } from '../../utils/classNames'

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
    'inline-flex items-center justify-center gap-x-2 font-medium whitespace-nowrap ' +
    'rounded-[var(--radius-control)] border border-transparent ' +
    'transition-[background-color,border-color,transform] duration-150 ' +
    'active:translate-y-px ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0'

  // Every variant keeps its label above 4.5:1 in rest, hover and active.
  // The previous hover token was a pale mint fill behind white text at
  // 1.13:1, which made the label vanish on hover.
  const variantClasses = {
    primary: 'bg-accent text-white shadow-xs hover:bg-accent-hover',
    secondary:
      'bg-surface text-ink border-border-strong shadow-xs hover:bg-structural',
    ghost: 'bg-transparent text-ink hover:bg-structural',
    danger: 'bg-danger text-white shadow-xs hover:brightness-90',
    accent: 'bg-accent text-white shadow-xs hover:bg-accent-hover',
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
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
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
