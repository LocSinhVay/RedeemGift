import { AxiosInstance } from 'axios';
import { AuthModel } from '@/types/auth';

const AUTH_STORAGE_KEY = 'authData';
const storage = localStorage;

export const getAuth = (): AuthModel | null => {
  const value = storage.getItem(AUTH_STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthModel;
  } catch (error) {
    console.error('AUTH STORAGE PARSE ERROR', error);
    return null;
  }
};

export const setAuth = (auth: AuthModel | null) => {
  try {
    if (auth) {
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      storage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('AUTH STORAGE SAVE ERROR', error);
  }
};

export const removeAuth = () => {
  try {
    storage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('AUTH STORAGE REMOVE ERROR', error);
  }
};

export const checkAuth = (): boolean => {
  const auth = getAuth();
  return !!(auth && auth.Token);
};

// Setup axios interceptor
export function setupAxios(axiosInstance: AxiosInstance) {
  axiosInstance.defaults.headers.Accept = 'application/json';

  axiosInstance.interceptors.request.use(
    (config) => {
      const auth = getAuth();
      if (auth) {
        config.headers.Authorization = `Bearer ${auth.Token}`;
        config.headers.Username = auth.Username;
        config.headers.RoleID = auth.RoleID.toString();
        if (auth.ProjectID) {
          config.headers.ProjectID = auth.ProjectID.toString();
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeAuth();
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );
}

export { AUTH_STORAGE_KEY };
