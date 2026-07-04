import { useState, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { FilterBar } from '@/components/FilterBar';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { SearchableMultiComboBox } from '@/components/SearchableMultiComboBox';
import { StatusSelect } from '@/components/StatusSelect';
import { useProjects } from '@/hooks/useProjects';
import { useRoles } from '@/hooks/useRoles';
import { getUserSystemPagedList, getAllRole, getNewUsername, insertUserSystem, updateUserSystem, deleteUserSystem, resetPassword, exportUserSystem } from '@/controllers/UserSystemController';
import { exportFile } from '@/hooks/exportFile';
import { allowPositiveNumbersOnly } from '@/hooks/allowPositiveNumbersOnly';
import { Pencil, Trash2, KeyRound, MoreHorizontal, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import Swal from 'sweetalert2';

interface User {
  UserID: number;
  Username: string;
  FullName: string;
  Email: string;
  Phone: string;
  RoleID: number;
  RoleName: string;
  ProjectCodes: string;
  Status: boolean;
  StatusName: string;
  AvatarImage?: string;
  SupCode?: string;
  SupName?: string;
}

interface Role {
  RoleID: number;
  RoleName: string;
  Symbol?: string;
}

interface FormDataType {
  FullName: string;
  Email: string;
  Phone: string;
  RoleID: number;
  ProjectCodes: string[];
  Status: boolean;
  AvatarFile: File | null;
  AvatarPreview: string;
}

const UserSystemPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    FullName: '',
    Email: '',
    Phone: '',
    RoleID: 0,
    ProjectCodes: [],
    Status: true,
    AvatarFile: null,
    AvatarPreview: '',
  });
  const [generatedUsername, setGeneratedUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { visibleProjects } = useProjects(true);
  const roles = useRoles(true);

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
    if (roleFilter) params.set('roleId', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    return params.toString();
  }, [page, pageSize, searchTerm, projectFilter, roleFilter, statusFilter]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userSystem', queryString],
    queryFn: () => getUserSystemPagedList(queryString),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getAllRole(),
  });

  const users = (data as any)?.Data || [];
  const total = users[0]?.TotalRow || 0;
  const rolesList: Role[] = Array.isArray((rolesData as any)?.Data) ? (rolesData as any)?.Data : [];

  const roleOptions = rolesList.map((r: Role) => ({ value: r.RoleID.toString(), label: r.RoleName }));

  const handleOpenModal = async (user?: User) => {
    if (user) {
      setEditingUser(user);
      setGeneratedUsername(user.Username);
      setFormData({
        FullName: user.FullName || '',
        Email: user.Email || '',
        Phone: user.Phone || '',
        RoleID: user.RoleID || 0,
        ProjectCodes: user.ProjectCodes ? user.ProjectCodes.split(',').filter(Boolean) : [],
        Status: user.Status,
        AvatarFile: null,
        AvatarPreview: user.AvatarImage || '',
      });
    } else {
      setEditingUser(null);
      setGeneratedUsername('');
      setFormData({
        FullName: '',
        Email: '',
        Phone: '',
        RoleID: rolesList[0]?.RoleID || 0,
        ProjectCodes: [],
        Status: true,
        AvatarFile: null,
        AvatarPreview: '',
      });
      // Generate new username
      const selectedRole = rolesList[0];
      if (selectedRole?.Symbol) {
        try {
          const result = await getNewUsername(selectedRole.Symbol) as any;
          if (result?.Data) {
            setGeneratedUsername(result.Data);
          }
        } catch (error) {
          console.error('Error generating username:', error);
        }
      }
    }
    setShowModal(true);
  };

  const handleRoleChange = async (roleId: string) => {
    const role = rolesList.find(r => r.RoleID === +roleId);
    setFormData({ ...formData, RoleID: +roleId });

    // Generate new username when role changes (only for new users)
    if (!editingUser && role?.Symbol) {
      try {
        const result = await getNewUsername(role.Symbol) as any;
        if (result?.Data) {
          setGeneratedUsername(result.Data);
        }
      } catch (error) {
        console.error('Error generating username:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          AvatarFile: file,
          AvatarPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({
      ...formData,
      AvatarFile: null,
      AvatarPreview: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.FullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }

    try {
      const fd = new FormData();
      if (editingUser) {
        fd.append('UserID', editingUser.UserID.toString());
        fd.append('Username', editingUser.Username); // Keep original username on edit
      } else {
        fd.append('Username', generatedUsername);
      }
      fd.append('FullName', formData.FullName);
      fd.append('Email', formData.Email);
      fd.append('Phone', formData.Phone);
      fd.append('RoleID', formData.RoleID.toString());
      fd.append('ProjectCodes', formData.ProjectCodes.join(','));
      // fd.append('Status', formData.Status.toString());
      fd.append('Status', formData.Status ? '1' : '0');
      if (formData.AvatarFile) {
        fd.append('File', formData.AvatarFile);
      }

      if (editingUser) {
        const response = await updateUserSystem(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại');
          return;
        }
        toast.success(response?.Message || 'Cập nhật thành công');
      } else {
        const response = await insertUserSystem(fd);
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

  const handleDelete = async (user: User) => {
    //   if (!confirm('Bạn có chắc muốn xóa?')) return;
    //   try {
    //     await deleteUserSystem(user.UserID);
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
      const response = await deleteUserSystem(user.UserID);
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

  const handleResetPassword = async (user: User) => {
    const result = await Swal.fire({
      title: 'Xác nhận reset mật khẩu',
      text: 'Bạn có chắc muốn reset mật khẩu?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Reset',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      const response = await resetPassword(user.UserID);
      if (response?.Status && response.Status !== 'Success') {
        toast.error(response?.Message || 'Reset mật khẩu thất bại');
        return;
      }
      toast.success(response?.Message || 'Reset mật khẩu thành công');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  const handleExport = () => {
    const params = {
      keySearch: searchTerm || '',
      projectCode: projectFilter?.toString() ?? '',
      roleID: roleFilter ? Number(roleFilter) : -1,
      status: statusFilter ? Number(statusFilter) : -1,
    };

    exportFile(exportUserSystem, params, 'DanhSachNguoiDung.xlsx');
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'FullName',
      header: 'NHÂN VIÊN',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.original.AvatarImage}
              alt={row.original.FullName}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.FullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-medium">{row.original.FullName}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.Username}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'RoleName',
      header: 'QUYỀN',
    },
    {
      accessorKey: 'Email',
      header: 'EMAIL',
    },
    {
      accessorKey: 'Phone',
      header: 'SĐT',
    },
    {
      accessorKey: 'ProjectCodes',
      header: 'DỰ ÁN',
      cell: ({ row }) => row.original.ProjectCodes || '-',
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              Thao tác
              <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 bg-background border shadow-lg z-50"
          >
            <DropdownMenuItem
              onClick={() => handleOpenModal(row.original)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleResetPassword(row.original)}
              className="cursor-pointer"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Reset mật khẩu
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="cursor-pointer text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Quản lý Người dùng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters row */}
        <FilterBar
          onSearch={handleSearch}
          namespace="userSystem"
          onAdd={() => handleOpenModal()}
          onExport={handleExport}
          showExport
        >
          <SearchableComboBox
            options={visibleProjects}
            value={projectFilter}
            onChange={setProjectFilter}
            placeholder="Chọn dự án"
            includeAllOption
            allOptionLabel="Tất cả dự án"
          />
          <SearchableComboBox
            options={roles}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Chọn quyền"
            includeAllOption
            allOptionLabel="Tất cả quyền"
            className="w-44"
          />
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>

        <DataTable data={users} columns={columns} isLoading={isLoading} />

        <Pagination
          pagination={{ total }}
          isLoading={isLoading}
          updateState={({ page, pageSize }) => { setPage(page); setPageSize(pageSize); }}
        />
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingUser ? 'Cập nhật' : 'Thêm'} Người dùng</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <Label>Ảnh đại diện</Label>
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.AvatarPreview} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {formData.FullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {formData.AvatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Chọn ảnh
              </Button>
            </div>

            {/* Username (read-only for edit, auto-generated for new) */}
            <div>
              <Label>Tên đăng nhập</Label>
              <Input value={generatedUsername} disabled className="bg-muted" />
            </div>

            <div>
              <Label className="required font-bold">Họ tên</Label>
              <Input value={formData.FullName} onChange={(e) => setFormData({ ...formData, FullName: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} />
            </div>
            <div>
              <Label>SĐT</Label>
              <Input
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: allowPositiveNumbersOnly(e.target.value, 'phone') })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <Label>Quyền</Label>
              <SearchableComboBox
                options={roleOptions}
                value={formData.RoleID.toString()}
                onChange={handleRoleChange}
                placeholder="Chọn quyền"
                className="w-full"
              />
            </div>
            {/* Chỉ hiển thị dự án khi RoleID != 1 (không phải Admin) */}
            {formData.RoleID !== 1 && (
              <div>
                <Label>Dự án</Label>
                <SearchableMultiComboBox
                  options={visibleProjects}
                  value={formData.ProjectCodes}
                  onChange={(v) => setFormData({ ...formData, ProjectCodes: v })}
                  placeholder="Chọn dự án"
                  className="w-full"
                />
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <Label>Kích hoạt</Label>
              <Switch
                checked={formData.Status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, Status: checked })
                }
              />
            </div>

            {/* <div>
              <Label>Trạng thái</Label>
              <SearchableComboBox
                options={statusOptions}
                value={formData.Status.toString()}
                onChange={(v) => setFormData({ ...formData, Status: +v })}
                placeholder="Chọn trạng thái"
                className="w-full"
              />
            </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Đóng</Button>
            <Button onClick={handleSave}>{editingUser ? 'Cập nhật' : 'Thêm mới'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { UserSystemPage };
