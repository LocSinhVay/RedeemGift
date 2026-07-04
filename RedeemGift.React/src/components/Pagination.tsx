import { useState, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [5, 10, 30, 50, 100] as const
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number]

interface PaginationProps {
  pagination: {
    total: number
  }
  isLoading: boolean
  updateState: (state: { page: number; pageSize: PageSizeOption; offset: number }) => void
  defaultPageSize?: PageSizeOption
}

export const Pagination = ({
  pagination,
  isLoading,
  updateState,
  defaultPageSize = 10,
}: PaginationProps) => {
  const { total } = pagination

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(defaultPageSize)

  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    if (pageSize !== defaultPageSize) {
      setPageSize(defaultPageSize)
      setPage(1)
      updateState({ page: 1, pageSize: defaultPageSize, offset: 0 })
    }
  }, [defaultPageSize])

  const calculateOffset = useCallback((newPage: number, size: PageSizeOption) => {
    return (newPage - 1) * size
  }, [])

  const updatePage = useCallback(
    (newPage: number) => {
      if (isLoading || newPage === page || newPage < 1 || newPage > totalPages) return

      const newOffset = calculateOffset(newPage, pageSize)
      setPage(newPage)
      updateState({ page: newPage, pageSize, offset: newOffset })
    },
    [isLoading, page, pageSize, totalPages, calculateOffset, updateState]
  )

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = parseInt(value, 10) as PageSizeOption
      setPageSize(newSize)
      setPage(1)
      updateState({ page: 1, pageSize: newSize, offset: 0 })
    },
    [updateState]
  )

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, '...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }

    return pages
  }, [page, totalPages])

  if (total === 0) return null

  // ✅ RANGE DÒNG ĐANG HIỂN THỊ
  const fromRow = (page - 1) * pageSize + 1
  const toRow = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Hiển thị</span>

        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span>
          Hiển từ {fromRow} đến {toRow} / Tổng {total} bản ghi
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(1)}
          disabled={page === 1 || isLoading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(page - 1)}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((p, idx) =>
          typeof p === 'number' ? (
            <Button
              key={idx}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => updatePage(p)}
              disabled={isLoading}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">
              {p}
            </span>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(page + 1)}
          disabled={page === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(totalPages)}
          disabled={page === totalPages || isLoading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
