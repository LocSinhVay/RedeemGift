import ApiService from '@/services/ApiService';
import { ApiResponse } from '@/types';

export const getProjectPagedList = (query: string): Promise<ApiResponse> => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/project/ProjectGetPagedList', 'get', true).request({}, queryParams);
};

export const insertProject = (formData: FormData): Promise<ApiResponse> => {
  return new ApiService('/project/InsertProject', 'post').requestMultipart(formData);
};

export const updateProject = (formData: FormData): Promise<ApiResponse> => {
  return new ApiService('/project/UpdateProject', 'post').requestMultipart(formData);
};

export const updateProjectStatus = (queryParams: Record<string, unknown>): Promise<ApiResponse> => {
  return new ApiService('/project/UpdateProjectStatus', 'post', true).request({}, queryParams);
};

export const getAllProject = (): Promise<ApiResponse> => {
  return new ApiService('/project/getAllProject', 'get').request();
};
