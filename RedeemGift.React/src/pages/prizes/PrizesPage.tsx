import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { FilterBar } from '@/components/FilterBar'
import { SearchableComboBox } from '@/components/SearchableComboBox'
import {
  ActionDropdown, createEditAction, createDeleteAction,
} from '@/components/ActionDropdown'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'
import {
  getPrizePagedList,
  insertPrize,
  updatePrize,
  deletePrize,
} from '@/controllers/PrizesController'
import { toast } from 'sonner'
import { usePrizesByProject } from '@/hooks/usePrizesByProject'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusSelect } from '@/components/StatusSelect'

/* ================= TYPES ================= */

interface Prize {
  PrizeID: number;
  ProjectCode: string;
  GiftID: number;
  Quantity?: number;
  IsUnlimited?: boolean;
  Weight?: number;
  RemainingWeight?: number;
  IsActive: boolean;
}

const initialFormData = {
  PrizeID: 0,
  ProjectCode: '',
  GiftID: 0,
  Quantity: 0,
  Weight: 0,
  RemainingWeight: 0,
}

/* ================= PAGE ================= */

const PrizesPage = () => {
  const { auth } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [showModal, setShowModal] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)

  const { visibleProjects, defaultProject, isAll } = useProjects(true)
  const [formData, setFormData] = useState(initialFormData)
  const [giftID, setGiftID] = useState<string>('')

  // ✅ Lấy danh sách giải thưởng theo dự án đang chọn
  const prizesByProject = usePrizesByProject(formData.ProjectCode)

  const isEdit = useMemo(() => !!editingPrize, [editingPrize])

  // Auto-set project filter when user has project restrictions
  useEffect(() => {
    if (!isAll && auth?.SelectedProject) {
      setProjectFilter(auth.SelectedProject)
    }
  }, [isAll, auth?.SelectedProject])

  /* ================= LOAD LIST ================= */

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    p.set('pageSize', pageSize.toString())
    p.set('offset', ((page - 1) * pageSize).toString())
    if (searchTerm) p.set('keySearch', searchTerm)
    if (projectFilter) p.set('projectCode', projectFilter)
    if (statusFilter) p.set('status', statusFilter);
    return p.toString()
  }, [page, pageSize, searchTerm, projectFilter, statusFilter])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['prizes', queryString],
    queryFn: () => getPrizePagedList(queryString),
  })

  const prizes = (data as any)?.Data || []
  const total = prizes[0]?.TotalRow || 0

  /* ================= MODAL ================= */

  const openModal = (prize?: Prize) => {
    if (prize) {
      setEditingPrize(prize);
      setFormData({
        PrizeID: prize.PrizeID,
        ProjectCode: prize.ProjectCode,
        GiftID: prize.GiftID,
        Quantity: prize.Quantity ?? 0,
        Weight: prize.Weight ?? 0,
        RemainingWeight: prize.RemainingWeight ?? 0,
      })
    } else {
      setEditingPrize(null)
      setFormData({
        ...initialFormData,
        ProjectCode: String(defaultProject?.value || ''),
      })
    }
    setShowModal(true)
  }

  // ✅ Khi load xong danh sách giải thưởng => gán lại GiftID nếu đang edit
  useEffect(() => {
    if (isEdit && editingPrize && prizesByProject.length > 0) {
      const found = prizesByProject.find(
        (p: any) => p.value === String(editingPrize.GiftID)
      )
      setGiftID(found?.value || '')
    }
  }, [isEdit, editingPrize, prizesByProject])

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleWeightChange = (value: string) => {
    const numericValue = Number(value.replace(/,/g, '')) || 0

    // ✅ Tính giới hạn hợp lệ
    const maxAllowed = isEdit
      ? (formData.RemainingWeight ?? 0) + (editingPrize?.Weight ?? 0)
      : formData.RemainingWeight ?? 0

    // ✅ Không cho vượt quá giới hạn
    if (numericValue > maxAllowed) return

    handleChange('Weight', numericValue)
  }

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!formData.ProjectCode) {
      toast.error('Vui lòng chọn dự án')
      return
    }
    if (!formData.GiftID || formData.GiftID === 0) {
      toast.error('Vui lòng chọn giải thưởng')
      return
    }
    if (!formData.Weight || formData.Weight <= 0) {
      toast.error('Tỷ trọng không hợp lệ')
      return
    }

    try {
      const fd = new FormData()
      if (isEdit) {
        fd.append('PrizeID', String(formData.PrizeID))
      }
      fd.append('ProjectCode', formData.ProjectCode)
      fd.append('GiftID', String(formData.GiftID))
      fd.append('Weight', String(formData.Weight))

      const response = isEdit ? await updatePrize(fd) : await insertPrize(fd)
      if (response?.Status && response.Status !== 'Success') {
        toast.error(response?.Message || (isEdit ? 'Cập nhật thất bại' : 'Thêm mới thất bại'))
        return
      }

      toast.success(response?.Message || (isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công'))
      setShowModal(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (prize: Prize) => {
    try {
      const response = await deletePrize(prize.PrizeID)
      if (response?.Status && response.Status !== 'Success') {
        toast.error(response?.Message || 'Xóa thất bại')
        return
      }
      toast.success(response?.Message || 'Xóa thành công')
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    }
  }

  /* ================= TABLE ================= */

  const columns: ColumnDef<Prize>[] = [
    {
      accessorKey: 'PrizeName',
      header: 'GIẢI THƯỞNG',
    },
    {
      accessorKey: 'ProjectCode',
      header: 'DỰ ÁN',
    },
    {
      accessorKey: 'Quantity',
      header: 'SỐ LƯỢNG TỒN',
      cell: ({ row }) => {
        const { Quantity, IsUnlimited } = row.original

        if (IsUnlimited) {
          return (
            <span className="text-green-600 font-semibold">
              Không giới hạn
            </span>
          )
        }

        return Quantity.toLocaleString()
      },
    },
    {
      accessorKey: 'Weight',
      header: 'TRỌNG SỐ (%)',
    },
    {
      accessorKey: 'RemainingWeight',
      header: 'TRỌNG SỐ CÒN LẠI (%)',
    },
    {
      accessorKey: 'IsActive',
      header: 'TÌNH TRẠNG',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.IsActive} />
      ),
    },
    {
      id: 'actions',
      header: '#',
      enableSorting: false, // 🚫 không sort cột action
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            createEditAction(() => openModal(row.original)),
            createDeleteAction(() => handleDelete(row.original)),
          ]}
        />
      ),
    },
  ]

  /* ================= RENDER ================= */

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Tỷ trọng Giải thưởng</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FilterBar onSearch={setSearchTerm} namespace="prizes" onAdd={() => openModal()} >
          <SearchableComboBox
            options={visibleProjects}
            value={projectFilter}
            onChange={setProjectFilter}
            placeholder="Chọn dự án"
            allOptionLabel="Tất cả dự án"
            disabled={!isAll}
          />
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>
        <DataTable data={prizes} columns={columns} isLoading={isLoading} />
        <Pagination
          pagination={{ total }}
          isLoading={isLoading}
          updateState={({ page, pageSize }) => {
            setPage(page)
            setPageSize(pageSize)
          }}
        />
      </CardContent>

      {/* ================= MODAL ================= */}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrize ? 'Cập nhật' : 'Thêm'} Tỷ trọng
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <div>
                <Label className="required font-bold">Dự án</Label>
                <SearchableComboBox
                  options={visibleProjects}
                  value={formData.ProjectCode}
                  disabled={!isAll}
                  onChange={(value) => {
                    handleChange('ProjectCode', value)

                    // reset prize khi đổi dự án
                    setGiftID('')
                    handleChange('GiftID', 0)
                    handleChange('Quantity', 0)
                    handleChange('RemainingWeight', 0)
                    handleChange('Weight', 0)
                  }}
                  placeholder='Chọn dự án'
                  className="w-full"
                />
              </div>

              <div>
                <Label className="font-bold">Số lượng tồn kho</Label>
                <Input value={formData.Quantity.toLocaleString()} disabled />
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <div>
                <Label className="required font-bold">Giải thưởng</Label>
                <SearchableComboBox
                  options={prizesByProject}
                  value={giftID}
                  onChange={(value) => {
                    setGiftID(value)

                    const prize = prizesByProject.find(
                      (p: any) => p.value === value
                    )

                    handleChange('GiftID', Number(value))
                    handleChange('Quantity', prize?.stockQuantity ?? 0)
                    handleChange('RemainingWeight', prize?.remainingWeight ?? 0)
                    handleChange('Weight', 0) // reset weight khi đổi giải thưởng
                  }}
                  placeholder='Chọn giải thưởng'
                  className="w-full"
                />
              </div>

              <div>
                <Label className="required font-bold">
                  Tỷ trọng giải thưởng (%)
                </Label>
                <Input
                  value={formData.Weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                />

                {formData.GiftID > 0 && (
                  <p className="text-sm text-destructive mt-2">
                    * Tỷ trọng phải ≤{' '}
                    {isEdit
                      ? formData.RemainingWeight + (editingPrize?.Weight ?? 0)
                      : formData.RemainingWeight}
                    %
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export { PrizesPage }
