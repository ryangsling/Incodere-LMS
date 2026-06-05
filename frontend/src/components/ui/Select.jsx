import { classNames } from '../../utils/classNames'

// Simple native select wrapped in our design system
export default function Select({
  label,
  error,
  helperText,
  children,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || rest.name || `select-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={classNames(
          'block w-full rounded-md bg-white px-3 py-1.5 pr-8 text-sm text-navy-700 shadow-xs',
          'outline-1 -outline-offset-1 outline-gray-300',
          'focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600',
          'disabled:bg-gray-50 disabled:text-muted',
          error && 'outline-red-500 focus:outline-red-500',
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  )
}
