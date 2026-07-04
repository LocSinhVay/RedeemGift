import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { FilterBar } from '@/components/FilterBar';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { StatusSelect } from '@/components/StatusSelect';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionDropdown, createEditAction, createToggleStatusAction } from '@/components/ActionDropdown';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGiftPagedList,
  insertGift,
  updateGift,
  updateGiftStatus,
} from '@/controllers/GiftController';
import { allowPositiveNumbersOnly } from '@/hooks/allowPositiveNumbersOnly';
import { toast } from 'sonner';

interface Gift {
  GiftID: number;
  GiftName: string;
  ProjectCode: string;
  Quantity: number;
  IsUnlimited: boolean;
  IsActive: boolean;
}

const initialFormData = {
  GiftName: '',
  ProjectCode: '',
  Quantity: 0,
  IsUnlimited: false,
}

const GiftPage = () => {
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);

  const [formData, setFormData] = useState(initialFormData)

  const { visibleProjects, defaultProject, isAll } = useProjects(true);

  // Auto-set project filter when user has project restrictions
  useEffect(() => {
    if (!isAll && auth?.SelectedProject) {
      setProjectFilter(auth.SelectedProject);
    }
  }, [isAll, auth?.SelectedProject]);

  // ===== SEARCH =====
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // ===== QUERY STRING =====
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('pageSize', pageSize.toString());
    params.set('offset', ((page - 1) * pageSize).toString());
    if (searchTerm) params.set('keySearch', searchTerm);
    if (projectFilter) params.set('projectCode', projectFilter);
    if (statusFilter) params.set('status', statusFilter);
    return params.toString();
  }, [page, pageSize, searchTerm, projectFilter, statusFilter]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['gifts', queryString],
    queryFn: () => getGiftPagedList(queryString),
  });

  const gifts = (data as any)?.Data || [];
  const total = gifts[0]?.TotalRow || 0;

  // ===== MODAL =====
  const handleOpenModal = (gift?: Gift) => {
    if (gift) {
      setEditingGift(gift);
      setFormData({
        GiftName: gift.GiftName,
        ProjectCode: gift.ProjectCode,
        Quantity: gift.Quantity,
        IsUnlimited: gift.IsUnlimited,
      });
    } else {
      setEditingGift(null);
      setFormData({
        ...initialFormData,
        ProjectCode: String(defaultProject?.value || ''),
      });
    }
    setShowModal(true);
  };

  // ===== SAVE =====
  const handleSave = async () => {
    if (!formData.GiftName.trim()) {
      toast.error('Vui lòng nhập tên quà tặng')
      return
    }
    if (!formData.ProjectCode) {
      toast.error('Vui lòng chọn dự án')
      return
    }

    try {
      const fd = new FormData();
      if (editingGift) fd.append('GiftID', editingGift.GiftID.toString());

      fd.append('GiftName', formData.GiftName);
      fd.append('ProjectCode', formData.ProjectCode);
      fd.append('Quantity', formData.IsUnlimited ? '0' : formData.Quantity.toString());
      fd.append('IsUnlimited', formData.IsUnlimited.toString());

      if (editingGift) {
        const response = await updateGift(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại');
          return;
        }
        toast.success(response?.Message || 'Cập nhật thành công');
      } else {
        const response = await insertGift(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Thêm mới thất bại');
          return;
        }
        toast.success(response?.Message || 'Thêm mới thành công');
      }

      setShowModal(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  // ===== STATUS =====
  const handleToggleStatus = async (gift: Gift) => {
    try {
      const response = await updateGiftStatus({
        id: gift.GiftID,
        status: !gift.IsActive ? 1 : 0,
      });
      if (response?.Status && response.Status !== 'Success') {
        toast.error(response?.Message || 'Cập nhật trạng thái thất bại');
        return;
      }
      toast.success(response?.Message || 'Cập nhật trạng thái thành công');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  // ===== COLUMNS =====
  const columns: ColumnDef<Gift>[] = [
    {
      accessorKey: 'GiftName',
      header: 'TÊN QUÀ TẶNG',
    },
    {
      accessorKey: 'ProjectCode',
      header: 'DỰ ÁN',
    },
    {
      accessorKey: 'Quantity',
      header: 'SỐ LƯỢNG',
      cell: ({ row }) =>
        row.original.IsUnlimited ? (
          <span className="text-green-600 font-semibold">
            Không giới hạn
          </span>
        ) : (
          row.original.Quantity.toLocaleString()
        ),
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
      enableSorting: false, // 🚫 không cho sort cột action
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            createEditAction(() => handleOpenModal(row.original)),
            createToggleStatusAction(() =>
              handleToggleStatus(row.original)
            ),
          ]}
        />
      ),
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Quản lý Quà tặng</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FilterBar
          onSearch={handleSearch}
          namespace="gift"
          onAdd={() => handleOpenModal()}
        >
          <SearchableComboBox
            options={visibleProjects}
            value={projectFilter}
            onChange={setProjectFilter}
            placeholder="Chọn dự án"
            includeAllOption
            allOptionLabel="Tất cả dự án"
            disabled={!isAll}
          />
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>

        <DataTable data={gifts} columns={columns} isLoading={isLoading} />

        <Pagination
          pagination={{ total }}
          isLoading={isLoading}
          updateState={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </CardContent>

      {/* ===== MODAL ===== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGift ? 'Cập nhật' : 'Thêm'} Quà tặng</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="required font-bold">Tên quà tặng</Label>
              <Input
                value={formData.GiftName}
                onChange={(e) =>
                  setFormData({ ...formData, GiftName: e.target.value })
                }
              />
            </div>

            <div>
              <Label className="required font-bold">Dự án</Label>
              <SearchableComboBox
                options={visibleProjects}
                value={formData.ProjectCode}
                onChange={(v) =>
                  setFormData({ ...formData, ProjectCode: v })
                }
                placeholder="Chọn dự án"
                className="w-full"
                disabled={!isAll}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Số lượng</Label>
                <Input
                  type="text"
                  disabled={formData.IsUnlimited}
                  value={allowPositiveNumbersOnly(formData.Quantity.toString())}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Quantity: Number(
                        allowPositiveNumbersOnly(e.target.value).replace(/,/g, '')
                      ),
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  checked={formData.IsUnlimited}
                  onCheckedChange={(c) =>
                    setFormData({
                      ...formData,
                      IsUnlimited: !!c,
                      Quantity: c ? 0 : formData.Quantity,
                    })
                  }
                />
                <Label>Không giới hạn</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
            <Button onClick={handleSave}>
              {editingGift ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { GiftPage };
