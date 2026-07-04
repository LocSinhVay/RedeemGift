import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Check, Copy, Eye, Trophy } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { FilterBar } from '@/components/FilterBar'
import { SearchableComboBox } from '@/components/SearchableComboBox'

import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'
import {
    getCustomerSpinPagedList,
    getWinningsPagedList,
} from '@/controllers/CustomerSpinController'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { Badge } from '@/components/ui/badge'

/* ================= TYPES ================= */

interface HistorySpin {
    SpinGrantID: number
    QRCode: string
    CustomerName: string
    PhoneNumber: string
    ProjectCode: string
    SpinsGranted: number
    SpinsUsed: number
    BillValue: number
    SpinsRemaining: number
    BillImagePath: string
}

interface Winning {
    WinningID: number
    PrizeName: string
    WonAt: string
}

/* ================= OVERLAYS ================= */

const DialogOverlayCustom = ({
    visible,
    onClose,
    disabled,
}: {
    visible: boolean
    onClose: () => void
    disabled?: boolean
}) => {
    if (!visible) return null

    return (
        <div
            className="fixed inset-0 z-[40] bg-black/50"
            onClick={() => {
                if (!disabled) onClose()
            }}
        />
    )
}

/* ================= PAGE ================= */

const HistorySpinPage = () => {
    const { auth } = useAuth()

    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [selectedSpin, setSelectedSpin] = useState<HistorySpin | null>(null)
    const [showWinningsModal, setShowWinningsModal] = useState(false)

    const [previewType, setPreviewType] = useState<'qr' | 'image' | null>(null)
    const [isCopiedQrLink, setIsCopiedQrLink] = useState(false)

    const [sortKey, setSortKey] = useState<'PrizeName' | 'WonAt'>('WonAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const { visibleProjects, isAll } = useProjects(true)

    useEffect(() => {
        if (!isAll && auth?.SelectedProject) {
            setProjectFilter(auth.SelectedProject)
        }
    }, [isAll, auth?.SelectedProject])

    const baseUrl =
        import.meta.env.VITE_REACT_APP_BASE_URL || window.location.origin

    const qrData = selectedSpin
        ? `${baseUrl}/${selectedSpin.QRCode}`
        : ''

    const handleCopyQrLink = useCallback(async () => {
        if (!qrData) return

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(qrData)
            } else {
                const textarea = document.createElement('textarea')
                textarea.value = qrData
                textarea.style.position = 'fixed'
                textarea.style.opacity = '0'
                document.body.appendChild(textarea)
                textarea.select()
                document.execCommand('copy')
                document.body.removeChild(textarea)
            }

            setIsCopiedQrLink(true)
            toast.success('Đang sao chép')
            window.setTimeout(() => setIsCopiedQrLink(false), 1500)
        } catch {
            toast.error('Khong the copy link vong quay')
        }
    }, [qrData])

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value)
        setPage(1)
    }, [])

    const handleViewWinnings = (spin: HistorySpin) => {
        setSelectedSpin(spin)
        setShowWinningsModal(true)
    }

    const handleSort = (key: 'PrizeName' | 'WonAt') => {
        if (sortKey === key) {
            setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortOrder('asc')
        }
    }

    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        params.set('pageSize', pageSize.toString())
        params.set('offset', ((page - 1) * pageSize).toString())
        if (searchTerm) params.set('keySearch', searchTerm)
        if (projectFilter) params.set('projectCode', projectFilter)
        return params.toString()
    }, [page, pageSize, searchTerm, projectFilter])

    const { data, isLoading } = useQuery({
        queryKey: ['historySpin', queryString],
        queryFn: () => getCustomerSpinPagedList(queryString),
    })

    const { data: winningsData } = useQuery({
        queryKey: ['winnings', selectedSpin?.QRCode],
        queryFn: () =>
            getWinningsPagedList(`qrCode=${selectedSpin?.QRCode}&pageSize=1000&offset=0`),
        enabled: !!selectedSpin && showWinningsModal,
    })

    const historySpins = (data as any)?.Data || []
    const total = historySpins[0]?.TotalRow || 0
    const winnings = (winningsData as any)?.Data || []

    const sortedWinnings = useMemo(() => {
        return [...winnings].sort((a: Winning, b: Winning) => {
            const result =
                sortKey === 'PrizeName'
                    ? a.PrizeName.localeCompare(b.PrizeName)
                    : new Date(a.WonAt).getTime() - new Date(b.WonAt).getTime()
            return sortOrder === 'asc' ? result : -result
        })
    }, [winnings, sortKey, sortOrder])

    const columns: ColumnDef<HistorySpin>[] = [
        {
            accessorKey: 'QRCode',
            header: 'QR CODE',
        },
        {
            accessorKey: 'CustomerName',
            header: 'TÊN KHÁCH HÀNG',
        },
        {
            accessorKey: 'PhoneNumber',
            header: 'SỐ ĐIỆN THOẠI',
        },
        {
            accessorKey: 'ProjectCode',
            header: 'DỰ ÁN',
        },
        {
            accessorKey: 'SpinsGranted',
            header: 'TỔNG LƯỢT',
            cell: ({ row }) => row.original.SpinsGranted.toLocaleString(),
        },
        {
            accessorKey: 'SpinsUsed',
            header: 'ĐÃ QUAY',
            cell: ({ row }) => row.original.SpinsUsed.toLocaleString(),
        },
        {
            accessorKey: 'BillValue',
            header: 'TỔNG BILL',
            cell: ({ row }) => row.original.BillValue.toLocaleString(),
        },
        {
            id: 'actions',
            header: '#',
            enableSorting: false, // 🚫 không cho sort
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewWinnings(row.original)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ]

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử quay thưởng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FilterBar onSearch={handleSearch} namespace="historySpin">
                        <SearchableComboBox
                            options={visibleProjects}
                            value={projectFilter}
                            onChange={setProjectFilter}
                            placeholder="Chọn dự án"
                            includeAllOption
                            allOptionLabel="Tất cả dự án"
                            disabled={!isAll}
                        />
                    </FilterBar>

                    <DataTable
                        data={historySpins}
                        columns={columns}
                        isLoading={isLoading}
                    />

                    <Pagination
                        pagination={{ total }}
                        isLoading={isLoading}
                        updateState={({ page, pageSize }) => {
                            setPage(page)
                            setPageSize(pageSize)
                        }}
                    />
                </CardContent>
            </Card>

            {/* OVERLAY DIALOG */}
            <DialogOverlayCustom
                visible={showWinningsModal}
                disabled={!!previewType}
                onClose={() => setShowWinningsModal(false)}
            />

            {/* DIALOG */}
            <Dialog
                open={showWinningsModal}
                modal={false}
                onOpenChange={(open) => {
                    // ❌ đang mở Preview → không cho đóng bằng ❌ / ESC
                    if (!open && previewType) return

                    setShowWinningsModal(open)
                }}
            >
                <DialogContent className="max-w-3xl z-[50]">
                    <DialogHeader>
                        <DialogTitle>
                            Chi tiết trúng thưởng – {selectedSpin?.CustomerName} –{' '}
                            {selectedSpin?.PhoneNumber}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="border rounded-md p-4 flex justify-center cursor-pointer"
                            onClick={() => {
                                setIsCopiedQrLink(false)
                                setPreviewType('qr')
                            }}
                        >
                            <QRCode value={qrData} size={160} />
                        </div>

                        <div
                            className="border rounded-md p-2 flex justify-center cursor-pointer"
                            onClick={() => setPreviewType('image')}
                        >
                            <img
                                src={selectedSpin?.BillImagePath}
                                className="w-full h-[160px] object-cover rounded"
                            />
                        </div>
                    </div>
                    {/* Winnings Table */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">Danh sách giải thưởng</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {sortedWinnings.length} giải
                            </Badge>
                        </div>
                        <div className="border rounded-md max-h-[260px] overflow-y-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th
                                            className="p-2 text-left border-b cursor-pointer select-none"
                                            onClick={() => handleSort('PrizeName')}
                                        >
                                            Giải thưởng{' '}
                                            {sortKey === 'PrizeName' && (
                                                <span className="ml-1 text-xs">
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>

                                        <th
                                            className="p-2 text-left border-b border-l cursor-pointer select-none"
                                            onClick={() => handleSort('WonAt')}
                                        >
                                            Thời gian{' '}
                                            {sortKey === 'WonAt' && (
                                                <span className="ml-1 text-xs">
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedWinnings.length ? (
                                        sortedWinnings.map((w) => (
                                            <tr key={w.WinningID} className="border-b">
                                                <td className="p-2">
                                                    {w.PrizeName}
                                                </td>
                                                <td className="p-2 border-l">
                                                    {new Date(w.WonAt).toLocaleString('vi-VN')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="p-4 text-center">
                                                Chưa trúng thưởng
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowWinningsModal(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PREVIEW */}
            {previewType && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
                    onClick={() => setPreviewType(null)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        {previewType === 'qr' && (
                            <div className="flex flex-col items-center border rounded-lg bg-white shadow-sm px-6 py-5">
                                {/* QR */}
                                <div className="flex justify-center">
                                    <QRCode value={qrData || ''} size={360} />
                                </div>

                                {/* URL */}
                                <div className="mt-4 flex w-full max-w-[360px] items-center gap-2 rounded-lg bg-muted p-3">
                                    <p className="min-w-0 flex-1 text-xs text-muted-foreground text-center break-all font-mono">
                                        {qrData}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 bg-white"
                                        onClick={handleCopyQrLink}
                                        title="Copy link vong quay"
                                        aria-label="Copy link vong quay"
                                    >
                                        {isCopiedQrLink ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                        {previewType === 'image' && (
                            <img
                                src={selectedSpin?.BillImagePath}
                                className="max-w-[90vw] max-h-[90vh] rounded-xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export { HistorySpinPage }
