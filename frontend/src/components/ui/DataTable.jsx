import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { classNames } from '../../utils/classNames'
import Table from './Table'
import Input from './Input'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

// DataTable wraps Table with search + pagination, addressing Phase 2.3 in a reusable way
export default function DataTable({
  columns,
  rows,
  searchPlaceholder = 'Search...',
  searchableFields = [],
  pageSize = 20,
  emptyState,
  loading,
  onRowClick,
  toolbar,
  className = '',
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const getField = (row, f) =>
    f.split('.').reduce((acc, k) => (acc == null ? '' : acc[k]), row)

  const filtered = search
    ? rows.filter((row) => {
        const needle = search.toLowerCase()
        const haystack = searchableFields.length
          ? searchableFields.map((f) => String(getField(row, f) ?? '').toLowerCase()).join(' ')
          : JSON.stringify(row).toLowerCase()
        return haystack.includes(needle)
      })
    : rows

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  return (
    <div className={classNames('space-y-3', className)}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {searchableFields.length > 0 && (
          <div className="sm:max-w-xs w-full">
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              leadingIcon={<MagnifyingGlassIcon className="size-4" />}
            />
          </div>
        )}
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      <Table
        columns={columns}
        rows={visible}
        loading={loading}
        emptyState={emptyState}
        onRowClick={onRowClick}
      />

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <p className="text-sm text-muted">
            Showing <span className="font-medium text-navy-700">{start + 1}</span>-
            <span className="font-medium text-navy-700">{Math.min(start + pageSize, filtered.length)}</span> of{' '}
            <span className="font-medium text-navy-700">{filtered.length}</span>
          </p>
          <nav className="flex items-center gap-x-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="size-8 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-muted hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <span className="px-3 text-sm text-navy-700">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="size-8 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-muted hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
