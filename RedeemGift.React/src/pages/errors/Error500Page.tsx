import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ServerCrash } from 'lucide-react';

export const Error500Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <ServerCrash className="h-24 w-24 text-destructive mx-auto" />
        <h1 className="text-6xl font-bold text-foreground">500</h1>
        <p className="text-xl text-muted-foreground">Lỗi máy chủ</p>
        <p className="text-muted-foreground max-w-md mx-auto">
          Đã xảy ra lỗi từ phía máy chủ. Vui lòng thử lại sau.
        </p>
        <Button asChild>
          <Link to="/">Quay về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
};
