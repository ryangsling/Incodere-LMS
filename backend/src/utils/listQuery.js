// Helpers for list endpoints: pagination, search, filtering, sorting.
// All params are read from req.query; defaults are safe for ILMS scale.

const MAX_PAGE_SIZE = 200

export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.pageSize) || 50))
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  return { page, pageSize, start, end }
}

export function parseSearchQuery(query, fields = []) {
  if (!query.q || !fields.length) return null
  const needle = `%${query.q.toLowerCase()}%`
  return fields.map((f) => `${f}.ilike.${needle}`).join(',')
}

// Wraps a Supabase range query to add total count + page metadata in one shot.
export async function runPaged(supabase, baseQuery, query, options = {}) {
  const { page, pageSize, start, end } = parsePagination(query)
  const orderBy = options.orderBy || 'created_at'
  const ascending = options.ascending === true

  const { data, error, count } = await baseQuery
    .order(orderBy, { ascending })
    .range(start, end)
    .select('*', { count: 'exact' })

  if (error) return { error }

  return {
    data: {
      rows: data || [],
      total: count || 0,
      page,
      pageSize,
    },
  }
}

// Applies an .or() ilike filter to a query (server-side search across text fields).
export function applySearchFilter(query, searchExpr) {
  return searchExpr ? query.or(searchExpr) : query
}
