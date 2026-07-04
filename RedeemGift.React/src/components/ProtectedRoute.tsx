import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';

export const ProtectedRoute = () => {
  const { auth, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen message="Đang kiểm tra đăng nhập..." />;
  }

  // Chưa login → redirect về auth
  if (!auth) {
    return <Navigate to="/auth" replace />;
  }

  // Lấy danh sách path hợp lệ từ menu của user
  const allowedPaths = auth.Menu?.map((m) => m.MenuPath).filter((p): p is string => !!p) || [];

  // Đã login nhưng chưa có menu
  if (!allowedPaths.length) {
    return <Navigate to="/auth" replace state={{ noMenu: true }} />;
  }

  // Nếu path hiện tại không thuộc menu user có → về 404
  const isAllowed = allowedPaths.some((menuPath) =>
    location.pathname.startsWith(menuPath)
  );

  if (!isAllowed && location.pathname !== '/') {
    return <Navigate to="/error/404" replace />;
  }

  return <Outlet />;
};
