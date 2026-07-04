import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { FilterBar } from '@/components/FilterBar'
import { StatusSelect } from '@/components/StatusSelect'
import { StatusBadge } from '@/components/StatusBadge'
import {
  ActionDropdown, createEditAction, createDeleteAction
} from '@/components/ActionDropdown'
import {
  getRolePagedList, insertRole, updateRole, deleteRole
} from '@/controllers/RoleController'
import { getAllMenu } from '@/controllers/MenuController'
import { toast } from 'sonner'
import { ChevronRight, ChevronDown } from 'lucide-react'

/* ================= TYPES ================= */

interface Role {
  RoleID: number
  RoleName: string
  Symbol: string
  Status: number
  listRoleMenu?: { MenuID: number; IsChecked: boolean }[]
}

interface Menu {
  MenuID: number
  MenuName: string
  ParentId?: number | null
  OrderIndex?: number
}

interface MenuNode extends Menu {
  Children: MenuNode[]
}

/* ================= COMPONENT ================= */

export const RolePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [roleName, setRoleName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [selectedMenus, setSelectedMenus] = useState<number[]>([])
  const [expandedMenus, setExpandedMenus] = useState<number[]>([])

  /* ================= DATA ================= */

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('pageSize', pageSize.toString())
    params.set('offset', ((page - 1) * pageSize).toString())
    if (searchTerm) params.set('keySearch', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    return params.toString()
  }, [page, pageSize, searchTerm, statusFilter])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['roles', queryString],
    queryFn: () => getRolePagedList(queryString),
  })

  const { data: menuRes } = useQuery({
    queryKey: ['menus'],
    queryFn: getAllMenu,
  })

  const roles = (data as any)?.Data || []
  const total = roles[0]?.TotalRow || 0
  const flatMenus: Menu[] = (menuRes as any)?.Data || []

  /* ================= BUILD TREE ================= */

  const menuTree = useMemo(() => {
    const map = new Map<number, MenuNode>()
    const roots: MenuNode[] = []

    flatMenus
      .sort((a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0))
      .forEach(m => map.set(m.MenuID, { ...m, Children: [] }))

    map.forEach(node => {
      if (node.ParentId) {
        map.get(node.ParentId)?.Children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }, [flatMenus])

  /* ================= MENU LOGIC ================= */

  const getAllChildIds = (node: MenuNode): number[] => {
    return [
      node.MenuID,
      ...node.Children.flatMap(getAllChildIds),
    ]
  }

  const isAllChecked = (node: MenuNode) =>
    getAllChildIds(node).every(id => selectedMenus.includes(id))

  const toggleNode = (node: MenuNode) => {
    const ids = getAllChildIds(node)
    setSelectedMenus(prev =>
      isAllChecked(node)
        ? prev.filter(id => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    )
  }

  /* ================= MODAL ================= */

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setRoleName(role.RoleName)
      setSymbol(role.Symbol)
      setIsActive(role.Status === 1)
      setSelectedMenus(
        role.listRoleMenu?.filter(m => m.IsChecked).map(m => m.MenuID) || []
      )
      setExpandedMenus(flatMenus.map(m => m.MenuID))
    } else {
      setEditingRole(null)
      setRoleName('')
      setSymbol('')
      setIsActive(true)
      setSelectedMenus([])
      setExpandedMenus([])
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    const listRoleMenu = flatMenus.map(m => ({
      RoleID: editingRole?.RoleID || 0,
      MenuID: m.MenuID,
      IsChecked: selectedMenus.includes(m.MenuID),
    }))

    if (!roleName.trim()) {
      toast.error('Vui lòng nhập tên quyền')
      return
    }

    if (!symbol.trim()) {
      toast.error('Vui lòng nhập ký hiệu quyền')
      return
    }

    if (listRoleMenu.every(m => !m.IsChecked)) {
      toast.error('Vui lòng chọn ít nhất một menu')
      return
    }

    try {
      if (editingRole) {
        const response = await updateRole({
          RoleID: editingRole.RoleID,
          RoleName: roleName,
          Symbol: symbol,
          Status: isActive ? 1 : 0,
          listRoleMenu,
        })
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Cập nhật thất bại')
          return
        }
        toast.success(response?.Message || 'Cập nhật thành công')
      } else {
        const response = await insertRole({
          RoleName: roleName,
          Symbol: symbol,
          Status: isActive ? 1 : 0,
          listRoleMenu,
        })
        if (response?.Status && response.Status !== 'Success') {
          toast.error(response?.Message || 'Thêm mới thất bại')
          return
        }
        toast.success(response?.Message || 'Thêm mới thành công')
      }
      setShowModal(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    }
  }

  const handleDelete = async (role: Role) => {
    try {
      const response = await deleteRole(role.RoleID)
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

  /* ================= RENDER MENU ================= */

  const renderTree = (nodes: MenuNode[], level = 0) =>
    nodes.map(node => (
      <div key={node.MenuID}>
        <div
          className="flex items-center gap-2 py-1"
          style={{ paddingLeft: level * 20 }}
        >
          {node.Children.length > 0 ? (
            <button onClick={() =>
              setExpandedMenus(p =>
                p.includes(node.MenuID)
                  ? p.filter(i => i !== node.MenuID)
                  : [...p, node.MenuID]
              )
            }>
              {expandedMenus.includes(node.MenuID)
                ? <ChevronDown size={16} />
                : <ChevronRight size={16} />}
            </button>
          ) : <span className="w-4" />}

          <Checkbox
            checked={isAllChecked(node)}
            onCheckedChange={() => toggleNode(node)}
          />
          <span className="font-medium">{node.MenuName}</span>
        </div>

        {expandedMenus.includes(node.MenuID) &&
          renderTree(node.Children, level + 1)}
      </div>
    ))

  /* ================= COLUMNS ================= */

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'RoleID',
      header: 'MÃ',
    },
    {
      accessorKey: 'RoleName',
      header: 'TÊN QUYỀN',
    },
    {
      accessorKey: 'Symbol',
      header: 'KÝ HIỆU',
    },
    {
      accessorKey: 'Status',
      header: 'TÌNH TRẠNG',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.Status === 1} />
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
      <CardHeader><CardTitle>Quản lý Vai trò</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <FilterBar onSearch={setSearchTerm} onAdd={() => openModal()}>
          <StatusSelect value={statusFilter} onChange={setStatusFilter} />
        </FilterBar>

        <DataTable data={roles} columns={columns} isLoading={isLoading} />
        <Pagination pagination={{ total }} isLoading={isLoading} updateState={({ page, pageSize }) => {
          setPage(page); setPageSize(pageSize)
        }} />

        {/* MODAL */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Cập nhật' : 'Thêm'} Vai trò</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="required font-bold">Tên quyền</Label>
                <Input value={roleName} onChange={e => setRoleName(e.target.value)} />

                <Label className="required font-bold">Ký hiệu</Label>
                <Input value={symbol} onChange={e => setSymbol(e.target.value)} />

                <div className="flex items-center gap-3 mt-4">
                  <Label>Kích hoạt</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>

              <div>
                <Label className="required font-bold">Menu</Label>
                <div className="border rounded p-3 max-h-[400px] overflow-y-auto mt-2">
                  {renderTree(menuTree)}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Đóng</Button>
              <Button onClick={handleSave}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
