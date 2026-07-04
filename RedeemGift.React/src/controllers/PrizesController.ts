import ApiService from '@/services/ApiService';

//#region Prizes
export const getPrizePagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/prize/PrizeGetPagedList', 'get', true).request({}, queryParams);
};

export const insertPrize = (formData: FormData) => {
  return new ApiService('/prize/InsertPrize', 'post').requestMultipart(formData);
};

export const updatePrize = (formData: FormData) => {
  return new ApiService('/prize/UpdatePrize', 'post').requestMultipart(formData);
};

export const deletePrize = (PrizeID: number) => {
  return new ApiService('/prize/DeletePrize', 'post').request({ PrizeID });
};

export const getPrizesByProject = (projectCode: string) => {
  return new ApiService('/prize/GetPrizesByProject', 'get', true).request({}, { projectCode });
};
//#endregion
