import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Forms/Input Groups/Input with label and help text/v4
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
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-typography/60 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-typography/50">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          className={classNames(
            'block w-full rounded-md bg-canvas px-3 py-2 text-sm text-typography shadow-xs',
            'outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400',
            'focus:outline-2 focus:-outline-offset-2 focus:outline-accent',
            'disabled:bg-structural disabled:text-typography/50',
            error && 'outline-red-500 focus:outline-red-500',
            leadingIcon && 'pl-10',
            trailingIcon && 'pr-10',
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...rest}
        />
        {trailingIcon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-typography/50">
            {trailingIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="mt-1.5 text-xs text-typography/60">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
