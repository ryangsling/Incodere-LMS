import { classNames } from '../../utils/classNames'

export default function Skeleton({ variant = 'text', className = '', ...rest }) {
  const variantClasses = {
    text: 'h-3 w-full',
    title: 'h-5 w-2/3',
    avatar: 'size-10 rounded-full',
    card: 'h-24 w-full rounded-lg',
    row: 'h-12 w-full',
    block: 'h-32 w-full rounded-lg',
  }

  return (
    <div
      className={classNames(
        'animate-pulse bg-gray-200',
        variantClasses[variant],
        variant !== 'avatar' && variant !== 'card' && variant !== 'block' && 'rounded',
        className,
      )}
      {...rest}
    />
  )
}

export function SkeletonList({ rows = 5, className = '' }) {
  return (
    <div className={classNames('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="row" />
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div className={classNames('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  )
}
