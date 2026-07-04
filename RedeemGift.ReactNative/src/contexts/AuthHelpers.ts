import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance } from 'axios';
import { AuthModel } from '../types/auth';

const AUTH_STORAGE_KEY = 'authData';

export const getAuth = async (): Promise<AuthModel | null> => {
    try {
        const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!value) return null;
        return JSON.parse(value) as AuthModel;
    } catch (error) {
        console.error('AUTH STORAGE PARSE ERROR', error);
        return null;
    }
};

export const setAuth = async (auth: AuthModel | null) => {
    try {
        if (auth) {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        } else {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch (error) {
        console.error('AUTH STORAGE SAVE ERROR', error);
    }
};

export const removeAuth = async () => {
    try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.error('AUTH STORAGE REMOVE ERROR', error);
    }
};

export const checkAuth = async (): Promise<boolean> => {
    const auth = await getAuth();
    return !!(auth && auth.Token);
};

export function setupAxios(axiosInstance: AxiosInstance) {
    axiosInstance.defaults.headers.Accept = 'application/json';

    axiosInstance.interceptors.request.use(
        async (config) => {
            const auth = await getAuth();
            if (auth) {
                const headers = (config.headers || {}) as any;
                headers.Authorization = `Bearer ${auth.Token}`;
                headers.Username = auth.Username;
                headers.RoleID = auth.RoleID?.toString?.();
                if (auth.ProjectID) {
                    headers.ProjectID = auth.ProjectID?.toString?.();
                }
                config.headers = headers;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                await removeAuth();
            }
            return Promise.reject(error);
        }
    );
}

export { AUTH_STORAGE_KEY };
