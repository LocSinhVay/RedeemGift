import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { RESOURCE_CONFIGS } from './ResourceListScreen';
import ApiService from '../services/ApiService';
import BrandMark from '../components/BrandMark';
import { colors, spacing, typography } from '../themes';
import DropDownPicker from '../components/DropDownPicker';

const SPECIAL_ROUTES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/qr': 'QR',
    '/luckyWheel': 'LuckyWheel',
    '/historySpin': 'HistorySpin',
};

const MENU_LABELS: Record<string, string> = {
    '/qr': 'Tạo mã QR',
};

type ProjectOption = {
    label: string;
    value: string;
};

type DropdownValueUpdater<T> = T | ((current: T) => T);

const DashboardIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="4" y="14" width="4" height="9" rx="2" fill="#2563eb" />
        <Rect x="12" y="7" width="4" height="16" rx="2" fill="#14b8a6" />
        <Rect x="20" y="11" width="4" height="12" rx="2" fill="#f59e0b" />
    </Svg>
);

const QrIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="4" y="4" width="20" height="20" rx="4" fill="#eff6ff" />
        <Path d="M6 6h6v6H6V6Zm10 0h6v6h-6V6ZM6 16h6v6H6v-6Zm11 0h2v2h-2v-2Zm4 0h1v4h-4v-2h3v-2Zm-4 5h2v1h-2v-1Z" fill="#2563eb" />
        <Path d="M7 7h3v3H7V7Zm11 0h3v3h-3V7ZM7 18h3v3H7v-3Z" fill="#ffffff" />
    </Svg>
);

const WheelIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Circle cx="14" cy="14" r="10" fill="#f59e0b" />
        <Path d="M14 4v20M4 14h20M7 7l14 14M21 7 7 21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="14" cy="14" r="4" fill="#2563eb" />
    </Svg>
);

const HistoryIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="5" y="4" width="18" height="20" rx="4" fill="#14b8a6" />
        <Path d="M10 9h8M10 14h8M10 19h5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="20" cy="20" r="4" fill="#f59e0b" />
        <Path d="M20 18v2l1.4 1" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ProjectIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="4" y="7" width="20" height="15" rx="3" fill="#dbeafe" />
        <Path d="M8 7l2-3h5l2 3M9 12h10M9 17h7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const GiftIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="5" y="11" width="18" height="12" rx="3" fill="#dcfce7" />
        <Path d="M4 10h20M14 10v13M10 10c-3-2.6-1.4-5.5 1.1-5 1.7.3 2.6 2.1 2.9 5M18 10c3-2.6 1.4-5.5-1.1-5-1.7.3-2.6 2.1-2.9 5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const PrizeIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Path d="M9 5h10v5a5 5 0 0 1-10 0V5Z" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
        <Path d="M9 8H5c.2 4 2.5 6 5 6M19 8h4c-.2 4-2.5 6-5 6M14 15v5M10 23h8" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const SpinConfigIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Circle cx="14" cy="14" r="9" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
        <Path d="M14 5v9l6 6M6.5 10h15M8 20l12-12" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="14" cy="14" r="3" fill="#ea580c" />
    </Svg>
);

const UserIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Circle cx="11" cy="10" r="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
        <Path d="M4 23c1-5 13-5 14 0" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="20" cy="11" r="3" fill="#f5f3ff" stroke="#a855f7" strokeWidth="1.8" />
        <Path d="M18 19c1.5-.8 4-.8 5 1.2" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
);

const RoleIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Path d="M14 4l8 3v6c0 5-3.2 8.5-8 11-4.8-2.5-8-6-8-11V7l8-3Z" fill="#ecfeff" stroke="#0891b2" strokeWidth="2" strokeLinejoin="round" />
        <Path d="M10 14l2.5 2.5L18.5 10" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const MenuManageIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="5" y="5" width="18" height="18" rx="4" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
        <Path d="M10 10h8M10 14h8M10 18h5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const EmailIcon = () => (
    <Svg width={28} height={28} viewBox="0 0 28 28">
        <Rect x="4" y="7" width="20" height="15" rx="3" fill="#fdf2f8" stroke="#db2777" strokeWidth="2" />
        <Path d="M6 10l8 6 8-6" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const EyeIcon = ({ hidden }: { hidden: boolean }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
            fill="none"
            stroke={colors.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="3" fill="none" stroke={colors.textSecondary} strokeWidth={2} />
        {hidden ? <Path d="M4 4l16 16" stroke={colors.error} strokeWidth={2} strokeLinecap="round" /> : null}
    </Svg>
);

const MenuIcon = ({ name, path }: { name: string; path?: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
        Dashboard: <DashboardIcon />,
        'Tạo mã QR': <QrIcon />,
        'Vòng quay': <WheelIcon />,
        'Lịch sử quay': <HistoryIcon />,
        QR: <QrIcon />,
        LuckyWheel: <WheelIcon />,
        HistorySpin: <HistoryIcon />,
        default: <BrandMark size={28} />,
    };
    const pathIconMap: Record<string, React.ReactNode> = {
        '/dashboard': <DashboardIcon />,
        '/project': <ProjectIcon />,
        '/gift': <GiftIcon />,
        '/prizes': <PrizeIcon />,
        '/redeemSpin': <SpinConfigIcon />,
        '/historySpin': <HistoryIcon />,
        '/userSystem': <UserIcon />,
        '/role': <RoleIcon />,
        '/menu': <MenuManageIcon />,
        '/emailConfig': <EmailIcon />,
        '/qr': <QrIcon />,
        '/luckyWheel': <WheelIcon />,
    };
    return <View style={styles.icon}>{(path && pathIconMap[path]) || iconMap[name] || iconMap.default}</View>;
};

export default function HomeScreen() {
    const { auth, logout, updateSelectedProject } = useAuth();
    const navigation = useNavigation<any>();
    const { width } = useWindowDimensions();
    const [showChangePassword, setShowChangePassword] = React.useState(false);
    const [showAccountMenu, setShowAccountMenu] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [projects, setProjects] = React.useState<ProjectOption[]>([]);
    const [openProjectDropdown, setOpenProjectDropdown] = React.useState(false);

    const isWebWide = Platform.OS === 'web' && width >= 900;
    const menuItemHeight = width < 380 ? 82 : 92;
    const initials = (auth?.FullName || auth?.Username || 'U')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item.charAt(0).toUpperCase())
        .join('');
    const projectCodes = useMemo(() => {
        if (!auth?.ProjectCodes) return [];
        return Array.isArray(auth.ProjectCodes)
            ? auth.ProjectCodes
            : String(auth.ProjectCodes).split(',').map((item) => item.trim()).filter(Boolean);
    }, [auth?.ProjectCodes]);
    const hasProjectRestriction = projectCodes.length > 0;
    const isCompactHeader = hasProjectRestriction && !isWebWide;
    const brandSize = isCompactHeader ? 34 : 42;
    const avatarSize = isCompactHeader ? 42 : 44;
    const titleFontSize = isCompactHeader ? typography.lg : typography.xl;
    const projectDropdownWidth = isCompactHeader ? Math.max(116, Math.min(132, width * 0.34)) : 150;
    const projectItems = useMemo(
        () => projects.filter((project) => projectCodes.includes(project.value)),
        [projectCodes, projects]
    );

    const fetchProjects = useCallback(async () => {
        if (!hasProjectRestriction) return;
        try {
            const response = await new ApiService('/project/getAllProject', 'get').request<any>();
            const data = Array.isArray(response?.Data) ? response.Data : [];
            setProjects(data.map((item: any) => ({ value: item.ProjectCode, label: item.ProjectName || item.ProjectCode })));
        } catch {
            setProjects([]);
        }
    }, [hasProjectRestriction]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (!hasProjectRestriction) return;
        if (!auth?.SelectedProject && projectCodes[0]) updateSelectedProject(projectCodes[0]);
    }, [auth?.SelectedProject, hasProjectRestriction, projectCodes, updateSelectedProject]);

    const menus = useMemo(() => {
        const flatMenus = auth?.Menu?.flatMap((item) => [item, ...(item.Children || [])]) || [];
        const filtered = flatMenus.filter((item) => item.MenuPath && (RESOURCE_CONFIGS[item.MenuPath] || SPECIAL_ROUTES[item.MenuPath]));
        return filtered.length ? filtered : [{ MenuID: 0, MenuName: 'Dashboard', MenuPath: '/dashboard' }];
    }, [auth?.Menu]);

    const openMenu = (menu: any) => {
        const screen = SPECIAL_ROUTES[menu.MenuPath];
        if (screen) {
            navigation.navigate(screen);
            return;
        }
        navigation.navigate('ResourceList', {
            path: menu.MenuPath,
            title: MENU_LABELS[menu.MenuPath] || menu.MenuName,
        });
    };

    const closePasswordDialog = () => {
        setShowChangePassword(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleChangePassword = async () => {
        if (!password || !newPassword || !confirmPassword) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận không khớp.');
            return;
        }

        try {
            setIsChangingPassword(true);
            const response = await new ApiService('/systemUser/UpdatePassword', 'post').request<any>({
                Password: password,
                NewPassword: newPassword,
                ConfirmNewPassword: confirmPassword,
                IsReset: false,
            });

            if (response?.Status && response.Status !== 'Success') {
                Alert.alert('Không thể đổi mật khẩu', response.Message || 'Vui lòng thử lại.');
                return;
            }

            Alert.alert('Thành công', response?.Message || 'Đã đổi mật khẩu.');
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            closePasswordDialog();
        } catch (error: any) {
            Alert.alert('Không thể đổi mật khẩu', error?.message || 'Không thể kết nối máy chủ.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={[styles.header, isWebWide && styles.webHeader]}>
                <View style={styles.userBlock}>
                    <View style={styles.brandRow}>
                        <BrandMark size={brandSize} />
                        <View style={styles.brandText}>
                            <Text style={[styles.title, { fontSize: titleFontSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>RedeemGift</Text>
                            <Text style={styles.subtitle} numberOfLines={1}>{auth?.FullName || auth?.Username || 'Người dùng'}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    {hasProjectRestriction ? (
                        <View style={[styles.headerProjectWrap, { width: projectDropdownWidth }]}>
                            <DropDownPicker<string>
                                open={openProjectDropdown}
                                value={auth?.SelectedProject || projectCodes[0] || ''}
                                items={projectItems}
                                setOpen={setOpenProjectDropdown}
                                setValue={(nextValue: DropdownValueUpdater<string | null>) => {
                                    const current = auth?.SelectedProject || projectCodes[0] || '';
                                    const next = typeof nextValue === 'function' ? nextValue(current) : nextValue;
                                    updateSelectedProject(String(next || projectCodes[0] || ''));
                                }}
                                setItems={() => undefined}
                                onChangeValue={(next: string | null) => updateSelectedProject(String(next || projectCodes[0] || ''))}
                                placeholder="Dự án"
                                searchable
                                searchPlaceholder="Tìm kiếm..."
                                listMode="MODAL"
                                modalTitle="Dự án"
                                style={styles.headerProjectDropdown}
                                textStyle={styles.headerProjectText}
                                placeholderStyle={styles.headerProjectPlaceholder}
                                dropDownContainerStyle={styles.headerProjectPanel}
                            />
                        </View>
                    ) : null}
                    <Pressable onPress={() => setShowAccountMenu(true)} style={[styles.avatarButton, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
                        <Text style={styles.avatarText}>{initials || 'U'}</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={[styles.menuList, isWebWide && styles.webMenuList]}>
                {menus.map((menu) => {
                    const menuLabel = MENU_LABELS[menu.MenuPath] || menu.MenuName;

                    return (
                        <Pressable
                            key={`${menu.MenuID}-${menu.MenuPath}`}
                            onPress={() => openMenu(menu)}
                            style={({ pressed }) => [
                                styles.menuItem,
                                isWebWide ? styles.webMenuItem : null,
                                { minHeight: menuItemHeight },
                                pressed ? styles.menuItemPressed : null,
                            ]}
                        >
                            <View style={styles.menuContent}>
                                <MenuIcon name={menuLabel} path={menu.MenuPath} />
                                <View style={styles.menuTextBlock}>
                                    <Text style={styles.menuTitle} numberOfLines={2}>{menuLabel}</Text>
                                </View>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <Modal animationType="fade" transparent visible={showAccountMenu} onRequestClose={() => setShowAccountMenu(false)}>
                <Pressable onPress={() => setShowAccountMenu(false)} style={styles.accountMenuBackdrop}>
                    <Pressable onPress={(event) => event.stopPropagation()} style={styles.accountMenu}>
                        <View style={styles.accountMenuHeader}>
                            <View style={styles.avatarButtonSmall}>
                                <Text style={styles.avatarTextSmall}>{initials || 'U'}</Text>
                            </View>
                            <View style={styles.accountMenuText}>
                                <Text style={styles.accountMenuName} numberOfLines={1}>{auth?.FullName || auth?.Username || 'Người dùng'}</Text>
                                <Text style={styles.accountMenuEmail} numberOfLines={1}>{auth?.Email || auth?.RoleName || '-'}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => {
                                setShowAccountMenu(false);
                                setShowChangePassword(true);
                            }}
                            style={styles.accountMenuItem}
                        >
                            <Text style={styles.accountMenuItemText}>Đổi mật khẩu</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowAccountMenu(false);
                                logout();
                            }}
                            style={styles.accountMenuItem}
                        >
                            <Text style={[styles.accountMenuItemText, styles.accountMenuDanger]}>Đăng xuất</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal animationType="fade" transparent visible={showChangePassword} onRequestClose={closePasswordDialog}>
                <Pressable onPress={closePasswordDialog} style={styles.passwordBackdrop}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.passwordKeyboard}>
                        <Pressable onPress={(event) => event.stopPropagation()} style={styles.passwordDialog}>
                            <View style={styles.passwordHeader}>
                                <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                                <Pressable onPress={closePasswordDialog} style={styles.modalClose}>
                                    <Text style={styles.modalCloseText}>Đóng</Text>
                                </Pressable>
                            </View>
                            <ScrollView contentContainerStyle={styles.passwordBody} keyboardShouldPersistTaps="handled">
                                <PasswordField
                                    label="Mật khẩu hiện tại"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    value={password}
                                    visible={showCurrentPassword}
                                    onChangeText={setPassword}
                                    onToggleVisible={() => setShowCurrentPassword((value) => !value)}
                                />
                                <PasswordField
                                    label="Mật khẩu mới"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    visible={showNewPassword}
                                    onChangeText={setNewPassword}
                                    onToggleVisible={() => setShowNewPassword((value) => !value)}
                                />
                                <PasswordField
                                    label="Xác nhận mật khẩu mới"
                                    placeholder="Xác nhận mật khẩu mới"
                                    value={confirmPassword}
                                    visible={showConfirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onToggleVisible={() => setShowConfirmPassword((value) => !value)}
                                />
                            </ScrollView>
                            <View style={styles.passwordFooter}>
                                <Pressable
                                    disabled={isChangingPassword}
                                    onPress={handleChangePassword}
                                    style={[styles.saveButton, isChangingPassword && styles.disabledButton]}
                                >
                                    {isChangingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu</Text>}
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

function PasswordField({
    label,
    placeholder,
    value,
    visible,
    onChangeText,
    onToggleVisible,
}: {
    label: string;
    placeholder: string;
    value: string;
    visible: boolean;
    onChangeText: (value: string) => void;
    onToggleVisible: () => void;
}) {
    return (
        <View style={styles.passwordGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.passwordInputWrap}>
                <TextInput
                    secureTextEntry={!visible}
                    value={value}
                    onChangeText={onChangeText}
                    style={styles.passwordInput}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textTertiary}
                />
                <Pressable onPress={onToggleVisible} style={styles.eyeButton}>
                    <EyeIcon hidden={!visible} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 2,
    },
    webHeader: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1120,
        borderRadius: 8,
        marginTop: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    userBlock: {
        flex: 1,
        minWidth: 0,
        paddingRight: spacing.sm,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    brandText: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: '800',
        color: colors.textPrimary,
        flexShrink: 1,
    },
    subtitle: {
        marginTop: spacing.xs,
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        flexShrink: 0,
    },
    headerProjectWrap: {
        width: 132,
        maxWidth: 170,
        zIndex: 20,
    },
    headerProjectDropdown: {
        minHeight: 42,
        borderRadius: 8,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.sm,
    },
    headerProjectText: {
        color: colors.textPrimary,
        fontSize: typography.xs,
        fontWeight: '800',
    },
    headerProjectPlaceholder: {
        color: colors.textTertiary,
    },
    headerProjectPanel: {
        borderColor: colors.border,
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: '#dbeafe',
    },
    avatarText: {
        color: colors.surface,
        fontWeight: '900',
        fontSize: typography.sm,
    },
    menuList: {
        padding: spacing.md,
        paddingBottom: spacing.xxxl,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    webMenuList: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1120,
        gap: spacing.md,
        paddingTop: spacing.lg,
    },
    menuItem: {
        width: '48.5%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
        elevation: 1,
    },
    webMenuItem: {
        width: '23.8%',
        marginBottom: 0,
    },
    menuItemPressed: {
        opacity: 0.85,
        backgroundColor: colors.surfaceAlt,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextBlock: {
        flex: 1,
        minWidth: 0,
    },
    menuTitle: {
        fontSize: typography.sm,
        lineHeight: 18,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    chevron: {
        marginLeft: spacing.xs,
        fontSize: typography.lg,
        color: colors.textTertiary,
        fontWeight: '700',
    },
    accountMenuBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.18)',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'web' ? 84 : 68,
        paddingHorizontal: spacing.md,
    },
    accountMenu: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm,
        elevation: 5,
    },
    accountMenuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    avatarButtonSmall: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    avatarTextSmall: {
        color: colors.surface,
        fontWeight: '900',
        fontSize: typography.xs,
    },
    accountMenuText: {
        flex: 1,
        minWidth: 0,
    },
    accountMenuName: {
        color: colors.textPrimary,
        fontWeight: '800',
    },
    accountMenuEmail: {
        marginTop: 2,
        color: colors.textSecondary,
        fontSize: typography.xs,
    },
    accountMenuItem: {
        minHeight: 44,
        justifyContent: 'center',
        borderRadius: 6,
        paddingHorizontal: spacing.md,
        marginTop: spacing.xs,
    },
    accountMenuItemText: {
        color: colors.textPrimary,
        fontWeight: '800',
    },
    accountMenuDanger: {
        color: colors.error,
    },
    passwordBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.36)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
    },
    passwordKeyboard: {
        width: '100%',
        maxWidth: 440,
    },
    passwordDialog: {
        width: '100%',
        maxHeight: '100%',
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        elevation: 8,
    },
    passwordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    passwordBody: {
        padding: spacing.md,
    },
    passwordFooter: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    passwordGroup: {
        marginBottom: spacing.md,
    },
    modalTitle: {
        flex: 1,
        fontSize: typography.lg,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    modalClose: {
        minHeight: 40,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    modalCloseText: {
        fontSize: typography.sm,
        color: colors.primary,
        fontWeight: '700',
    },
    label: {
        marginBottom: spacing.sm,
        fontSize: typography.sm,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    passwordInputWrap: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    passwordInput: {
        flex: 1,
        minHeight: 48,
        paddingHorizontal: spacing.md,
        fontSize: typography.base,
        color: colors.textPrimary,
    },
    eyeButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveText: {
        fontSize: typography.base,
        color: colors.surface,
        fontWeight: '700',
    },
});
