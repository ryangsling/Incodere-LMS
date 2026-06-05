import { classNames } from '../../utils/classNames'

// Adapted from twp-components/Application UI/Lists/Tables/Simple/v4 and With avatars and multi-line content/v4
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
    <div className={classNames('overflow-x-auto rounded-lg border border-gray-200 bg-surface shadow-xs', className)} {...rest}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-canvas">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={classNames(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skel-${idx}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                {emptyState || (
                  <p className="text-sm text-muted">No results</p>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={classNames(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-canvas',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={classNames(
                      'px-4 py-3 text-sm text-navy-700',
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
