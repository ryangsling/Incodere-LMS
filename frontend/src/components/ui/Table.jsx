import { classNames } from '../../utils/classNames'

export default function Table({
  columns,
  rows,
  emptyState,
  loading = false,
  rowKey = 'id',
  onRowClick,
  className = '',
  ...rest
}) {
  return (
    <div
      className={classNames(
        'overflow-x-auto rounded-[var(--radius-surface)] border border-border bg-surface shadow-xs',
        className,
      )}
      {...rest}
    >
      <table className="min-w-full">
        <thead className="bg-structural">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={classNames(
                  'px-4 py-2.5 text-left text-xs font-semibold text-muted',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {/* Column definitions across the app use `label`. This read
                    `col.header`, so every table in the product rendered an
                    empty header row with no accessible column names. */}
                {col.label ?? col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skel-${idx}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 rounded bg-structural animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                {emptyState || <p className="text-sm text-muted">No results</p>}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={classNames(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-structural',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      'px-4 py-3 text-sm text-ink',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
