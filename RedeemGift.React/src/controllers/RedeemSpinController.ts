import ApiService from '@/services/ApiService';

//#region RedeemSpin
export const getRedeemSpinPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/redeemSpin/RedeemSpinGetPagedList', 'get', true).request({}, queryParams);
};

export const insertRedeemSpin = (formData: FormData) => {
  return new ApiService('/redeemSpin/InsertRedeemSpin', 'post').requestMultipart(formData);
};

export const updateRedeemSpin = (formData: FormData) => {
  return new ApiService('/redeemSpin/UpdateRedeemSpin', 'post').requestMultipart(formData);
};

export const deleteRedeemSpin = (RuleID: number) => {
  return new ApiService('/redeemSpin/DeleteRedeemSpin', 'post').request({ RuleID });
};

export const getListRedemptionRuleByProject = (projectCode: string) => {
  return new ApiService('/redeemSpin/RedemptionRuleByProjectGetList', 'get', true).request({}, { projectCode });
};
//#endregion
