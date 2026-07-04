import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';
import BrandMark from '../components/BrandMark';
import { colors, spacing, typography } from '../themes';

type DashboardStatKey = 'projects' | 'gifts' | 'prizes' | 'qrCodes' | 'spins' | 'customers';

type DashboardStats = Record<DashboardStatKey, number>;

const emptyTotals: DashboardStats = {
    projects: 0,
    gifts: 0,
    prizes: 0,
    qrCodes: 0,
    spins: 0,
    customers: 0,
};

const StatIcon = ({ name, color }: { name: string; color: string }) => {
    const common = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

    if (name === 'projects') {
        return (
            <Svg width={28} height={28} viewBox="0 0 28 28">
                <Rect x="5" y="7" width="18" height="15" rx="3" fill={`${color}18`} stroke={color} strokeWidth={2} />
                <Path d="M9 12h10M9 17h6" {...common} />
            </Svg>
        );
    }

    if (name === 'gifts') {
        return (
            <Svg width={28} height={28} viewBox="0 0 28 28">
                <Rect x="6" y="12" width="16" height="11" rx="2" fill={`${color}18`} stroke={color} strokeWidth={2} />
                <Path d="M5 10h18M14 10v13M10 10c-3-2.8-1.2-6 1.4-5.3 1.8.5 2.6 2.5 2.6 5.3M18 10c3-2.8 1.2-6-1.4-5.3-1.8.5-2.6 2.5-2.6 5.3" {...common} />
            </Svg>
        );
    }

    if (name === 'prizes') {
        return (
            <Svg width={28} height={28} viewBox="0 0 28 28">
                <Path d="M9 5h10v5a5 5 0 0 1-10 0V5Z" fill={`${color}18`} stroke={color} strokeWidth={2} />
                <Path d="M9 8H5c0 4 2.4 6 5 6M19 8h4c0 4-2.4 6-5 6M14 15v5M10 23h8" {...common} />
            </Svg>
        );
    }

    if (name === 'qrCodes') {
        return (
            <Svg width={28} height={28} viewBox="0 0 28 28">
                <Path d="M5 5h7v7H5V5Zm11 0h7v7h-7V5ZM5 16h7v7H5v-7Zm12 0h2v2h-2v-2Zm4 0h2v4h-2v-4Zm-4 4h6v3h-6v-3Z" fill={`${color}22`} stroke={color} strokeWidth={1.8} />
            </Svg>
        );
    }

    if (name === 'spins') {
        return (
            <Svg width={28} height={28} viewBox="0 0 28 28">
                <Circle cx="14" cy="14" r="9" fill={`${color}18`} stroke={color} strokeWidth={2} />
                <Path d="M14 5v18M5 14h18M8 8l12 12M20 8 8 20" {...common} />
            </Svg>
        );
    }

    return (
        <Svg width={28} height={28} viewBox="0 0 28 28">
            <Circle cx="14" cy="10" r="4" fill={`${color}18`} stroke={color} strokeWidth={2} />
            <Path d="M6 23c1.3-5 14.7-5 16 0" {...common} />
        </Svg>
    );
};

const mapDashboardStats = (response: any): DashboardStats => {
    const data = response?.Data || {};

    return {
        projects: Number(data.Projects ?? 0),
        gifts: Number(data.Gifts ?? 0),
        prizes: Number(data.Prizes ?? 0),
        qrCodes: Number(data.QrCodes ?? 0),
        spins: Number(data.Spins ?? 0),
        customers: Number(data.Customers ?? 0),
    };
};

export default function DashboardScreen() {
    const { auth } = useAuth();
    const { width } = useWindowDimensions();
    const [totals, setTotals] = useState<DashboardStats>(emptyTotals);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isWebWide = Platform.OS === 'web' && width >= 900;
    const statWidth = isWebWide ? '31.8%' : '48.5%';
    const selectedProject = auth?.SelectedProject || '';
    const projectCodes = useMemo(() => {
        if (!auth?.ProjectCodes) return [];
        return String(auth.ProjectCodes).split(',').map((item) => item.trim()).filter(Boolean);
    }, [auth?.ProjectCodes]);
    const hasProjectRestriction = projectCodes.length > 0;
    const selectedProjectCode = hasProjectRestriction ? selectedProject || projectCodes[0] || '' : '';

    const stats = useMemo(
        () => [
            { key: 'projects' as const, title: 'Dự án', value: totals.projects, color: colors.primary },
            { key: 'gifts' as const, title: 'Quà tặng', value: totals.gifts, color: colors.secondary },
            { key: 'prizes' as const, title: 'Giải thưởng', value: totals.prizes, color: colors.warning },
            { key: 'qrCodes' as const, title: 'QR Codes', value: totals.qrCodes, color: colors.success },
            { key: 'spins' as const, title: 'Lượt quay', value: totals.spins, color: colors.primaryDark },
            { key: 'customers' as const, title: 'Khách hàng', value: totals.customers, color: colors.secondaryDark },
        ],
        [totals]
    );

    const fetchDashboard = useCallback(async () => {
        if (!auth || (hasProjectRestriction && !selectedProjectCode)) return;

        try {
            setIsLoading(true);
            setErrorMessage('');
            const params = selectedProjectCode ? { projectCode: selectedProjectCode } : {};
            const response = await new ApiService('/dashboard/GetDashboardSummary', 'get', true).request<any>({}, params);

            if (response?.Status && response.Status !== 'Success') {
                throw new Error(response?.Message || 'Không thể tải dữ liệu dashboard.');
            }

            setTotals(mapDashboardStats(response));
        } catch (error: any) {
            setErrorMessage(error?.message || 'Không thể tải dữ liệu dashboard.');
        } finally {
            setIsLoading(false);
        }
    }, [auth, hasProjectRestriction, selectedProjectCode]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <SafeAreaView style={styles.page}>
            <ScrollView
                contentContainerStyle={[styles.content, isWebWide && styles.webContent]}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDashboard} />}
            >
                <View style={styles.hero}>
                    <View style={styles.heroBrand}>
                        <BrandMark size={52} />
                        <View style={styles.heroText}>
                            <Text style={styles.eyebrow}>Dashboard</Text>
                            <Text style={styles.title} numberOfLines={2}>Xin chào, {auth?.FullName || auth?.Username || 'Người dùng'}</Text>
                        </View>
                    </View>
                    <View style={styles.projectBadge}>
                        <Text style={styles.projectBadgeLabel}>Dự án hiện tại</Text>
                        <Text style={styles.projectBadgeValue} numberOfLines={1}>
                            {hasProjectRestriction ? selectedProjectCode || 'Chưa chọn' : 'Tất cả dự án'}
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Tổng quan</Text>
                        <Text style={styles.sectionMeta}>{selectedProjectCode ? `Dự án ${selectedProjectCode}` : 'Tất cả dự án'}</Text>
                    </View>
                    <Pressable disabled={isLoading} onPress={fetchDashboard} style={[styles.refreshButton, isLoading && styles.disabledButton]}>
                        {isLoading ? <ActivityIndicator size="small" color={colors.surface} /> : <Text style={styles.refreshText}>Tải lại</Text>}
                    </Pressable>
                </View>

                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <View style={styles.grid}>
                    {stats.map((item) => (
                        <View key={item.key} style={[styles.statCard, { width: statWidth }]}>
                            <View style={[styles.statIconBox, { backgroundColor: `${item.color}12` }]}>
                                <StatIcon name={item.key} color={item.color} />
                            </View>
                            <View style={styles.statText}>
                                <Text style={styles.statLabel} numberOfLines={1}>{item.title}</Text>
                                <Text style={[styles.statValue, { color: item.color }]}>{item.value.toLocaleString('vi-VN')}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.accountCard}>
                    <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
                    <InfoRow label="Username" value={auth?.Username} />
                    <InfoRow label="Email" value={auth?.Email} />
                    <InfoRow label="Vai trò" value={auth?.RoleName} />
                    <InfoRow label="Dự án hiện tại" value={hasProjectRestriction ? selectedProjectCode || 'Chưa chọn' : 'Tất cả dự án'} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
                {value || '-'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    webContent: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1120,
        paddingVertical: spacing.xl,
    },
    hero: {
        borderRadius: 8,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.lg,
        gap: spacing.lg,
        elevation: 1,
    },
    heroBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    heroText: {
        flex: 1,
        minWidth: 0,
    },
    eyebrow: {
        fontSize: typography.xs,
        fontWeight: '900',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    title: {
        marginTop: spacing.xs,
        fontSize: typography.xl,
        lineHeight: 28,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    projectBadge: {
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.md,
    },
    projectBadgeLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: '800',
    },
    projectBadgeValue: {
        marginTop: spacing.xs,
        color: colors.textPrimary,
        fontWeight: '900',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: typography.lg,
        fontWeight: '800',
    },
    sectionMeta: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.sm,
        fontWeight: '700',
    },
    refreshButton: {
        minWidth: 86,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
    },
    refreshText: {
        color: colors.surface,
        fontWeight: '800',
        fontSize: typography.sm,
    },
    disabledButton: {
        opacity: 0.65,
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
        fontWeight: '700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    statCard: {
        minHeight: 104,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
        elevation: 1,
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    statText: {
        flex: 1,
        minWidth: 0,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: typography.xl,
        fontWeight: '900',
    },
    accountCard: {
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        elevation: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    infoLabel: {
        flex: 1,
        fontSize: typography.sm,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    infoValue: {
        flex: 1.2,
        fontSize: typography.sm,
        color: colors.textPrimary,
        textAlign: 'right',
        fontWeight: '800',
    },
});
