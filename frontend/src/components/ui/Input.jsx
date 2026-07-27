import { useId } from 'react'
import { classNames } from '../../utils/classNames'

export default function Input({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  className = '',
  id,
  ...rest
}) {
  // useId is stable across renders; the previous Math.random() id changed on
  // every render, which broke the label/input association it was meant to make.
  const generatedId = useId()
  const inputId = id || rest.name || generatedId

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          className={classNames(
            'field',
            error && 'field-error',
            leadingIcon && 'pl-10',
            trailingIcon && 'pr-10',
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...rest}
        />
        {trailingIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
            {trailingIcon}
          </span>
        )}
      </div>
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
