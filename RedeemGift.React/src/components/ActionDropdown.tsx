import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Eye, KeyRound, Power } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  label?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  label = 'Thao tác',
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-h-9 px-3">
          {label}
          <MoreHorizontal className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-background border shadow-lg z-50">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={`cursor-pointer ${action.variant === 'destructive' ? 'text-destructive' : ''}`}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Pre-built action creators for common use cases
export const createEditAction = (onClick: () => void): ActionItem => ({
  label: 'Sửa',
  icon: Pencil,
  onClick,
});

export const createDeleteAction = (onClick: () => void): ActionItem => ({
  label: 'Xóa',
  icon: Trash2,
  onClick,
  variant: 'destructive',
});

export const createViewAction = (onClick: () => void): ActionItem => ({
  label: 'Xem',
  icon: Eye,
  onClick,
});

export const createResetPasswordAction = (onClick: () => void): ActionItem => ({
  label: 'Reset mật khẩu',
  icon: KeyRound,
  onClick,
});

export const createToggleStatusAction = (onClick: () => void): ActionItem => ({
  label: 'Đổi trạng thái',
  icon: Power,
  onClick,
});
