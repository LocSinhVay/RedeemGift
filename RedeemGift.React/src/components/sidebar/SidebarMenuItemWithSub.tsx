import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useLocation, Link } from 'react-router-dom';
import { LucideIcon, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Props = {
  to: string;
  title: string;
  icon?: LucideIcon;
  hasBullet?: boolean;
  isCollapsed?: boolean;
  children: React.ReactNode;
};

const checkIsActive = (pathname: string, to: string): boolean => {
  return pathname === to || pathname.startsWith(`${to}/`);
};

// Check if any child is active
const hasActiveChild = (children: React.ReactNode, pathname: string): boolean => {
  return React.Children.toArray(children).some((child): child is React.ReactElement => {
    if (React.isValidElement(child)) {
      const childTo = child.props.to;
      if (childTo && typeof childTo === 'string') {
        return checkIsActive(pathname, childTo);
      }
      if (child.props.children) {
        return hasActiveChild(child.props.children, pathname);
      }
    }
    return false;
  });
};

// Extract child menu items for collapsed popover
const extractChildItems = (children: React.ReactNode): Array<{ to: string; title: string; icon?: LucideIcon }> => {
  const items: Array<{ to: string; title: string; icon?: LucideIcon }> = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const { to, title, icon } = child.props;
      if (to && title) {
        items.push({ to, title, icon });
      }
    }
  });
  return items;
};

const SidebarMenuItemWithSub: React.FC<Props> = ({
  children,
  to,
  title,
  icon: Icon,
  hasBullet,
  isCollapsed,
}) => {
  const { pathname } = useLocation();

  const isChildActive = useMemo(
    () => hasActiveChild(children, pathname),
    [children, pathname]
  );

  const [isOpen, setIsOpen] = useState(isChildActive);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const childItems = useMemo(() => extractChildItems(children), [children]);

  // Auto open when child is active
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // Collapsed mode: show popover with child items
  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              className={clsx(
                'w-full flex items-center justify-center gap-3 min-h-[42px] rounded-md text-sidebar-foreground/78 touch-manipulation hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isChildActive && 'bg-sidebar-primary/20 text-sidebar-accent-foreground'
              )}
            >
              {hasBullet && (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-48 p-2 bg-popover border border-border shadow-lg z-50"
            sideOffset={8}
          >
            <div className="font-medium text-sm text-foreground mb-2 px-2">{title}</div>
            <div className="space-y-1">
              {childItems.map((item) => {
                const isActive = checkIsActive(pathname, item.to);
                const ChildIcon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setPopoverOpen(false)}
                    className={clsx(
                      'flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground font-medium'
                    )}
                  >
                    {ChildIcon ? (
                      <ChildIcon className="h-4 w-4 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current ml-1" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    );
  }

  // Expanded mode: normal collapsible
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={clsx(
              'w-full flex items-center gap-3 min-h-[42px] rounded-md px-2 text-sidebar-foreground/78 touch-manipulation hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isChildActive && 'border-l-2 border-sidebar-primary bg-sidebar-primary/20 text-sidebar-accent-foreground'
            )}
          >
            {hasBullet && (
              <span className="w-1.5 h-1.5 rounded-full bg-current ml-2" />
            )}
            {Icon && <Icon className="h-5 w-5 shrink-0" />}
            <span className="truncate flex-1 text-left">{title}</span>
            <ChevronDown
              className={clsx(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub className="ml-4 border-l border-sidebar-border/80 pl-2">
            {children}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export { SidebarMenuItemWithSub, hasActiveChild };
