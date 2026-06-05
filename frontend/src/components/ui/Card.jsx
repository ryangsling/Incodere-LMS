import { classNames } from '../../utils/classNames'

export default function Card({
  children,
  className = '',
  padding = 'md',
  ...rest
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  }

  return (
    <div
      className={classNames(
        'bg-surface rounded-lg border border-gray-200 shadow-xs',
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...rest }) {
  return (
    <div className={classNames('border-b border-gray-200 pb-4 mb-4', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...rest }) {
  return (
    <h3 className={classNames('text-lg font-semibold text-navy-700', className)} {...rest}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...rest }) {
  return (
    <p className={classNames('text-sm text-muted mt-1', className)} {...rest}>
      {children}
    </p>
  )
}

export function CardBody({ children, className = '', ...rest }) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...rest }) {
  return (
    <div
      className={classNames(
        'border-t border-gray-200 pt-4 mt-4 flex items-center justify-end gap-x-2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
