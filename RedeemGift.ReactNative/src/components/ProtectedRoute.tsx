import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
    const { auth, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!auth) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>Bạn cần đăng nhập để tiếp tục.</Text>
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    message: {
        color: '#64748b',
        fontWeight: '700',
        textAlign: 'center',
    },
});
