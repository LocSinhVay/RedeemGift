import React, { useMemo } from 'react';
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Get icon component from icon name string
const getIconByName = (iconName?: string): LucideIcon => {
  if (!iconName) return LucideIcons.LayoutDashboard;
  
  // Clean the icon name - remove spaces and ensure proper format
  const cleanName = iconName.trim();
  
  // Try exact match first
  if (cleanName in LucideIcons) {
    const Icon = (LucideIcons as Record<string, unknown>)[cleanName];
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      return Icon as LucideIcon;
    }
  }
  
  // Try PascalCase conversion (e.g., "home" -> "Home", "user-check" -> "UserCheck")
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
  
  return LucideIcons.LayoutDashboard;
};

interface MenuNode {
  MenuID: number;
  MenuName: string;
  MenuPath: string;
  ParentId?: number | null;
  Icon?: string;
  Children: MenuNode[];
}

const SidebarMenuMain: React.FC = React.memo(() => {
  const { auth } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Build menu tree from flat menu list
  const menuTree = useMemo(() => {
    const flatMenus = auth?.Menu || [];
    const map = new Map<number, MenuNode>();
    const roots: MenuNode[] = [];

    // First pass: create all nodes
    flatMenus.forEach((m) =>
      map.set(m.MenuID, { ...m, Children: [] })
    );

    // Second pass: build tree structure
    flatMenus.forEach((m) => {
      const node = map.get(m.MenuID);
      if (!node) return;

      if (m.ParentId) {
        const parent = map.get(m.ParentId);
        if (parent) {
          parent.Children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [auth?.Menu]);

  const renderMenu = (menus: MenuNode[]): React.ReactNode =>
    menus.map((menu) => {
      const Icon = getIconByName(menu.Icon);

      if (menu.Children.length > 0) {
        return (
          <SidebarMenuItemWithSub
            key={menu.MenuID}
            to={menu.MenuPath}
            icon={Icon}
            title={menu.MenuName}
            isCollapsed={isCollapsed}
          >
            {renderMenu(menu.Children)}
          </SidebarMenuItemWithSub>
        );
      }

      return (
        <SidebarMenuItem
          key={menu.MenuID}
          to={menu.MenuPath}
          icon={Icon}
          title={menu.MenuName}
          isCollapsed={isCollapsed}
        />
      );
    });

  return <>{renderMenu(menuTree)}</>;
});

SidebarMenuMain.displayName = 'SidebarMenuMain';

export { SidebarMenuMain };
