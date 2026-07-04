import ApiService from '@/services/ApiService';

//#region UserSystem
export const getUserSystemPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/systemUser/UserSystemGetPagedList', 'get', true).request({}, queryParams);
};

export const getAllRole = () => {
  return new ApiService('/systemUser/GetAllRole', 'get').request();
};

export const getNewUsername = (symbol: string) => {
  return new ApiService('/systemUser/GetNewUsername', 'get', true).request({}, { symbol });
};

export const exportUserSystem = (queryParams: Record<string, any>) => {
  return new ApiService('/systemUser/Export', 'get', true).requestPdf({}, queryParams);
};

export const insertUserSystem = (formData: FormData) => {
  return new ApiService('/systemUser/Insert', 'post').requestMultipart(formData);
};

export const updateUserSystem = (formData: FormData) => {
  return new ApiService('/systemUser/Update', 'post').requestMultipart(formData);
};

export const deleteUserSystem = (UserID: number) => {
  return new ApiService('/systemUser/Delete', 'post').request({ UserID });
};

export const resetPassword = (UserID: number) => {
  return new ApiService('/systemUser/UpdatePassword', 'post').request({ UserID });
};

export const changePassword = (Password: string, NewPassword: string, ConfirmNewPassword: string, IsReset: boolean) => {
  return new ApiService('/systemUser/UpdatePassword', 'post').request({ Password, NewPassword, ConfirmNewPassword, IsReset });
};

export const getListSup = () => {
  return new ApiService('/systemUser/GetListSup', 'get').request();
};
//#endregion
