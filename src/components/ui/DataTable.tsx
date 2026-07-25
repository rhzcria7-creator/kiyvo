'use client'

// ─────────────────────────────────────────────────────────────
// Data Table v0.0.1 — Sorting, filtering, pagination, row selection
// TanStack-like custom, server-side ready
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (selected: string[]) => void
  loading?: boolean
  emptyMessage?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  pageSize = 20,
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter
  const filtered = useMemo(() => {
    let result = data

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(item =>
        columns.some(col => {
          const val = item[col.key]
          return val && String(val).toLowerCase().includes(q)
        })
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => {
          const val = item[key]
          return val && String(val).toLowerCase().includes(value.toLowerCase())
        })
      }
    })

    return result
  }, [data, search, filters, columns])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1

      const cmp = typeof aVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal))

      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectionChange?.(Array.from(next))
      return next
    })
  }, [onSelectionChange])

  const toggleAll = useCallback(() => {
    if (selected.size === paginated.length) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const all = new Set(paginated.map(keyExtractor))
      setSelected(all)
      onSelectionChange?.(Array.from(all))
    }
  }, [paginated, keyExtractor, onSelectionChange])

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar..."
          className="w-full h-10 pl-10 pr-4 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50">
              {selectable && (
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={clsx(
                    'p-3 font-medium text-xs text-zinc-500 uppercase tracking-wider',
                    col.sortable && 'cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-zinc-300">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                  {selectable && <td className="p-3"><div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" /></td>}
                  {columns.map(col => (
                    <td key={col.key} className="p-3"><div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-12 text-center text-zinc-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => {
                const id = keyExtractor(item)
                return (
                  <tr
                    key={id}
                    className={clsx(
                      'border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors',
                      selected.has(id) && 'bg-zinc-50 dark:bg-zinc-900/50'
                    )}
                  >
                    {selectable && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleSelect(id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={clsx(
                          'p-3 text-sm text-zinc-700 dark:text-zinc-300',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                        )}
                      >
                        {col.render ? col.render(item) : item[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            {sorted.length} registro(s) • Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const p = start + i
              if (p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-xs font-medium',
                    p === page
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {p}
                </button>
              )
            }).filter(Boolean)}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
