import ApiService from '@/services/ApiService';

//#region Menu
export const getMenuByUserLogin = () => {
  return new ApiService('/menu/GetMenuByRoleID', 'get').request();
};

export const getMenuPagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/menu/MenuGetPagedList', 'get', true).request({}, queryParams);
};

export const getAllMenu = () => {
  return new ApiService('/menu/GetAllMenu', 'get').request();
};

export const insertMenu = (formData: FormData) => {
  return new ApiService('/menu/Insert', 'post').requestMultipart(formData);
};

export const updateMenu = (formData: FormData) => {
  return new ApiService('/menu/Update', 'post').requestMultipart(formData);
};

export const deleteMenu = (MenuID: number) => {
  return new ApiService('/menu/Delete', 'post').request({ MenuID });
};
//#endregion
