import { QueryState } from './models'

function isNotEmpty(obj: unknown) {
  return obj !== undefined && obj !== null && obj !== ''
}

export function stringifyRequestQuery(state: QueryState): string {
  const pagination = qs.stringifyPagination(state)
  const sort = qs.stringifySort(state)
  const search = qs.stringifySearch(state)
  const filter = qs.stringifyFilter(state)

  return [pagination, sort, search, filter]
    .filter((f) => f)
    .join('&')
    .toLowerCase()
}

const qs = {
  stringifyPagination: (state: QueryState): string => {
    const pageSize = state.pageSize || 10
    const offset = state.offset || 0
    return `pageSize=${pageSize}&offset=${offset}`
  },
  stringifySort: (state: QueryState): string => {
    const sort = state.sort || ''
    const order = state.order || ''
    return sort && order ? `sort=${sort}&order=${order}` : ''
  },
  stringifySearch: (state: QueryState): string => {
    const keySearch = state.keySearch || ''
    return isNotEmpty(keySearch) ? `keySearch=${keySearch}` : ''
  },
  stringifyFilter: (state: QueryState): string => {
    const filter = state.filter as Record<string, unknown>
    if (!filter) return ''
    
    return Object.entries(filter)
      .filter(([, value]) => isNotEmpty(value))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  },
}
