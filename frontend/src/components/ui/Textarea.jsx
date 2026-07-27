import { useId } from 'react'
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
  const generatedId = useId()
  const inputId = id || rest.name || generatedId

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={classNames('field resize-y', error && 'field-error')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
