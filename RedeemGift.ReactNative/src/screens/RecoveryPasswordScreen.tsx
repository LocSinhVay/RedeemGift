import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../themes';

type Props = {
    route: {
        params?: {
            userId?: string;
            token?: string;
        };
    };
};

const getParam = (value?: string | string[]) => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return '';

    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
};

export default function RecoveryPasswordScreen({ route }: Props) {
    const navigation = useNavigation<any>();
    const { logout } = useAuth();
    const { width } = useWindowDimensions();
    const isWebWide = Platform.OS === 'web' && width >= 768;

    const initialUserId = useMemo(() => getParam(route.params?.userId), [route.params?.userId]);
    const initialToken = useMemo(() => getParam(route.params?.token), [route.params?.token]);
    const [userId, setUserId] = useState(initialUserId);
    const [token, setToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hasRecoveryLink = !!userId.trim() && !!token.trim();
    const canSubmit = hasRecoveryLink && !!newPassword && !!confirmPassword && !isSubmitting;

    useEffect(() => {
        setUserId(initialUserId);
        setToken(initialToken);
    }, [initialToken, initialUserId]);

    const goToLogin = () => {
        logout();
        setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        }, 0);
    };

    const submit = async () => {
        setErrorMessage(null);

        if (!userId.trim() || !token.trim()) {
            setErrorMessage('Link khôi phục mật khẩu không hợp lệ hoặc đã thiếu thông tin xác nhận.');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setErrorMessage('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await new ApiService('/login/RecoveryPassword', 'post').request<any>({
                UserId: userId.trim(),
                Token: token.trim(),
                NewPassword: newPassword,
            });

            if (response?.Status && response.Status !== 'Success') {
                setErrorMessage(response.Message || 'Không thể khôi phục mật khẩu. Vui lòng thử lại.');
                return;
            }

            Alert.alert('Thành công', response?.Message || 'Khôi phục mật khẩu thành công.', [
                {
                    text: 'Đăng nhập',
                    onPress: goToLogin,
                },
            ]);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setErrorMessage(error?.message || 'Đã xảy ra lỗi khi khôi phục mật khẩu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
                <ScrollView contentContainerStyle={[styles.content, isWebWide && styles.webContent]} keyboardShouldPersistTaps="handled">
                    <View style={[styles.card, isWebWide && styles.webCard]}>
                        <Text style={styles.title}>Khôi phục mật khẩu</Text>
                        <Text style={styles.description}>Nhập mật khẩu mới cho tài khoản của bạn.</Text>

                        {!hasRecoveryLink ? (
                            <View style={styles.warningBox}>
                                <Text style={styles.warningText}>
                                    Link khôi phục mật khẩu không hợp lệ. Vui lòng mở lại link từ email khôi phục.
                                </Text>
                            </View>
                        ) : null}

                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <TextInput
                            editable={!isSubmitting && hasRecoveryLink}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={(value) => {
                                setNewPassword(value);
                                setErrorMessage(null);
                            }}
                            placeholder="Nhập mật khẩu mới"
                            placeholderTextColor={colors.textTertiary}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <TextInput
                            editable={!isSubmitting && hasRecoveryLink}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={(value) => {
                                setConfirmPassword(value);
                                setErrorMessage(null);
                            }}
                            placeholder="Xác nhận lại mật khẩu"
                            placeholderTextColor={colors.textTertiary}
                            style={styles.input}
                        />

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <Pressable disabled={!canSubmit} onPress={submit} style={[styles.button, !canSubmit && styles.disabledButton]}>
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Khôi phục mật khẩu</Text>}
                        </Pressable>

                        <Pressable disabled={isSubmitting} onPress={goToLogin} style={styles.loginLink}>
                            <Text style={styles.loginLinkText}>Quay lại đăng nhập</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    keyboard: { flex: 1 },
    content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingBottom: spacing.xxxl },
    webContent: { alignItems: 'center', paddingVertical: spacing.xxxl },
    card: {
        borderRadius: 8,
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    webCard: {
        width: '100%',
        maxWidth: 440,
    },
    title: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center' },
    description: { color: colors.textSecondary, fontSize: typography.sm, marginBottom: spacing.xl, textAlign: 'center' },
    label: { marginBottom: spacing.sm, color: colors.textPrimary, fontWeight: '700', fontSize: typography.sm },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        fontSize: typography.base,
    },
    warningBox: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.warningLight,
        backgroundColor: '#fffbeb',
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    warningText: {
        color: colors.warningDark,
        fontWeight: '700',
        textAlign: 'center',
        fontSize: typography.sm,
    },
    errorBox: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.errorLight,
        backgroundColor: '#fef2f2',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.errorDark,
        textAlign: 'center',
        fontSize: typography.sm,
        fontWeight: '700',
    },
    button: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.primary, marginTop: spacing.sm },
    disabledButton: { opacity: 0.55 },
    buttonText: { color: colors.surface, fontWeight: '800', fontSize: typography.base },
    loginLink: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    loginLinkText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: typography.sm,
    },
});
