import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginForm, RecoveryPasswordPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { Error404Page, Error500Page } from '@/pages/errors';
import { Loading } from '@/components/Loading';
import { GiftPage } from '@/pages/gift';
import { ProjectPage } from '@/pages/project';
import { PrizesPage } from '@/pages/prizes';
import { HistorySpinPage } from '@/pages/historySpin';
import { RedeemSpinPage } from '@/pages/redeemSpin';
import { UserSystemPage } from '@/pages/userSystem';
import { RolePage } from '@/pages/role';
import { MenuPage } from '@/pages/menu';
import { LuckyWheelPage } from '@/pages/luckyWheel';
import { QRPage } from '@/pages/qr';
import { EmailConfigPage } from '@/pages/emailConfig';

const queryClient = new QueryClient();

// Component xử lý redirect logic
const GoogleOAuthRedirectHandler = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (!window.opener || (!code && !error)) return;

    window.opener.postMessage({ code, error }, window.location.origin);
    window.close();
  }, []);

  return null;
};

const AuthRedirect = () => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (auth) {
    // Đã login → redirect về menu đầu tiên hoặc dashboard
    const firstMenuPath = auth.Menu?.[0]?.MenuPath || '/dashboard';
    return <Navigate to={firstMenuPath} replace />;
  }

  return <LoginForm />;
};

// Root redirect handler
const RootRedirect = () => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!auth) {
    return <Navigate to="/auth" replace />;
  }

  const firstMenuPath = auth.Menu?.[0]?.MenuPath || '/dashboard';
  return <Navigate to={firstMenuPath} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleOAuthRedirectHandler />
          <Routes>
            {/* Auth routes */}
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/recoveryPassword" element={<RecoveryPasswordPage />} />

            {/* Public Lucky Wheel route - không cần đăng nhập */}
            <Route path="/luckyWheel/:spinGrantId" element={<LuckyWheelPage />} />

            {/* Error routes */}
            <Route path="/error/404" element={<Error404Page />} />
            <Route path="/error/500" element={<Error500Page />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/gift" element={<GiftPage />} />
                <Route path="/project" element={<ProjectPage />} />
                <Route path="/prizes" element={<PrizesPage />} />
                <Route path="/qr" element={<QRPage />} />
                <Route path="/redeemSpin" element={<RedeemSpinPage />} />
                <Route path="/historySpin" element={<HistorySpinPage />} />
                <Route path="/userSystem" element={<UserSystemPage />} />
                <Route path="/role" element={<RolePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/luckyWheel" element={<LuckyWheelPage />} />
                <Route path="/emailConfig" element={<EmailConfigPage />} />
              </Route>
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Catch all */}
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
