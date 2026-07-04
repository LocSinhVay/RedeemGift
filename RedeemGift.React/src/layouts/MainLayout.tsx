import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Gift,
  FolderKanban,
  LogOut,
  ChevronDown,
  KeyRound,
} from 'lucide-react'
import { SidebarMenuMain } from '@/components/sidebar'
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog'
import { SearchableComboBox } from '@/components/SearchableComboBox'
import { useProjects } from '@/hooks/useProjects'

/* ===================== Sidebar Content ===================== */

const SidebarContentComponent = ({
  onOpenChangePassword,
}: {
  onOpenChangePassword: () => void
}) => {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border/70 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm shadow-cyan-950/30">
            <Gift className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">
              RedeemGift
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase text-sidebar-foreground/55">
              Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuMain />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/70 p-2">
          <Avatar className="h-9 w-9 shrink-0 border border-sidebar-border">
            <AvatarImage src={auth?.AvatarImage} />
            <AvatarFallback className="text-sm">
              {auth?.FullName?.charAt(0) ||
                auth?.Username?.charAt(0) ||
                'U'}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {auth?.FullName}
              </p>
              <p className="text-sm font-medium text-sidebar-primary">
                {auth?.Username}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {auth?.RoleName}
              </p>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={onOpenChangePassword}
                className="min-h-[40px]"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Đổi mật khẩu
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="min-h-[40px] text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </>
  )
}

/* ===================== Main Layout ===================== */

export const MainLayout = () => {
  const { auth, updateSelectedProject, logout } = useAuth()
  const navigate = useNavigate()
  const [showChangePassword, setShowChangePassword] = useState(false)

  const { visibleProjects } = useProjects(true)

  const projectCodes = Array.isArray(auth?.ProjectCodes)
    ? auth.ProjectCodes
    : (auth?.ProjectCodes || '').split(',').filter(Boolean)

  const hasProjectRestriction = projectCodes.length > 0

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full app-surface">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarContentComponent
            onOpenChangePassword={() => setShowChangePassword(true)}
          />
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border/70 flex items-center px-3 sm:px-5 gap-2 sm:gap-4 bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/75 sticky top-0 z-10">
            <SidebarTrigger className="h-9 w-9 shrink-0" />

            {hasProjectRestriction && (
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                <SearchableComboBox
                  options={visibleProjects}
                  value={auth?.SelectedProject || ''}
                  onChange={(value) =>
                    updateSelectedProject(value || null)
                  }
                  placeholder="Chọn dự án"
                  className="w-[200px]"
                />
              </div>
            )}

            <div className="flex-1" />

            <span className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground hidden sm:block shadow-sm">
              Xin chào, <strong>{auth?.FullName}</strong>
            </span>

            {/* ===== Mobile User Menu ===== */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 sm:hidden cursor-pointer">
                  <AvatarImage src={auth?.AvatarImage} />
                  <AvatarFallback className="text-xs">
                    {auth?.FullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 sm:hidden">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">
                    {auth?.FullName}
                  </p>
                  <p className="text-sm font-medium text-primary truncate">
                    {auth?.Username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {auth?.RoleName}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="min-h-[40px]"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="min-h-[40px] text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex-1 overflow-auto p-3 sm:p-5 md:p-7">
            <Outlet />
          </div>
        </main>
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </SidebarProvider>
  )
}
