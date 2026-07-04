import ApiService from '@/services/ApiService';

//#region QR
export const getQRPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/qr/QRGetPagedList', 'get', true).request({}, queryParams);
};

export const insertQR = (formData: FormData) => {
  return new ApiService('/qr/InsertQR', 'post').requestMultipart(formData);
};

export const updateQR = (formData: FormData) => {
  return new ApiService('/qr/UpdateQR', 'post').requestMultipart(formData);
};

export const updateQRStatus = (queryParams: Record<string, any>) => {
  return new ApiService('/qr/UpdateQRStatus', 'post', true).request({}, queryParams);
};
//#endregion
