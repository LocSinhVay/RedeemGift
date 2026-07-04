import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
}

export const StatusBadge = ({
  isActive,
  activeText = 'Hoạt động',
  inactiveText = 'Đã khóa'
}: StatusBadgeProps) => {
  if (isActive) {
    return (
      <Badge className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-center font-medium text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400">
        {activeText}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="border border-slate-200 bg-slate-100 px-2.5 py-1 text-center font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {inactiveText}
    </Badge>
  );
};
