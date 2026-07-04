import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthModel } from '../types/auth';
import * as authHelper from './AuthHelpers';

interface AuthContextProps {
    auth: AuthModel | null;
    saveAuth: (auth: AuthModel | null) => void;
    updateSelectedProject: (projectCode: string | null) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
    auth: null,
    saveAuth: () => { },
    updateSelectedProject: () => { },
    logout: () => { },
    isLoading: true,
});

export const useAuth = () => {
    return useContext(AuthContext);
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState<AuthModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const storedAuth = await authHelper.getAuth();
            if (storedAuth) {
                setAuth(storedAuth);
            }
            setIsLoading(false);
        })();
    }, []);

    const saveAuth = (newAuth: AuthModel | null) => {
        setAuth((prevAuth) => {
            const isSame = JSON.stringify(prevAuth) === JSON.stringify(newAuth);
            if (isSame) return prevAuth;

            // persist async, don't block UI
            authHelper.setAuth(newAuth);
            return newAuth;
        });
    };

    const updateSelectedProject = (projectCode: string | null) => {
        if (!auth) return;
        const updated = { ...auth, SelectedProject: projectCode } as AuthModel;
        setAuth(updated);
        authHelper.setAuth(updated);
    };

    const logout = () => {
        saveAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, saveAuth, updateSelectedProject, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
