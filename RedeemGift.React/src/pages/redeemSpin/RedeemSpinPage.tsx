import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { FilterBar } from '@/components/FilterBar';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { StatusBadge } from '@/components/StatusBadge';
import {
  ActionDropdown,
  createEditAction,
  createDeleteAction,
} from '@/components/ActionDropdown';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import {
  getRedeemSpinPagedList,
  insertRedeemSpin,
  updateRedeemSpin,
  deleteRedeemSpin,
} from '@/controllers/RedeemSpinController';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { allowPositiveNumbersOnly } from '@/hooks/allowPositiveNumbersOnly';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { StatusSelect } from '@/components/StatusSelect';
import Swal from 'sweetalert2';

interface RedeemSpin {
  RuleID: number;
  ProjectCode: string;
  StartDate: string;
  EndDate: string;
  BillValuePerSpin: number;
  MaxSpinsPerBill: number;
  IsActive: boolean;
}

const initialFormData = {
  ProjectCode: '',
  StartDate: new Date(),
  EndDate: new Date(),
  BillValuePerSpin: 0,
  MaxSpinsPerBill: 1,
}

const formatDateToString = (date: Date | null) =>
  date ? format(date, 'yyyy-MM-dd') : '';

const RedeemSpinPage = () => {
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RedeemSpin | null>(null);

  const [formData, setFormData] = useState(initialFormData)

  const { visibleProjects, defaultProject, isAll } = useProjects(true);

  // Auto-set project filter when user has project restrictions
  useEffect(() => {
    if (!isAll && auth?.SelectedProject) {
      setProjectFilter(auth.SelectedProject);
    }
  }, [isAll, auth?.SelectedProject]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

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
    queryKey: ['redeemSpin', queryString],
    queryFn: () => getRedeemSpinPagedList(queryString),
  });

  const rules = (data as any)?.Data || [];
  const total = rules[0]?.TotalRow || 0;

  const handleOpenModal = (rule?: RedeemSpin) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        ProjectCode: rule.ProjectCode,
        StartDate: rule.StartDate ? new Date(rule.StartDate) : null,
        EndDate: rule.EndDate ? new Date(rule.EndDate) : null,
        BillValuePerSpin: rule.BillValuePerSpin,
        MaxSpinsPerBill: rule.MaxSpinsPerBill,
      });
    } else {
      setEditingRule(null);
      setFormData({
        ...initialFormData,
        ProjectCode: String(defaultProject?.value || ''),
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.ProjectCode) {
      toast.error('Vui lòng chọn dự án')
      return
    }
    if (!formData.BillValuePerSpin || formData.BillValuePerSpin === 0) {
      toast.error('Vui lòng nhập giá trị hóa đơn')
      return
    }

    if (!formData.MaxSpinsPerBill || formData.MaxSpinsPerBill === 0) {
      toast.error('Vui lòng nhập số lượt tối đa')
      return
    }

    try {
      const fd = new FormData();
      if (editingRule) fd.append('RuleID', editingRule.RuleID.toString());
      fd.append('ProjectCode', formData.ProjectCode);
      fd.append('StartDate', formatDateToString(formData.StartDate));
      fd.append('EndDate', formatDateToString(formData.EndDate));
      fd.append('BillValuePerSpin', formData.BillValuePerSpin.toString());
      fd.append('MaxSpinsPerBill', formData.MaxSpinsPerBill.toString());

      if (editingRule) {
        const response = await updateRedeemSpin(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại');
          return;
        }
        toast.success(response?.Message || 'Cập nhật thành công');
      } else {
        const response = await insertRedeemSpin(fd);
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

  const handleDelete = async (rule: RedeemSpin) => {
    //   if (!confirm('Bạn có chắc muốn xóa?')) return;
    //   try {
    //     await deleteRedeemSpin(rule.RuleID);
    //     toast.success('Xóa thành công');
    //     refetch();
    //   } catch {
    //     toast.error('Có lỗi xảy ra');
    //   }
    // };

    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc muốn xóa?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      const response = await deleteRedeemSpin(rule.RuleID);
      if (response?.Status && response.Status !== 'Success') {
        toast.error(response?.Message || 'Xóa thất bại');
        return;
      }
      toast.success(response?.Message || 'Xóa thành công');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  const columns: ColumnDef<RedeemSpin>[] = [
    {
      accessorKey: 'ProjectCode',
      header: 'DỰ ÁN',
    },
    {
      accessorKey: 'StartDate',
      header: 'TỪ NGÀY',
      cell: ({ row }) =>
        format(new Date(row.original.StartDate), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'EndDate',
      header: 'ĐẾN NGÀY',
      cell: ({ row }) =>
        format(new Date(row.original.EndDate), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'BillValuePerSpin',
      header: 'GIÁ TRỊ (VNĐ)',
      cell: ({ row }) =>
        row.original.BillValuePerSpin.toLocaleString(),
    },
    {
      accessorKey: 'MaxSpinsPerBill',
      header: 'SỐ LƯỢT TỐI ĐA',
      cell: ({ row }) =>
        row.original.MaxSpinsPerBill.toLocaleString(),
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
            createEditAction(() => handleOpenModal(row.original)),
            createDeleteAction(() => handleDelete(row.original)),
          ]}
        />
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quy tắc đổi lượt quay</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FilterBar
          onSearch={handleSearch}
          namespace="redeemSpin"
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

        <DataTable data={rules} columns={columns} isLoading={isLoading} />
        <Pagination
          pagination={{ total }}
          isLoading={isLoading}
          updateState={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Cập nhật' : 'Thêm'} Quy tắc
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Từ ngày</Label>
                <DatePicker
                  selected={formData.StartDate}
                  onChange={(d) =>
                    setFormData({ ...formData, StartDate: d })
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Từ ngày"
                  maxDate={formData.EndDate || undefined}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <Label>Đến ngày</Label>
                <DatePicker
                  selected={formData.EndDate}
                  onChange={(d) =>
                    setFormData({ ...formData, EndDate: d })
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Đến ngày"
                  minDate={formData.StartDate || undefined}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <Label className="required font-bold">Giá trị hóa đơn (VNĐ)</Label>
              <Input
                type="text"
                value={allowPositiveNumbersOnly(
                  formData.BillValuePerSpin.toString()
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    BillValuePerSpin: Number(
                      allowPositiveNumbersOnly(e.target.value).replace(/,/g, '')
                    ),
                  })
                }
                autoFocus={true}
              />
            </div>

            <div>
              <Label className="required font-bold">Số lượt tối đa</Label>
              <Input
                type="text"
                value={allowPositiveNumbersOnly(
                  formData.MaxSpinsPerBill.toString()
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    MaxSpinsPerBill: Number(
                      allowPositiveNumbersOnly(e.target.value).replace(/,/g, '')
                    ),
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
            <Button onClick={handleSave}>
              {editingRule ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { RedeemSpinPage };
