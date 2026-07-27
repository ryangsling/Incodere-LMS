import { useId } from 'react'
import { classNames } from '../../utils/classNames'

export default function Select({
  label,
  error,
  helperText,
  children,
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
      <select
        id={inputId}
        className={classNames('field pr-8', error && 'field-error')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
        {...rest}
      >
        {children}
      </select>
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
