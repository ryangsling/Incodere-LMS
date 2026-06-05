import { classNames } from '../../utils/classNames'

export default function Textarea({
  label,
  error,
  helperText,
  rows = 4,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || rest.name || `textarea-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={classNames(
          'block w-full rounded-md bg-white px-3 py-2 text-sm text-navy-700 shadow-xs',
          'outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400',
          'focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600',
          'disabled:bg-gray-50 disabled:text-muted',
          error && 'outline-red-500 focus:outline-red-500',
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  )
}
