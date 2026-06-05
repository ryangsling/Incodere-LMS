import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Marketing/Page Sections/Stats/Simple grid/v4
export default function Stat({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  className = '',
  ...rest
}) {
  const deltaColor = delta
    ? delta > 0
      ? 'text-accent-600'
      : delta < 0
        ? 'text-red-600'
        : 'text-muted'
    : ''

  return (
    <div
      className={classNames(
        'bg-surface rounded-lg border border-gray-200 shadow-xs p-5',
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-x-3">
        {icon && (
          <div
            className={classNames(
              'shrink-0 size-10 rounded-lg flex items-center justify-center',
              iconBg,
              iconColor,
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted truncate">{label}</p>
          <p className="text-2xl font-bold text-navy-700 mt-0.5">{value}</p>
        </div>
      </div>
      {delta !== undefined && delta !== null && (
        <p className={classNames('text-xs mt-2', deltaColor)}>
          {delta > 0 ? '+' : ''}
          {delta}
          {deltaLabel ? ` ${deltaLabel}` : ''}
        </p>
      )}
    </div>
  )
}
