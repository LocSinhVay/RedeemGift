import { toast } from 'sonner';

type SubmitFormOptions = {
  formFields: Record<string, any>;
  fileField?: { name: string; file: File };
  apiFunction: (formData: FormData) => Promise<any>;
  onSuccess?: () => void;
};

export const submitFormData = async ({
  formFields,
  fileField,
  apiFunction,
  onSuccess,
}: SubmitFormOptions) => {
  try {
    const formData = new FormData();

    // Add all fields
    Object.entries(formFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add file if exists
    if (fileField?.file) {
      formData.append(fileField.name, fileField.file);
    }

    const result = await apiFunction(formData);

    if (result.Status === "Success" || result === 1) {
      toast.success("Cập nhật thành công!");
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.Message || "Không thể cập nhật dữ liệu!");
    }
  } catch (error) {
    toast.error("Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại!");
  }
};
