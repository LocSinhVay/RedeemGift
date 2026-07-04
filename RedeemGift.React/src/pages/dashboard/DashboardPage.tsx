import { useQuery } from '@tanstack/react-query';
import { Gift, Users, FolderKanban, QrCode, History, Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardSummary } from '@/controllers/DashboardController';

type DashboardStats = {
  projects: number;
  gifts: number;
  prizes: number;
  qrCodes: number;
  spins: number;
  customers: number;
};

const getProjectCodes = (projectCodes?: string | string[] | null) => {
  if (!projectCodes) return [];
  if (Array.isArray(projectCodes)) return projectCodes.filter(Boolean);

  return projectCodes
    .split(',')
    .map((projectCode) => projectCode.trim())
    .filter(Boolean);
};

const buildDashboardQuery = (projectCode?: string | null) => {
  const params = new URLSearchParams();
  if (projectCode) params.set('projectCode', projectCode);

  return params.toString();
};

export const DashboardPage = () => {
  const { auth } = useAuth();

  const projectCodes = getProjectCodes(auth?.ProjectCodes);
  const hasProjectRestriction = projectCodes.length > 0;
  const selectedProjectCode = hasProjectRestriction
    ? auth?.SelectedProject || projectCodes[0] || ''
    : '';
  const dashboardQuery = buildDashboardQuery(selectedProjectCode);

  const { data: dashboardStats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', hasProjectRestriction, selectedProjectCode],
    enabled: !!auth && (!hasProjectRestriction || !!selectedProjectCode),
    queryFn: async () => {
      const response = await getDashboardSummary(dashboardQuery);
      if ((response as any)?.Status && (response as any).Status !== 'Success') {
        throw new Error((response as any)?.Message || 'Không thể tải dữ liệu dashboard');
      }

      const data = (response as any)?.Data || {};

      return {
        projects: Number(data.Projects ?? 0),
        gifts: Number(data.Gifts ?? 0),
        prizes: Number(data.Prizes ?? 0),
        qrCodes: Number(data.QrCodes ?? 0),
        spins: Number(data.Spins ?? 0),
        customers: Number(data.Customers ?? 0),
      };
    },
  });

  const formatNumber = (value?: number) =>
    isLoading ? '...' : (value ?? 0).toLocaleString('vi-VN');

  const stats = [
    { title: 'Dự án', value: formatNumber(dashboardStats?.projects), icon: FolderKanban, color: 'text-blue-500' },
    { title: 'Quà tặng', value: formatNumber(dashboardStats?.gifts), icon: Gift, color: 'text-green-500' },
    { title: 'Giải thưởng', value: formatNumber(dashboardStats?.prizes), icon: Trophy, color: 'text-yellow-500' },
    { title: 'QR Codes', value: formatNumber(dashboardStats?.qrCodes), icon: QrCode, color: 'text-purple-500' },
    { title: 'Lượt quay', value: formatNumber(dashboardStats?.spins), icon: History, color: 'text-pink-500' },
    { title: 'Khách hàng', value: formatNumber(dashboardStats?.customers), icon: Users, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Xin chào, {auth?.FullName}! Chào mừng bạn quay trở lại.
        </p>
        {isError && (
          <p className="mt-3 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không thể tải dữ liệu dashboard'}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="rounded-md bg-slate-50 p-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Username:</strong> {auth?.Username}</p>
          <p><strong>Email:</strong> {auth?.Email}</p>
          <p><strong>Vai trò:</strong> {auth?.RoleName}</p>
          <p>
            <strong>Dự án hiện tại:</strong>{' '}
            {hasProjectRestriction ? selectedProjectCode || 'Chưa chọn' : 'Tất cả dự án'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
