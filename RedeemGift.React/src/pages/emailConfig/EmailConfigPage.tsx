import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Mail, Plus, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { FilterBar } from '@/components/FilterBar';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { useDebounce } from '@/hooks/useDebounce';
import { useEmailConfigs } from '@/hooks/useEmailConfigs';
import { useGoogleOAuth } from '@/hooks/useGoogleOAuth';

import {
  getEmailConfigPagedList,
  insertEmailConfig,
  updateEmailConfig,
  deleteEmailConfig,
  chooseEmailConfig,
} from '@/controllers/EmailConfigController';
import { StatusSelect } from '@/components/StatusSelect';

interface EmailConfigItem {
  EmailId: number;
  Type: string;
  SmtpServer: string;
  SmtpPort: number;
  SenderEmail: string;
  SenderPassword: string;
  ClientId?: string;
  ClientSecret?: string;
  RedirectUri?: string;
  Token?: string;
  RefreshToken?: string;
  IsActive: boolean;
  TotalRow?: number;
}

const NAMESPACE = 'EmailConfig';

const EmailConfigPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<EmailConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EmailConfigItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [emailTypeFilter, setEmailTypeFilter] = useState(searchParams.get('type') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Default email config
  const emailConfigs = useEmailConfigs(true);
  const { validateGmailConfig, loading: isGmailValidating } = useGoogleOAuth();
  const [selectedEmailConfig, setSelectedEmailConfig] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    Type: 'SMTP',
    SmtpServer: '',
    SmtpPort: 587,
    SenderEmail: '',
    SenderPassword: '',
    ClientId: '',
    ClientSecret: '',
    RedirectUri: '',
    Token: '',
    RefreshToken: '',
    IsActive: true,
  });

  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  // Set default email config
  useEffect(() => {
    const activeConfig = emailConfigs.find((p) => p.isActive === true);
    if (activeConfig) {
      setSelectedEmailConfig(String(activeConfig.value));
    }
  }, [emailConfigs]);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, debouncedSearch, emailTypeFilter, statusFilter]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('search', debouncedSearch);
      newParams.set('page', '1');
    } else {
      newParams.delete('search');
    }
    if (emailTypeFilter) {
      newParams.set('type', emailTypeFilter);
    } else {
      newParams.delete('type');
    }
    if (statusFilter) {
      newParams.set('status', statusFilter);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  }, [debouncedSearch, emailTypeFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(emailTypeFilter && { type: emailTypeFilter }),
        ...(statusFilter && { status: statusFilter }),
      }).toString();

      const response = (await getEmailConfigPagedList(query)) as any;

      if (response?.Data) {
        const items = response.Data || [];
        setData(items);
        setTotalPages(Math.ceil((items[0]?.TotalRow || 0) / pageSize));
        setTotalItems(items[0]?.TotalRow || items.length);
      }
    } catch (error) {
      console.error('Error fetching email configs:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmailConfig = async (value: string) => {
    setSelectedEmailConfig(value);
    if (!value) return;

    try {
      const response = (await chooseEmailConfig(Number(value))) as any;
      if (response?.Status === 'Success') {
        toast.success(response?.Message || 'Cập nhật Email Config thành công');
        fetchData();
      } else {
        toast.error(response?.Message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi chọn Email Config');
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({
      Type: 'SMTP',
      SmtpServer: '',
      SmtpPort: 587,
      SenderEmail: '',
      SenderPassword: '',
      ClientId: '',
      ClientSecret: '',
      RedirectUri: '',
      Token: '',
      RefreshToken: '',
      IsActive: true,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item: EmailConfigItem) => {
    setSelectedItem(item);
    setFormData({
      Type: item.Type,
      SmtpServer: item.SmtpServer || '',
      SmtpPort: item.SmtpPort || 587,
      SenderEmail: item.SenderEmail || '',
      SenderPassword: item.SenderPassword || '',
      ClientId: item.ClientId || '',
      ClientSecret: item.ClientSecret || '',
      RedirectUri: item.RedirectUri || '',
      Token: item.Token || '',
      RefreshToken: item.RefreshToken || '',
      IsActive: item.IsActive,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (item: EmailConfigItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.SenderEmail.trim()) {
      toast.error('Vui lòng nhập email người gửi');
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = { ...formData };

      if (submitData.Type === 'GMAIL') {
        const tokens = await validateGmailConfig(submitData);
        if (!tokens) return;

        submitData.Token = tokens.accessToken;
        submitData.RefreshToken = tokens.refreshToken;
        setFormData(submitData);
      }

      const form = new FormData();
      Object.entries(submitData).forEach(([key, value]) => {
        form.append(key, String(value));
      });

      if (selectedItem) {
        form.append('EmailId', selectedItem.EmailId.toString());
        const result = await updateEmailConfig(form);
        if (result?.Status && result.Status !== 'Success') {
          toast.error(result?.Message || 'Cập nhật thất bại');
          return;
        }

        const updatedItem = {
          ...selectedItem,
          ...submitData,
        };

        setSelectedItem(updatedItem);
        setFormData(submitData);
        setData((prev) =>
          prev.map((item) =>
            item.EmailId === selectedItem.EmailId ? updatedItem : item
          )
        );
        toast.success(result?.Message || 'Cập nhật thành công');
        setIsFormOpen(false);
        return;
      }

      const insertResult = await insertEmailConfig(form);
      if (insertResult?.Status && insertResult.Status !== 'Success') {
        toast.error(insertResult?.Message || 'Thêm mới thất bại');
        return;
      }

      toast.success(insertResult?.Message || 'Thêm mới thành công');
      setIsFormOpen(false);
      await fetchData();
      return;
    } catch (error) {
      console.error('Error saving email config:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      const result = await deleteEmailConfig(selectedItem.EmailId);
      if (result?.Status && result.Status !== 'Success') {
        toast.error(result?.Message || 'Xóa thất bại');
        return;
      }
      toast.success(result?.Message || 'Xóa thành công');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting email config:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailTypeOptions = [
    { value: 'GMAIL', label: 'Gmail' },
    { value: 'SMTP', label: 'SMTP' },
  ];

  const statusOptions = [
    { value: '1', label: 'Đang sử dụng' },
    { value: '0', label: 'Khóa' },
  ];

  const emailConfigOptions = emailConfigs.map((config) => ({
    value: String(config.value),
    label: config.label,
  }));

  const columns: ColumnDef<EmailConfigItem>[] = [
    {
      accessorKey: 'SenderEmail',
      header: 'EMAIL CONFIG',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">
              {row.original.SenderEmail}
            </div>

            {row.original.SmtpServer && (
              <div className="text-sm text-muted-foreground">
                {row.original.SmtpServer}:{row.original.SmtpPort}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'Type',
      header: 'LOẠI EMAIL',
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium
        bg-blue-100 text-blue-800
        dark:bg-blue-900 dark:text-blue-200"
        >
          {row.original.Type}
        </span>
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
      enableSorting: false, // 🚫 không sort cột thao tác
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title="Sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original)}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold leading-tight flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          Cấu hình Email
        </h1>
        <p className="mt-2 pl-14 text-sm text-muted-foreground">
          Quản lý cấu hình gửi email thông báo
        </p>
      </div>

      {/* Default Email Config & Filters */}
      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            {/* Default Email Config Selector */}
            <div className="min-w-0 flex-1">
              <span className="mb-2 block text-sm font-semibold">
                Email Config mặc định
              </span>
              <div className="w-full max-w-md">
                <SearchableComboBox
                  options={emailConfigOptions}
                  value={selectedEmailConfig}
                  onChange={handleChangeEmailConfig}
                  placeholder="Chọn Email Config"
                  className="w-full"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-3 sm:grid-cols-[minmax(180px,220px)_minmax(160px,180px)_auto] lg:flex lg:items-end">
              <div>
                <SearchableComboBox
                  options={emailTypeOptions}
                  value={emailTypeFilter}
                  onChange={setEmailTypeFilter}
                  placeholder="Loại Email"
                  includeAllOption
                  allOptionLabel="Tất cả Loại Email"
                  className="w-full"
                />
              </div>
              <div className="self-end">
                <StatusSelect value={statusFilter} onChange={setStatusFilter} />
              </div>
              <Button onClick={handleCreate} className="self-end">
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Email Config</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} isLoading={loading} />
          {totalItems > 10 && (
            <div className="mt-4">
              <Pagination
                pagination={{ total: totalItems }}
                isLoading={loading}
                updateState={({ page, pageSize }) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', page.toString());
                  newParams.set('pageSize', pageSize.toString());
                  setSearchParams(newParams);
                }}
                defaultPageSize={10}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Cập nhật Email Config' : 'Thêm Email Config mới'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Chỉnh sửa thông tin cấu hình email'
                : 'Nhập thông tin để thêm cấu hình email mới'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="required font-bold">Loại Email</Label>
              <Select
                value={formData.Type}
                onValueChange={(value) =>
                  setFormData({ ...formData, Type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMTP">SMTP</SelectItem>
                  <SelectItem value="GMAIL">Gmail (OAuth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.Type === 'SMTP' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="required font-bold">SMTP Server</Label>
                    <Input
                      value={formData.SmtpServer}
                      onChange={(e) =>
                        setFormData({ ...formData, SmtpServer: e.target.value })
                      }
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label className="required font-bold">SMTP Port</Label>
                    <Input
                      type="number"
                      value={formData.SmtpPort}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          SmtpPort: parseInt(e.target.value) || 587,
                        })
                      }
                      placeholder="587"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="required font-bold">Email người gửi</Label>
              <Input
                type="email"
                value={formData.SenderEmail}
                onChange={(e) =>
                  setFormData({ ...formData, SenderEmail: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>

            {formData.Type === 'SMTP' && (
              <div>
                <Label className="required font-bold">Mật khẩu</Label>
                <Input
                  type="password"
                  value={formData.SenderPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, SenderPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
            )}

            {formData.Type === 'GMAIL' && (
              <>
                <div>
                  <Label className="required font-bold">Client ID</Label>
                  <Input
                    value={formData.ClientId}
                    onChange={(e) =>
                      setFormData({ ...formData, ClientId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="required font-bold">Client Secret</Label>
                  <Input
                    type="password"
                    value={formData.ClientSecret}
                    onChange={(e) =>
                      setFormData({ ...formData, ClientSecret: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="required font-bold">Redirect URI</Label>
                  <Input
                    value={formData.RedirectUri}
                    onChange={(e) =>
                      setFormData({ ...formData, RedirectUri: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting || isGmailValidating}
            >
              Hủy
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isGmailValidating}
            >
              {isSubmitting ? 'Đang lưu...' : selectedItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa email config "{selectedItem?.SenderEmail}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailConfigPage;
