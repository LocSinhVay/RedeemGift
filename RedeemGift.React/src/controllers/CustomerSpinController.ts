import ApiService from '@/services/ApiService';

//#region CustomerSpin
export const getCustomerSpinPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/customerSpin/CustomerSpinGetPagedList', 'get', true).request({}, queryParams);
};

export const getWinningsPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/customerSpin/WinningsGetPagedList', 'get', true).request({}, queryParams);
};

export const createSpinGrant = (formData: FormData) => {
  return new ApiService('/customerSpin/CreateSpinGrant', 'post').requestMultipart(formData);
};

export const getDetailSpinInfoBySpinGrantId = (spinGrantId: string) => {
  return new ApiService('/claimSpin/SpinInfoBySpinGrantIdGetDetail', 'get', true).request({}, { spinGrantId });
};

export const claimSpins = (formData: FormData) => {
  return new ApiService('/claimSpin/ClaimSpins', 'post').requestMultipart(formData);
};

export const spinWheel = (spinGrantId: string) => {
  return new ApiService('/claimSpin/SpinWheel', 'post', true).request({}, { spinGrantId });
};
//#endregion
