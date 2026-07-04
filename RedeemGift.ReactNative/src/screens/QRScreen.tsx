import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Image,
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
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography } from '../themes';
import DropDownPicker from '../components/DropDownPicker';

type ProjectOption = {
    value: string;
    label: string;
};

type RedemptionRule = {
    ruleID: number;
    projectCode: string;
    billValuePerSpin: number;
    maxSpinsPerBill: number;
};

type DropdownValueUpdater<T> = T | ((current: T) => T);

const onlyNumber = (value: string) => value.replace(/[^0-9]/g, '');
const toNumber = (value: string) => Number(onlyNumber(value)) || 0;
const formatNumberInput = (value: string) => {
    const digits = onlyNumber(value);
    return digits ? Number(digits).toLocaleString('en-US') : '0';
};

const CopyIcon = ({ color = colors.primary }: { color?: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24">
        <Rect x="8" y="8" width="11" height="11" rx="2" fill="none" stroke={color} strokeWidth={2} />
        <Path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function QRScreen() {
    const { auth } = useAuth();
    const navigation = useNavigation<any>();
    const { width } = useWindowDimensions();
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [openProjectDropdown, setOpenProjectDropdown] = useState(false);
    const [rules, setRules] = useState<RedemptionRule[]>([]);
    const [billTotal, setBillTotal] = useState('0');
    const [spinCount, setSpinCount] = useState('0');
    const [billImage, setBillImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [qrData, setQrData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSmallScreen = width < 380;
    const isWebWide = Platform.OS === 'web' && width >= 900;
    const qrSize = isSmallScreen ? 160 : 200;
    const imagePlaceholderHeight = isSmallScreen ? 120 : 160;

    const allowedProjectCodes = useMemo(() => {
        if (!auth?.ProjectCodes) return [];
        return auth.ProjectCodes.split(',').map((item) => item.trim()).filter(Boolean);
    }, [auth?.ProjectCodes]);
    const isAllProject = allowedProjectCodes.length === 0;
    const hasProjectRestriction = allowedProjectCodes.length > 0;
    const visibleProjects = useMemo(() => {
        if (isAllProject) return projects;
        return projects.filter((project) => allowedProjectCodes.includes(project.value));
    }, [allowedProjectCodes, isAllProject, projects]);
    const effectiveProject = selectedProject || (hasProjectRestriction ? auth?.SelectedProject || allowedProjectCodes[0] || '' : '');
    const shouldShowProjectSelector = !!billImage && !hasProjectRestriction;
    const projectItems = useMemo(
        () => visibleProjects.map((project) => ({ label: project.label, value: project.value })),
        [visibleProjects]
    );

    const fetchProjects = useCallback(async () => {
        try {
            const response = await new ApiService('/project/getAllProject', 'get').request<any>();
            const data = Array.isArray(response?.Data) ? response.Data : [];
            const mapped = data.map((item: any) => ({
                value: item.ProjectCode,
                label: item.ProjectName || item.ProjectCode,
            }));
            setProjects(mapped);
            if (hasProjectRestriction) {
                const defaultProject = auth?.SelectedProject || allowedProjectCodes[0] || '';
                setSelectedProject((current) => current || defaultProject);
            }
        } catch {
            setProjects([]);
        }
    }, [allowedProjectCodes, auth?.SelectedProject, hasProjectRestriction]);

    const fetchRules = useCallback(async (projectCode: string) => {
        if (!projectCode) {
            setRules([]);
            return;
        }

        try {
            const response = await new ApiService('/redeemSpin/RedemptionRuleByProjectGetList', 'get', true).request<any>(
                {},
                { projectCode }
            );
            const data = response?.Data ? (Array.isArray(response.Data) ? response.Data : [response.Data]) : [];
            setRules(
                data.map((item: any) => ({
                    ruleID: item.RuleID,
                    projectCode: item.ProjectCode,
                    billValuePerSpin: Number(item.BillValuePerSpin || 0),
                    maxSpinsPerBill: Number(item.MaxSpinsPerBill || 0),
                }))
            );
        } catch {
            setRules([]);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        fetchRules(effectiveProject);
    }, [effectiveProject, fetchRules]);

    const isManualMode = rules.length === 0;

    const rule = useMemo(() => {
        if (isManualMode) return null;
        const total = toNumber(billTotal);
        const sorted = [...rules].sort((a, b) => a.billValuePerSpin - b.billValuePerSpin);
        return sorted.filter((item) => item.billValuePerSpin <= total).pop() || null;
    }, [billTotal, isManualMode, rules]);

    useEffect(() => {
        if (isManualMode) return;
        if (!rule || !rule.billValuePerSpin) {
            setSpinCount('0');
            return;
        }
        setSpinCount(formatNumberInput(String(rule.maxSpinsPerBill || 0)));
    }, [isManualMode, rule]);

    const pickImage = async (useCamera: boolean) => {
        try {
            const permission = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Thông báo', 'Vui lòng cấp quyền truy cập ảnh/camera.');
                return;
            }

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

            if (!result.canceled && result.assets[0]) {
                setBillImage(result.assets[0]);
                setQrData('');
                if (hasProjectRestriction) {
                    setSelectedProject(auth?.SelectedProject || allowedProjectCodes[0] || '');
                }
            }
        } catch (error: any) {
            Alert.alert('Không thể mở camera', error?.message || 'Thiết bị không hỗ trợ hoặc chưa cấp quyền camera.');
        }
    };

    const createQr = async () => {
        if (!effectiveProject) {
            Alert.alert('Thông báo', 'Vui lòng chọn dự án.');
            return;
        }
        if (!billImage) {
            Alert.alert('Thông báo', 'Vui lòng chụp hoặc chọn ảnh bill.');
            return;
        }
        const spins = toNumber(spinCount);
        const billValue = toNumber(billTotal);
        if (!billValue || spins <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập tổng bill và số lượt quay hợp lệ.');
            return;
        }

        const formData = new FormData();
        formData.append('ProjectCode', effectiveProject);
        formData.append('RuleID', String(rule?.ruleID ?? 0));
        formData.append('BillValue', String(billValue));
        formData.append('SpinsGranted', String(spins));
        const imageAsset = billImage as any;
        formData.append('File', {
            uri: billImage.uri,
            name: billImage.fileName || `bill-${Date.now()}.jpg`,
            type: imageAsset.mimeType || imageAsset.type || 'image/jpeg',
        } as any);

        try {
            setIsSubmitting(true);
            const response = await new ApiService('/customerSpin/CreateSpinGrant', 'post').requestMultipart(formData);
            if (!response?.Data) {
                Alert.alert('Lỗi', response?.Message || 'Tạo mã QR thất bại.');
                return;
            }
            const luckyWheelUrl = ((process.env.EXPO_PUBLIC_LUCKY_WHEEL_URL as string) || 'https://gifts.peoplelinkvietnam.com/luckyWheel').replace(/\/$/, '');
            setQrData(`${luckyWheelUrl}/${response.Data}`);
        } catch (error: any) {
            Alert.alert('Lỗi', error?.message || 'Không thể tạo mã QR.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyQrLink = () => {
        try {
            Clipboard.setString(qrData);
            Alert.alert('Đã sao chép', 'Đã sao chép link QR.');
        } catch (error: any) {
            Alert.alert('Không thể sao chép', error?.message || 'Vui lòng thử lại.');
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <ScrollView contentContainerStyle={[styles.content, isWebWide && styles.webContent]} keyboardShouldPersistTaps="handled">
                <View style={[styles.card, isWebWide && styles.webCard]}>
                    <Text style={styles.title}>Chương trình đổi quà</Text>


                    <Text style={styles.label}>Ảnh bill</Text>
                    {billImage ? (
                        <Image source={{ uri: billImage.uri }} style={[styles.billImage, { height: imagePlaceholderHeight }]} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { height: imagePlaceholderHeight }]}>
                            <Text style={styles.muted}>Chưa có ảnh bill</Text>
                        </View>
                    )}
                    <View style={styles.buttonRow}>
                        <Pressable onPress={() => pickImage(true)} style={styles.secondaryButton}>
                            <Text style={styles.secondaryText}>Chụp ảnh</Text>
                        </Pressable>
                        <Pressable onPress={() => pickImage(false)} style={styles.secondaryButton}>
                            <Text style={styles.secondaryText}>Chọn ảnh</Text>
                        </Pressable>
                    </View>

                    {shouldShowProjectSelector ? (
                        <>
                            <Text style={styles.label}>Dự án</Text>
                            <View style={styles.dropdownWrap}>
                                <DropDownPicker
                                    open={openProjectDropdown}
                                    value={selectedProject || null}
                                    items={projectItems}
                                    setOpen={setOpenProjectDropdown}
                                    setValue={(nextValue: DropdownValueUpdater<string | null>) => {
                                        const next = typeof nextValue === 'function' ? nextValue(selectedProject) : nextValue;
                                        setSelectedProject(String(next ?? ''));
                                        setQrData('');
                                    }}
                                    setItems={() => undefined}
                                    onChangeValue={(next: string | null) => {
                                        setSelectedProject(String(next ?? ''));
                                        setQrData('');
                                    }}
                                    placeholder="Chọn dự án"
                                    searchable
                                    searchPlaceholder="Tìm kiếm..."
                                    listMode="MODAL"
                                    modalTitle="Dự án"
                                    style={styles.dropdown}
                                    textStyle={styles.dropdownText}
                                    placeholderStyle={styles.dropdownPlaceholder}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                />
                                {selectedProject ? (
                                    <Pressable
                                        onPress={() => {
                                            setSelectedProject('');
                                            setQrData('');
                                        }}
                                        style={styles.selectClearButton}
                                    >
                                        <Text style={styles.selectClearText}>×</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        </>
                    ) : null}

                    <Text style={styles.label}>Tổng giá trị bill</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={billTotal}
                        onChangeText={(value) => setBillTotal(formatNumberInput(value))}
                        style={styles.input}
                        placeholder="Nhập số tiền"
                        placeholderTextColor={colors.textTertiary}
                    />

                    <Text style={styles.label}>Số lượt quay thưởng</Text>
                    <TextInput
                        editable={isManualMode}
                        keyboardType="numeric"
                        value={spinCount}
                        onChangeText={(value) => setSpinCount(formatNumberInput(value))}
                        style={[styles.input, !isManualMode && styles.inputDisabled]}
                        placeholder="Số lượt quay"
                        placeholderTextColor={colors.textTertiary}
                    />

                    <Pressable disabled={isSubmitting} onPress={createQr} style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Tạo mã QR</Text>}
                    </Pressable>
                </View>

                {qrData ? (
                    <View style={[styles.qrCard, isWebWide && styles.webQrCard]}>
                        <Text style={styles.qrTitle}>Mã QR của bạn</Text>
                        <View style={styles.qrContainer}>
                            <QRCode value={qrData} size={qrSize} />
                        </View>
                        <View style={styles.qrLinkRow}>
                            <Text style={styles.qrUrl} numberOfLines={2}>
                                {qrData}
                            </Text>
                            <Pressable onPress={copyQrLink} style={styles.copyButton} accessibilityRole="button" accessibilityLabel="Sao chép link QR">
                                <CopyIcon />
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={() => navigation.navigate('LuckyWheel', { spinGrantId: qrData.split('/').pop() || qrData })}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryText}>Mở màn quay</Text>
                        </Pressable>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        padding: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    webContent: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1040,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.lg,
        paddingVertical: spacing.xl,
    },
    card: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        elevation: 1,
    },
    webCard: {
        flex: 1,
    },
    title: {
        textAlign: 'center',
        textTransform: 'uppercase',
        color: colors.textPrimary,
        fontSize: typography.lg,
        fontWeight: '700',
        marginBottom: spacing.lg,
    },
    label: {
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: typography.sm,
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    },
    dropdownWrap: {
        position: 'relative',
        zIndex: 10,
        marginBottom: spacing.md,
    },
    dropdown: {
        minHeight: 48,
        borderRadius: 8,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
    },
    dropdownContainer: {
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    dropdownText: {
        color: colors.textPrimary,
        fontWeight: '800',
        fontSize: typography.sm,
    },
    dropdownPlaceholder: {
        color: colors.textTertiary,
        fontWeight: '800',
    },
    selectClearButton: {
        position: 'absolute',
        right: 38,
        top: 0,
        width: 34,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    selectClearText: {
        color: colors.textSecondary,
        fontSize: 20,
        lineHeight: 22,
        fontWeight: '900',
    },
    billImage: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
    },
    imagePlaceholder: {
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    muted: {
        color: colors.textSecondary,
        fontSize: typography.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    secondaryButton: {
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: spacing.md,
    },
    secondaryText: {
        color: colors.surface,
        fontWeight: '700',
        fontSize: typography.sm,
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        fontSize: typography.base,
        color: colors.textPrimary,
    },
    inputDisabled: {
        backgroundColor: colors.surfaceAlt,
        color: colors.textTertiary,
    },
    primaryButton: {
        minHeight: 50,
        marginTop: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryText: {
        color: colors.surface,
        fontWeight: '700',
        fontSize: typography.base,
    },
    qrCard: {
        flex: 1,
        marginTop: spacing.lg,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.lg,
        elevation: 1,
    },
    webQrCard: {
        marginTop: 0,
        maxWidth: 360,
    },
    qrTitle: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: 10,
    },
    qrUrl: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: typography.xs,
        textAlign: 'left',
    },
    qrLinkRow: {
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    copyButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
