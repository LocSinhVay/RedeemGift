import ApiService from '@/services/ApiService';
import { ApiResponse } from '@/types';

export const getDashboardSummary = (query: string): Promise<ApiResponse> => {
  const queryParams = Object.fromEntries(new URLSearchParams(query));
  return new ApiService('/dashboard/GetDashboardSummary', 'get', true).request({}, queryParams);
};
