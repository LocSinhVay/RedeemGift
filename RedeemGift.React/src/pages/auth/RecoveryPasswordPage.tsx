import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recoveryPassword } from '@/controllers/LoginController';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const recoverySchema = z
  .object({
    newPassword: z.string().min(1, 'Vui lòng nhập Mật khẩu mới'),
    confirmPassword: z.string().min(1, 'Vui lòng Xác nhận mật khẩu'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RecoveryFormData = z.infer<typeof recoverySchema>;

export const RecoveryPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    const tokenParam = searchParams.get('token');

    if (userIdParam) setUserId(userIdParam);
    if (tokenParam) setToken(decodeURIComponent(tokenParam));
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
    mode: 'onChange',
  });

  const onSubmit = async (values: RecoveryFormData) => {
    setLoading(true);

    try {
      const result = await recoveryPassword(userId, token, values.newPassword);

      if (result.Status === 'Success') {
        toast.success('Khôi phục mật khẩu thành công.');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      } else {
        toast.error(result.Message || 'Không thể khôi phục mật khẩu!');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi khôi phục mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Khôi phục mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                {...register('newPassword')}
                className={errors.newPassword ? 'border-destructive' : ''}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận lại mật khẩu"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vui lòng chờ...
                </>
              ) : (
                'Khôi phục mật khẩu'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
