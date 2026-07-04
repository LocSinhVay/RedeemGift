import React from 'react';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {
  SidebarMenuItem as SidebarMenuItemUI,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  to: string;
  title: string;
  icon?: LucideIcon;
  hasBullet?: boolean;
  isCollapsed?: boolean;
};

const checkIsActive = (pathname: string, to: string): boolean => {
  return pathname === to || pathname.startsWith(`${to}/`);
};

const SidebarMenuItem: React.FC<Props> = ({
  to,
  title,
  icon: Icon,
  hasBullet,
  isCollapsed,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = checkIsActive(pathname, to);

  return (
    <SidebarMenuItemUI>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={title}
          >
            <button
              onClick={() => navigate(to)}
              className={clsx(
                'w-full flex items-center gap-3 min-h-[42px] rounded-md px-2 text-sidebar-foreground/78 touch-manipulation transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'border-l-2 border-sidebar-primary bg-sidebar-primary/20 text-sidebar-accent-foreground'
              )}
            >
              {hasBullet && (
                <span className="w-1.5 h-1.5 rounded-full bg-current ml-2" />
              )}
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!isCollapsed && <span className="truncate">{title}</span>}
            </button>
          </SidebarMenuButton>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {title}
          </TooltipContent>
        )}
      </Tooltip>
    </SidebarMenuItemUI>
  );
};

export { SidebarMenuItem, checkIsActive };
