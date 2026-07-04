import ApiService from '@/services/ApiService';
import { ApiResponse, AuthModel } from '@/types';

export const login = (username: string, password: string): Promise<ApiResponse<AuthModel>> => {
  return new ApiService('/login/Login', 'post').request({
    Username: username,
    Password: password,
  });
};

export const sendRequestReset = (email: string): Promise<ApiResponse> => {
  return new ApiService('/login/SendRequest', 'post').request({ Email: email });
};

export const recoveryPassword = (
  userId: string,
  token: string,
  newPassword: string
): Promise<ApiResponse> => {
  return new ApiService('/login/RecoveryPassword', 'post').request({
    UserId: userId,
    Token: token,
    NewPassword: newPassword,
  });
};