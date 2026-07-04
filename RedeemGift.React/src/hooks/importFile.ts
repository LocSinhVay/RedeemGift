import { toast } from 'sonner';

export const importFile = async (
  importFunction: (file: File) => Promise<any>,
  file: File | undefined,
  onSuccess?: () => void,
) => {
  try {
    // Kiểm tra nếu không có file
    if (!file) {
      toast.warning('Vui lòng chọn một tệp để nhập liệu!');
      return;
    }

    // Kiểm tra định dạng file
    const validFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validFileTypes.includes(file.type)) {
      toast.warning('Chỉ hỗ trợ các file Excel (.xlsx, .xls)!');
      return;
    }

    // Confirm
    if (!confirm(`Bạn có chắc chắn muốn nhập dữ liệu từ file: ${file.name}?`)) {
      toast.info('Bạn đã hủy nhập liệu.');
      return;
    }

    toast.loading('Đang xử lý nhập liệu...');

    // Gọi hàm nhập dữ liệu
    const response = await importFunction(file);

    toast.dismiss();

    // Thông báo thành công
    if (response.Status === "Success") {
      toast.success('Dữ liệu đã được nhập thành công!');
      if (onSuccess) onSuccess();
    } else {
      toast.warning(response.Message || 'Có lỗi xảy ra khi nhập dữ liệu!');
    }
  } catch (error) {
    console.error('Lỗi khi nhập dữ liệu:', error);
    toast.dismiss();
    toast.error('Có lỗi xảy ra khi nhập dữ liệu!');
  }
};
