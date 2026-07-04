import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { AuthModel } from '../types/auth';
import BrandMark from '../components/BrandMark';
import { colors, spacing, typography } from '../themes';

type LoginResponse = {
    Status: 'Success' | 'Error';
    Message?: string;
    Data?: AuthModel;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function LoginScreen() {
    const { saveAuth } = useAuth();
    const { width } = useWindowDimensions();
    const [username, setUsername] = useState('SADM_000001');
    const [password, setPassword] = useState('123456');
    const [resetEmail, setResetEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [resetEmailError, setResetEmailError] = useState<string | null>(null);

    const isSmallScreen = width < 380;
    const isWebWide = Platform.OS === 'web' && width >= 768;
    const logoSize = isSmallScreen ? 72 : 96;
    const canSubmit = !!username.trim() && !!password.trim() && !isSubmitting;

    const clearLoginMessages = () => {
        setValidationMessage(null);
        setErrorMessage(null);
    };

    const closeForgotPassword = () => {
        if (isSendingReset) return;
        setShowForgotPassword(false);
        setResetEmail('');
        setResetEmailError(null);
    };

    const handleLogin = async () => {
        setErrorMessage(null);

        if (!username.trim() || !password.trim()) {
            setValidationMessage('Vui lòng nhập Username và mật khẩu.');
            return;
        }

        setValidationMessage(null);

        try {
            setIsSubmitting(true);
            const response = await new ApiService('/login/Login', 'post').request<LoginResponse>({
                Username: username.trim(),
                Password: password,
            });

            if (response.Status !== 'Success' || !response.Data?.Token) {
                setErrorMessage(response.Message || 'Thông tin đăng nhập không hợp lệ.');
                return;
            }

            saveAuth(response.Data);
        } catch (error: any) {
            setErrorMessage(error?.message || 'Đã xảy ra lỗi khi đăng nhập.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        setResetEmailError(null);

        if (!resetEmail.trim()) {
            setResetEmailError('Bắt buộc nhập Email.');
            return;
        }

        if (!isValidEmail(resetEmail)) {
            setResetEmailError('Sai định dạng email.');
            return;
        }

        try {
            setIsSendingReset(true);
            const response = await new ApiService('/login/SendRequest', 'post').request<LoginResponse>({
                Email: resetEmail.trim(),
            });

            if (response.Status !== 'Success') {
                setResetEmailError(response.Message || 'Không thể gửi yêu cầu.');
                return;
            }

            Alert.alert(
                'Thành công',
                response.Message ||
                'Yêu cầu khôi phục mật khẩu đã được tiếp nhận. Vui lòng kiểm tra e-mail và thực hiện theo hướng dẫn.'
            );
            setResetEmail('');
            setShowForgotPassword(false);
        } catch (error: any) {
            setResetEmailError(error?.message || 'Đã xảy ra lỗi khi gửi yêu cầu khôi phục mật khẩu. Vui lòng thử lại.');
        } finally {
            setIsSendingReset(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
            <ScrollView contentContainerStyle={[styles.content, isWebWide && styles.webContent]} keyboardShouldPersistTaps="handled">
                <View style={[styles.panel, isWebWide && styles.webPanel]}>
                    <View style={styles.brandHeader}>
                        <View style={styles.logo}>
                            <BrandMark size={logoSize} />
                        </View>
                        <Text style={styles.title}>RedeemGift</Text>
                        <Text style={styles.subtitle}>Đăng nhập để quản lý vòng quay may mắn</Text>
                    </View>

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isSubmitting}
                        onChangeText={(value) => {
                            setUsername(value);
                            clearLoginMessages();
                        }}
                        placeholder="Nhập Username"
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.input, validationMessage && !username.trim() && styles.inputError]}
                        value={username}
                    />

                    <Text style={styles.label}>Mật khẩu</Text>
                    <TextInput
                        editable={!isSubmitting}
                        onChangeText={(value) => {
                            setPassword(value);
                            clearLoginMessages();
                        }}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                        style={[styles.input, validationMessage && !password.trim() && styles.inputError]}
                        value={password}
                    />

                    {validationMessage ? <Text style={styles.fieldError}>{validationMessage}</Text> : null}
                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <Pressable
                        disabled={!canSubmit}
                        onPress={handleLogin}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && canSubmit ? styles.buttonPressed : null,
                            !canSubmit ? styles.buttonDisabled : null,
                        ]}
                    >
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
                    </Pressable>

                    <Pressable onPress={() => setShowForgotPassword(true)} style={styles.forgotLink}>
                        <Text style={styles.forgotLinkText}>Quên mật khẩu?</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <Modal animationType="fade" transparent visible={showForgotPassword} onRequestClose={closeForgotPassword}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
                    <View style={[styles.modalPanel, isWebWide && styles.webModalPanel]}>
                        <Text style={styles.resetTitle}>Quên mật khẩu?</Text>
                        <Text style={styles.resetDescription}>Nhập e-mail khôi phục mật khẩu</Text>

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isSendingReset}
                            keyboardType="email-address"
                            onChangeText={(value) => {
                                setResetEmail(value);
                                setResetEmailError(null);
                            }}
                            placeholder="Nhập email"
                            placeholderTextColor={colors.textTertiary}
                            style={[styles.input, resetEmailError && styles.inputError]}
                            value={resetEmail}
                        />
                        {resetEmailError ? <Text style={styles.fieldError}>{resetEmailError}</Text> : null}

                        <View style={styles.modalActions}>
                            <Pressable disabled={isSendingReset} onPress={closeForgotPassword} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Đóng</Text>
                            </Pressable>
                            <Pressable
                                disabled={isSendingReset}
                                onPress={handleForgotPassword}
                                style={({ pressed }) => [
                                    styles.resetButton,
                                    pressed && !isSendingReset ? styles.resetButtonPressed : null,
                                    isSendingReset ? styles.buttonDisabled : null,
                                ]}
                            >
                                {isSendingReset ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.resetButtonText}>Gửi</Text>}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    webContent: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    panel: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        padding: spacing.xl,
        shadowColor: colors.textPrimary,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
    webPanel: {
        width: '100%',
        maxWidth: 460,
    },
    brandHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        marginTop: spacing.md,
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    label: {
        marginBottom: spacing.sm,
        fontWeight: '600',
        fontSize: typography.sm,
        color: colors.textPrimary,
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        fontSize: typography.base,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.error,
    },
    fieldError: {
        marginTop: -spacing.md,
        marginBottom: spacing.md,
        color: colors.error,
        fontSize: typography.sm,
        fontWeight: '600',
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
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        borderRadius: 8,
        backgroundColor: colors.primary,
        marginTop: spacing.md,
    },
    buttonPressed: {
        backgroundColor: colors.primaryDark,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: typography.base,
        color: colors.surface,
        fontWeight: '700',
    },
    forgotLink: {
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingVertical: spacing.sm,
    },
    forgotLinkText: {
        color: colors.primary,
        fontSize: typography.sm,
        fontWeight: '700',
    },
    modalBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.overlay,
        padding: spacing.lg,
    },
    modalPanel: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: colors.surface,
        padding: spacing.xl,
    },
    webModalPanel: {
        maxWidth: 420,
    },
    resetTitle: {
        marginBottom: spacing.sm,
        textAlign: 'center',
        fontSize: typography.lg,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    resetDescription: {
        marginBottom: spacing.lg,
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        fontSize: typography.base,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    resetButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        borderRadius: 8,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    resetButtonPressed: {
        backgroundColor: colors.primaryDark,
    },
    resetButtonText: {
        fontSize: typography.base,
        color: colors.surface,
        fontWeight: '700',
    },
});
