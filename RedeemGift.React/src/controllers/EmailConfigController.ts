import ApiService from '@/services/ApiService';

export const chooseEmailConfig = (EmailId: number) => {
  return new ApiService('/emailConfig/ChooseEmailConfig', 'post').request({ EmailId });
};

export const getEmailConfigPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/emailConfig/EmailConfigGetPagedList', 'get', true).request({}, queryParams);
};

export const getAllEmailConfig = () => {
  return new ApiService('/emailConfig/GetAllEmailConfig', 'get').request();
};

export const insertEmailConfig = (formData: FormData) => {
  return new ApiService('/emailConfig/Insert', 'post').requestMultipart(formData);
};

export const updateEmailConfig = (formData: FormData) => {
  return new ApiService('/emailConfig/Update', 'post').requestMultipart(formData);
};

export const deleteEmailConfig = (EmailId: number) => {
  return new ApiService('/emailConfig/Delete', 'post').request({ EmailId });
};
