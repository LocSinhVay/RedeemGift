import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import Swal from 'sweetalert2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { FilterBar } from '@/components/FilterBar';
import { StatusSelect } from '@/components/StatusSelect';
import { StatusBadge } from '@/components/StatusBadge';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { ActionDropdown, createEditAction, createDeleteAction } from '@/components/ActionDropdown';
import { getMenuPagedList, getAllMenu, insertMenu, updateMenu, deleteMenu } from '@/controllers/MenuController';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { allowPositiveNumbersOnly } from '@/hooks/allowPositiveNumbersOnly';

// Get icon component from icon name string
const getIconByName = (iconName?: string): LucideIcon | null => {
  if (!iconName) return null;

  const cleanName = iconName.trim();

  if (cleanName in LucideIcons) {
    const Icon = (LucideIcons as Record<string, unknown>)[cleanName];
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      return Icon as LucideIcon;
    }
  }

  const pascalCase = cleanName
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  if (pascalCase in LucideIcons) {
    const Icon = (LucideIcons as Record<string, unknown>)[pascalCase];
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      return Icon as LucideIcon;
    }
  }

  return null;
};

interface Menu {
  MenuID: number;
  MenuName: string;
  MenuPath: string;
  Icon?: string;
  ParentId?: number | null;
  MenuParentName?: string;
  Status: boolean;
  DisplayOrder: number;
}

const MenuPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    MenuName: '',
    MenuPath: '',
    Icon: '',
    ParentId: '',
    Status: true,
    DisplayOrder: 1,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('pageSize', pageSize.toString());
    params.set('offset', ((page - 1) * pageSize).toString());
    if (searchTerm) params.set('keySearch', searchTerm);
    if (statusFilter) params.set('status', statusFilter);
    return params.toString();
  }, [page, pageSize, searchTerm, statusFilter]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['menus-list', queryString],
    queryFn: () => getMenuPagedList(queryString),
  });

  const { data: allMenusData } = useQuery({
    queryKey: ['allMenus-parent'],
    queryFn: () => getAllMenu(),
  });

  const menus = (data as any)?.Data || [];
  const total = menus[0]?.TotalRow || 0;
  const parentMenus: Menu[] = Array.isArray((allMenusData as any)?.Data) ? (allMenusData as any)?.Data : [];

  const parentMenuOptions = parentMenus
    .filter((m: Menu) => m.MenuID !== editingMenu?.MenuID)
    .map((m: Menu) => ({ value: m.MenuID.toString(), label: m.MenuName }));

  const handleOpenModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        MenuName: menu.MenuName || '',
        MenuPath: menu.MenuPath || '',
        Icon: menu.Icon || '',
        ParentId: menu.ParentId?.toString() || '',
        Status: menu.Status,
        DisplayOrder: menu.DisplayOrder,
      });
    } else {
      setEditingMenu(null);
      setFormData({ MenuName: '', MenuPath: '', Icon: '', ParentId: '', Status: true, DisplayOrder: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.MenuName.trim()) {
      toast.error('Vui lòng nhập tên menu')
      return
    }

    try {
      const fd = new FormData();
      if (editingMenu) fd.append('MenuID', editingMenu.MenuID.toString());
      fd.append('MenuName', formData.MenuName);
      fd.append('MenuPath', formData.MenuPath);
      fd.append('Icon', formData.Icon);
      if (formData.ParentId) fd.append('ParentId', formData.ParentId);
      fd.append('Status', formData.Status ? '1' : '0');
      fd.append('DisplayOrder', formData.DisplayOrder.toString());

      if (editingMenu) {
        const response = await updateMenu(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại');
          return;
        }
        toast.success(response?.Message || 'Cập nhật thành công');
      } else {
        const response = await insertMenu(fd);
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

  const handleDelete = async (menu: Menu) => {
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
      const response = await deleteMenu(menu.MenuID);
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

  const columns: ColumnDef<Menu>[] = [
    {
      accessorKey: 'MenuName',
      header: 'TÊN MENU',
    },
    {
      accessorKey: 'MenuPath',
      header: 'ĐƯỜNG DẪN',
    },
    {
      accessorKey: 'Icon',
      header: 'ICON',
      enableSorting: false, // icon không cần sort
      cell: ({ row }) => {
        const iconName = row.original.Icon
        const Icon = getIconByName(iconName)

        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-sm text-muted-foreground">
              {iconName || '-'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'MenuParentName',
      header: 'MENU CHA',
    },
    {
      accessorKey: 'DisplayOrder',
      header: 'THỨ TỰ',
    },
    {
      accessorKey: 'Status',
      header: 'TÌNH TRẠNG',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.Status} />
      ),
    },
    {
      id: 'actions',
      header: '#',
      enableSorting: false, // 🚫 không sort cột thao tác
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
      <CardHeader className="pb-4">
        <CardTitle>Quản lý Menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar
          onSearch={handleSearch}
          namespace="menu"
          onAdd={() => handleOpenModal()}
        >
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>

        <DataTable data={menus} columns={columns} isLoading={isLoading} />
        <Pagination pagination={{ total }} isLoading={isLoading} updateState={({ page, pageSize }) => { setPage(page); setPageSize(pageSize); }} />
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingMenu ? 'Cập nhật' : 'Thêm'} Menu</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="required font-bold">Tên menu</Label><Input value={formData.MenuName} onChange={(e) => setFormData({ ...formData, MenuName: e.target.value })} /></div>
            <div><Label>Đường dẫn</Label><Input value={formData.MenuPath} onChange={(e) => setFormData({ ...formData, MenuPath: e.target.value })} placeholder="/path" /></div>
            <div><Label>Icon (tên lucide icon)</Label><Input value={formData.Icon} onChange={(e) => setFormData({ ...formData, Icon: e.target.value })} placeholder="Home, Users, Gift..." /></div>
            <div><Label>Menu cha</Label>
              <SearchableComboBox
                options={parentMenuOptions}
                value={formData.ParentId}
                onChange={(v) => setFormData({ ...formData, ParentId: v })}
                placeholder="Không có"
                includeAllOption
                allOptionLabel="Không có"
                className="w-full"
              />
            </div>
            {/* <div><Label>Thứ tự</Label><Input type="number" min={0} value={formData.DisplayOrder} onChange={(e) => setFormData({ ...formData, DisplayOrder: +e.target.value })} /></div> */}
            <div>
              <Label>Thứ tự</Label>
              <Input
                type="text"
                // value={formData.DisplayOrder}
                value={
                  formData.DisplayOrder
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    DisplayOrder: Number(
                      allowPositiveNumbersOnly(e.target.value).replace(/,/g, '')
                    ),
                  })
                }
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Label>Kích hoạt</Label>
              <Switch
                checked={formData.Status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, Status: checked })
                }
              />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowModal(false)}>Đóng</Button><Button onClick={handleSave}>{editingMenu ? 'Cập nhật' : 'Thêm mới'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { MenuPage };
