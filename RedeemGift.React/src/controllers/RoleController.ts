import ApiService from '@/services/ApiService';

//#region Role
export const getRolePagedList = (query: string) => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/role/RoleGetPagedList', 'get', true).request({}, queryParams);
};

export const insertRole = (data: {
  RoleName: string;
  Symbol: string;
  Status: number;
  listRoleMenu: { RoleID: number; MenuID: number; IsChecked: boolean }[];
}) => {
  return new ApiService('/role/Insert', 'post').request(data);
};

export const updateRole = (data: {
  RoleID: number;
  RoleName: string;
  Symbol: string;
  Status: number;
  listRoleMenu: { RoleID: number; MenuID: number; IsChecked: boolean }[];
}) => {
  return new ApiService('/role/Update', 'post').request(data);
};

export const deleteRole = (RoleID: number) => {
  return new ApiService('/role/Delete', 'post').request({ RoleID });
};
//#endregion
