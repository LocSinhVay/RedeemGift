import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [message, setMessage] = useState<string | null>(null);
    return (
        <ToastContext.Provider value={{ show: (m: string) => setMessage(m) }}>
            {children}
            {message ? (
                <View style={styles.toast}><Text style={styles.text}>{message}</Text></View>
            ) : null}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    toast: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#111827', padding: 12, borderRadius: 6, alignItems: 'center' },
    text: { color: 'white' },
});

export default ToastContext;
