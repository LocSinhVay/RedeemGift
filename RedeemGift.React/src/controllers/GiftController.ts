import ApiService from '@/services/ApiService';
import { ApiResponse } from '@/types';

export const getGiftPagedList = (query: string): Promise<ApiResponse> => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/gift/GiftGetPagedList', 'get', true).request({}, queryParams);
};

export const insertGift = (formData: FormData): Promise<ApiResponse> => {
  return new ApiService('/gift/InsertGift', 'post').requestMultipart(formData);
};

export const updateGift = (formData: FormData): Promise<ApiResponse> => {
  return new ApiService('/gift/UpdateGift', 'post').requestMultipart(formData);
};

export const updateGiftStatus = (queryParams: Record<string, unknown>): Promise<ApiResponse> => {
  return new ApiService('/gift/UpdateGiftStatus', 'post', true).request({}, queryParams);
};
