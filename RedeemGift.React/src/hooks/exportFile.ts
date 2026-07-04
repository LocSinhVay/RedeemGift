import { toast } from 'sonner';

export const exportFile = async (
  exportFunction: (params: any) => Promise<Blob>,
  queryParams: Record<string, string | number | undefined>,
  fileName: string = 'ExportedFile.xlsx'
) => {
  try {
    toast.loading('Đang tải file...');

    const blob = await exportFunction(queryParams);

    toast.dismiss();

    if (!blob || blob.size === 0 || blob.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast.warning('Không có dữ liệu để export!');
      return;
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Xuất file thành công!');

  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    toast.dismiss();
    toast.error('Có lỗi xảy ra khi xuất file!');
  }
};
