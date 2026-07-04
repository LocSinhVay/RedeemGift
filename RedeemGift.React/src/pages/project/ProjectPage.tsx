import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
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
import { ActionDropdown, createEditAction, createToggleStatusAction } from '@/components/ActionDropdown';
import { getProjectPagedList, insertProject, updateProject, updateProjectStatus } from '@/controllers/ProjectController';
import { toast } from 'sonner';

interface Project {
  ProjectID: number;
  ProjectCode: string;
  ProjectName: string;
  IsActive: boolean;
}

const ProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ ProjectCode: '', ProjectName: '' });

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
    queryKey: ['projects-list', queryString],
    queryFn: () => getProjectPagedList(queryString),
  });

  const projects = (data as any)?.Data || [];
  const total = projects[0]?.TotalRow || 0;

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({ ProjectCode: project.ProjectCode, ProjectName: project.ProjectName });
    } else {
      setEditingProject(null);
      setFormData({ ProjectCode: '', ProjectName: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.ProjectCode.trim()) {
      toast.error('Vui lòng nhập mã dự án')
      return
    }
    if (!formData.ProjectName.trim()) {
      toast.error('Vui lòng nhập tên dự án')
      return
    }

    try {
      const fd = new FormData();
      if (editingProject) fd.append('ProjectID', editingProject.ProjectID.toString());
      fd.append('ProjectCode', formData.ProjectCode);
      fd.append('ProjectName', formData.ProjectName);

      if (editingProject) {
        const response = await updateProject(fd);
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại');
          return;
        }
        toast.success(response?.Message || 'Cập nhật thành công');
      } else {
        const response = await insertProject(fd);
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

  const handleToggleStatus = async (project: Project) => {
    try {
      const response = await updateProjectStatus({ ProjectID: project.ProjectID, IsActive: !project.IsActive });
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

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'ProjectID',
      header: 'ID',
    },
    {
      accessorKey: 'ProjectCode',
      header: 'MÃ DỰ ÁN',
    },
    {
      accessorKey: 'ProjectName',
      header: 'TÊN DỰ ÁN',
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
        <CardTitle>Quản lý Dự án</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar
          onSearch={handleSearch}
          namespace="project"
          onAdd={() => handleOpenModal()}
        >
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>

        <DataTable data={projects} columns={columns} isLoading={isLoading} />
        <Pagination pagination={{ total }} isLoading={isLoading} updateState={({ page, pageSize }) => { setPage(page); setPageSize(pageSize); }} />
      </CardContent>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProject ? 'Cập nhật' : 'Thêm'} Dự án</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="required font-bold">Mã dự án</Label><Input value={formData.ProjectCode} onChange={(e) => setFormData({ ...formData, ProjectCode: e.target.value })} disabled={!!editingProject} /></div>
            <div><Label className="required font-bold">Tên dự án</Label><Input value={formData.ProjectName} onChange={(e) => setFormData({ ...formData, ProjectName: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowModal(false)}>Đóng</Button><Button onClick={handleSave}>{editingProject ? 'Cập nhật' : 'Thêm mới'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export { ProjectPage };
