import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/controllers/LoginController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gift, Sparkles } from 'lucide-react';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập Username'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [noMenu, setNoMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected with noMenu state
  useEffect(() => {
    const state = location.state as { noMenu?: boolean } | null;
    if (state?.noMenu) {
      setNoMenu(true);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "SADM_000001",
      password: "123456",
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: LoginFormData) => {
    setLoading(true);
    setNoMenu(false);
    setErrorMessage(null);

    try {
      const result = await login(values.username, values.password);

      if (result.Data && result.Data.Token) {
        const projectCodesStr = result.Data.ProjectCodes as string || '';
        const projectCodesArr = projectCodesStr
          .split(',')
          .map((p: string) => p.trim())
          .filter(Boolean);

        let selectedProject = null;
        if (projectCodesArr.length >= 1) {
          selectedProject = projectCodesArr[0];
        }

        saveAuth({
          ...result.Data,
          ProjectCodes: projectCodesStr,
          SelectedProject: selectedProject,
        });

        toast.success('Đăng nhập thành công!');
        navigate('/', { replace: true });
      } else {
        setErrorMessage(result.Message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error(error);
      saveAuth(null);
      setErrorMessage('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-surface p-4">
      <div className="absolute inset-x-0 top-0 h-56 border-b bg-card/70" />

      <Card className="relative w-full max-w-md border bg-card shadow-2xl shadow-slate-950/10">
        <CardHeader className="text-center pb-2">
          {/* Logo/Icon */}
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Lucky Wheel System
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Đăng nhập để quản lý quà tặng
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {noMenu && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Tài khoản của bạn chưa được cấp menu nào.
                <br />
                Vui lòng liên hệ quản trị viên để được phân quyền.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập Username"
                {...register('username')}
                className={`h-11 ${errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                className={`h-11 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowForgotPassword(true)}
              >
                Quên mật khẩu?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
};
