import { useState, useCallback, useMemo, useEffect } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { toast } from 'sonner';
import { ChevronLeft, Camera, QrCode, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SearchableComboBox } from '@/components/SearchableComboBox';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useRedemptionRuleByProject } from '@/hooks/useRedemptionRuleByProject';
import { createSpinGrant } from '@/controllers/CustomerSpinController';
import { allowPositiveNumbersOnly } from '@/hooks/allowPositiveNumbersOnly';

interface OptionType {
  value: string;
  label: string;
}

const QRPage = () => {
  const { auth } = useAuth();
  const { projects, isAll } = useProjects(true);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [billTotal, setBillTotal] = useState('0');
  const [spinCount, setSpinCount] = useState('0');
  const [billImage, setBillImage] = useState<File | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectCode, setProjectCode] = useState<OptionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gán mặc định Project
  useEffect(() => {
    if (auth?.SelectedProject && !isAll) {
      setSelectedProject(auth.SelectedProject);
    } else if (projects.length > 0) {
      setSelectedProject(String(projects[0].value));
    }
  }, [auth, projects, isAll]);

  const effectiveProjectCode = isAll
    ? projectCode?.value || selectedProject || ''
    : auth?.SelectedProject || '';

  // Lấy danh sách rule theo dự án
  const redemptionRules = useRedemptionRuleByProject(String(effectiveProjectCode));

  // Nếu không có rule → cho phép nhập tay
  const isManualMode = redemptionRules.length === 0;

  // Chọn rule phù hợp nhất theo mốc bill
  const rule = useMemo(() => {
    if (isManualMode) return null;

    const total = parseFloat(billTotal.replace(/,/g, '')) || 0;

    // Sắp xếp rule theo billValuePerSpin tăng dần
    const sortedRules = [...redemptionRules].sort(
      (a, b) => (a.billValuePerSpin ?? 0) - (b.billValuePerSpin ?? 0)
    );

    // Nếu bill < mốc thấp nhất => không có lượt
    if (total < (sortedRules[0]?.billValuePerSpin ?? 0)) return null;

    // Tìm rule có billValuePerSpin <= tổng bill, và là mốc cao nhất có thể
    const matched = sortedRules
      .filter((r) => (r.billValuePerSpin ?? 0) <= total)
      .reduce((prev, curr) =>
        (curr.billValuePerSpin ?? 0) > (prev?.billValuePerSpin ?? 0) ? curr : prev
        , sortedRules[0]);

    return matched ?? null;
  }, [billTotal, redemptionRules, isManualMode]);

  // Tự động tính số lượt quay
  useEffect(() => {
    const total = parseFloat(billTotal.replace(/,/g, '')) || 0;

    if (!rule || (rule.billValuePerSpin ?? 0) === 0) {
      if (!isManualMode) setSpinCount('0');
      return;
    }

    let spins = 0;
    if (total >= (rule.billValuePerSpin ?? 0)) {
      spins = rule.maxSpinsPerBill ?? 0;
      if (rule.maxSpinsPerBill) {
        spins = Math.min(spins, rule.maxSpinsPerBill);
      }
    }

    setSpinCount(spins.toString());
  }, [billTotal, rule, isManualMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBillImage(e.target.files[0]);
  };

  const handleCaptureBill = () => {
    if (isAll) {
      setIsProjectModalOpen(true);
    } else {
      document.getElementById('bill-upload')?.click();
    }
  };

  const handleCreateSpinGrant = async (): Promise<string | null> => {
    if (!billImage) {
      setError('Vui lòng chụp ảnh bill.');
      return null;
    }
    if (!effectiveProjectCode) {
      setError('Vui lòng chọn dự án.');
      return null;
    }

    const spins = parseInt(spinCount, 10);
    if (!billTotal || isNaN(spins) || spins <= 0) {
      setError('Vui lòng nhập tổng giá trị bill và số lượt quay.');
      return null;
    }

    const formData = new FormData();
    formData.append('ProjectCode', String(effectiveProjectCode));
    formData.append('RuleID', String(rule?.ruleID ?? 0));
    formData.append('BillValue', billTotal.replace(/,/g, ''));
    formData.append('SpinsGranted', String(spins));
    formData.append('File', billImage);

    try {
      setIsSubmitting(true);
      const response = await createSpinGrant(formData) as any;
      if (response?.Data) return response.Data;
      else {
        setError('Tạo SpinGrant thất bại.');
        return null;
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo SpinGrant.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQrCode = useCallback(async () => {
    setError('');
    const encodedData = await handleCreateSpinGrant();
    if (!encodedData) return;
    const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL || window.location.origin;
    const url = `${baseUrl}/${encodedData}`;
    setQrData(url);
    setShowQr(true);
  }, [billTotal, spinCount, billImage, rule, effectiveProjectCode]);

  const resetForm = () => {
    setBillTotal('0');
    setSpinCount('0');
    setBillImage(null);
    setQrData(null);
    setError('');
    setShowQr(false);
  };

  const projectOptions: OptionType[] = projects.map((p) => ({
    value: String(p.value),
    label: p.label,
  }));

  return (
    <div className="min-h-[80vh] p-3 sm:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="overflow-hidden border bg-card shadow-xl shadow-slate-950/10">
          {/* Header */}
          <div className="relative border-b bg-slate-50 px-4 py-5 sm:px-6">
            {showQr && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-4"
                onClick={() => setShowQr(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Center title */}
            <div className="flex flex-col items-center gap-2 text-center text-xl font-semibold uppercase leading-tight text-foreground sm:text-2xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <QrCode className="h-6 w-6" />
              </span>
              <span>CHƯƠNG TRÌNH ĐỔI QUÀ</span>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            {!showQr ? (
              <div className="space-y-5">
                {/* Upload bill */}
                <div>
                  <input
                    id="bill-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start rounded-lg border-dashed bg-slate-50 px-4 py-5 text-left hover:border-primary/40 hover:bg-accent/50"
                    onClick={handleCaptureBill}
                  >
                    <span className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {billImage ? <Receipt className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                    </span>
                    <span className="min-w-0 break-all whitespace-normal">
                      {billImage ? billImage.name : 'Chụp ảnh bill'}
                    </span>
                  </Button>

                </div>

                {/* Tổng bill */}
                <div className="text-left">
                  <Label htmlFor="billTotal" className="font-semibold text-sm">
                    Tổng giá trị bill
                  </Label>
                  <Input
                    id="billTotal"
                    type="text"
                    value={billTotal}
                    onChange={(e) => setBillTotal(allowPositiveNumbersOnly(e.target.value))}
                    className="mt-2 text-right text-lg font-semibold"
                  />
                </div>

                {/* Số lượt quay */}
                <div className="text-left">
                  <Label htmlFor="spinCount" className="font-semibold text-sm">
                    Số lượt quay thưởng
                  </Label>
                  <Input
                    id="spinCount"
                    type="text"
                    value={spinCount}
                    onChange={(e) => setSpinCount(allowPositiveNumbersOnly(e.target.value))}
                    className="mt-2 text-right text-lg font-semibold"
                    disabled={!isManualMode}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  onClick={generateQrCode}
                  className="h-12 w-full font-semibold text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang tạo...' : 'TẠO MÃ QR'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                  Khách hàng quét mã QR bên dưới để tham gia chương trình đổi quà
                </p>

                <div className="flex justify-center">
                  <div className="flex w-full max-w-sm flex-col items-center rounded-lg border bg-white px-6 py-6 shadow-lg shadow-slate-950/10">
                    {/* QR */}
                    <div className="flex justify-center rounded-lg border bg-white p-4">
                      <QRCode value={qrData || ''} size={190} />
                    </div>

                    {/* URL */}
                    <div className="mt-4 max-w-[280px] break-all rounded-md bg-slate-50 p-3 text-center text-xs text-muted-foreground">
                      {qrData}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="secondary"
                    onClick={resetForm}
                    className="h-12 w-full font-semibold text-base"
                  >
                    Tạo mã mới
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal chọn dự án */}
      <Dialog open={isProjectModalOpen && isAll} onOpenChange={setIsProjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="required font-bold">Chọn dự án</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SearchableComboBox
              options={projectOptions}
              value={projectCode?.value || ''}
              onChange={(value) => {
                const selected = projectOptions.find(p => p.value === value);
                setProjectCode(selected || null);
              }}
              placeholder="Chọn dự án"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
              Trở về
            </Button>
            <Button
              onClick={() => {
                if (projectCode?.value) {
                  setSelectedProject(String(projectCode.value));
                  setIsProjectModalOpen(false);
                  document.getElementById('bill-upload')?.click();
                } else {
                  toast.error('Vui lòng chọn dự án');
                }
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRPage;
