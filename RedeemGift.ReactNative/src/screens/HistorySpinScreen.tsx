import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path, Rect } from 'react-native-svg';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import DropDownPicker from '../components/DropDownPicker';

type ProjectOption = {
    value: string;
    label: string;
};

type HistorySpin = {
    SpinGrantID: number;
    QRCode: string;
    CustomerName: string;
    PhoneNumber: string;
    ProjectCode: string;
    SpinsGranted: number;
    SpinsUsed: number;
    BillValue: number;
    SpinsRemaining: number;
    BillImagePath: string;
    TotalRow?: number;
};

type DropdownValueUpdater<T> = T | ((current: T) => T);

const luckyWheelUrl = ((process.env.EXPO_PUBLIC_LUCKY_WHEEL_URL as string) || 'https://gifts.peoplelinkvietnam.com/luckyWheel').replace(/\/$/, '');

const buildLuckyWheelQrValue = (qrCode: string) => {
    const trimmed = (qrCode || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    const spinGrantId = trimmed.split('/').filter(Boolean).pop() || trimmed;
    return `${luckyWheelUrl}/${spinGrantId}`;
};

const CopyIcon = ({ color = '#2563eb' }: { color?: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24">
        <Rect x="8" y="8" width="11" height="11" rx="2" fill="none" stroke={color} strokeWidth={2} />
        <Path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function HistorySpinScreen() {
    const { auth } = useAuth();
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [projectFilter, setProjectFilter] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<HistorySpin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSpin, setSelectedSpin] = useState<HistorySpin | null>(null);
    const [winnings, setWinnings] = useState<any[]>([]);
    const [isLoadingWinnings, setIsLoadingWinnings] = useState(false);
    const [preview, setPreview] = useState<{ type: 'qr' | 'image'; uri: string } | null>(null);
    const [openProjectDropdown, setOpenProjectDropdown] = useState(false);

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
    const selectedProject = projectFilter;
    const restrictedDefaultProject = useMemo(() => {
        const selectedAuthProject = auth?.SelectedProject || '';
        return allowedProjectCodes.includes(selectedAuthProject) ? selectedAuthProject : allowedProjectCodes[0] || '';
    }, [allowedProjectCodes, auth?.SelectedProject]);
    const projectFilterItems = useMemo(() => {
        const items = visibleProjects.map((project) => ({ label: project.label, value: project.value }));
        return hasProjectRestriction ? items : [{ label: 'Tất cả dự án', value: '' }, ...items];
    }, [hasProjectRestriction, visibleProjects]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const fetchProjects = useCallback(async () => {
        try {
            const response = await new ApiService('/project/getAllProject', 'get').request<any>();
            const data = Array.isArray(response?.Data) ? response.Data : [];
            setProjects(data.map((item: any) => ({ value: item.ProjectCode, label: item.ProjectName || item.ProjectCode })));
            if (hasProjectRestriction) {
                setProjectFilter((current) => current || restrictedDefaultProject);
            }
        } catch {
            setProjects([]);
        }
    }, [hasProjectRestriction, restrictedDefaultProject]);

    const fetchData = useCallback(async () => {
        if (hasProjectRestriction && !selectedProject) {
            setItems([]);
            setTotal(0);
            return;
        }

        try {
            setIsLoading(true);
            const response = await new ApiService('/customerSpin/CustomerSpinGetPagedList', 'get', true).request<any>(
                {},
                {
                    pageSize,
                    offset: (page - 1) * pageSize,
                    ...(search.trim() ? { keySearch: search.trim() } : {}),
                    ...(selectedProject ? { projectCode: selectedProject } : {}),
                }
            );
            const data = Array.isArray(response?.Data) ? response.Data : [];
            setItems(data);
            setTotal(Number(data[0]?.TotalRow || data.length || 0));
        } finally {
            setIsLoading(false);
        }
    }, [hasProjectRestriction, page, pageSize, search, selectedProject]);

    const fetchWinnings = useCallback(async (spin: HistorySpin) => {
        try {
            setIsLoadingWinnings(true);
            const response = await new ApiService('/customerSpin/WinningsGetPagedList', 'get', true).request<any>(
                {},
                { qrCode: spin.QRCode, pageSize: 1000, offset: 0 }
            );
            setWinnings(Array.isArray(response?.Data) ? response.Data : []);
        } finally {
            setIsLoadingWinnings(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (!hasProjectRestriction) return;

        if (!selectedProject && restrictedDefaultProject) {
            setProjectFilter(restrictedDefaultProject);
            setPage(1);
            return;
        }

        if (selectedProject && !allowedProjectCodes.includes(selectedProject)) {
            setProjectFilter(restrictedDefaultProject);
            setPage(1);
        }
    }, [allowedProjectCodes, hasProjectRestriction, restrictedDefaultProject, selectedProject]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openDetail = (spin: HistorySpin) => {
        setSelectedSpin(spin);
        setWinnings([]);
        fetchWinnings(spin);
    };

    const copyQrLink = (value: string) => {
        try {
            Clipboard.setString(value);
            Alert.alert('Đã sao chép', 'Đã sao chép link QR.');
        } catch (error: any) {
            Alert.alert('Không thể sao chép', error?.message || 'Vui lòng thử lại.');
        }
    };

    const qrValue = selectedSpin ? buildLuckyWheelQrValue(selectedSpin.QRCode) : '';

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Lịch sử quay thưởng</Text>
                    <Text style={styles.meta}>{total} bản ghi</Text>
                </View>
                <Pressable onPress={fetchData} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>Tải lại</Text>
                </Pressable>
            </View>

            <TextInput
                autoCapitalize="none"
                onChangeText={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                placeholder="Tìm kiếm..."
                style={styles.searchInput}
                value={search}
            />

            <Text style={styles.filterLabel}>Dự án</Text>
            <View style={styles.dropdownWrap}>
                <DropDownPicker
                    open={openProjectDropdown}
                    value={selectedProject}
                    items={projectFilterItems}
                    setOpen={setOpenProjectDropdown}
                    setValue={(nextValue: DropdownValueUpdater<string | null>) => {
                        const next = typeof nextValue === 'function' ? nextValue(selectedProject) : nextValue;
                        setProjectFilter(String(next || (hasProjectRestriction ? restrictedDefaultProject : '')));
                        setPage(1);
                    }}
                    setItems={() => undefined}
                    onChangeValue={(next: string | null) => {
                        setProjectFilter(String(next || (hasProjectRestriction ? restrictedDefaultProject : '')));
                        setPage(1);
                    }}
                    placeholder={hasProjectRestriction ? 'Chọn dự án' : 'Tất cả dự án'}
                    searchable
                    searchPlaceholder="Tìm kiếm..."
                    listMode="MODAL"
                    modalTitle="Dự án"
                    style={styles.dropdown}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    dropDownContainerStyle={styles.dropdownContainer}
                />
                {selectedProject && !hasProjectRestriction ? (
                    <Pressable
                        onPress={(event) => {
                            event.stopPropagation();
                            setProjectFilter('');
                            setPage(1);
                        }}
                        style={styles.selectClearButton}
                    >
                        <Text style={styles.selectClearText}>×</Text>
                    </Pressable>
                ) : null}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
                style={styles.scroll}
            >
                {isLoading && !items.length ? (
                    <View style={styles.loading}>
                        <ActivityIndicator />
                        <Text style={styles.muted}>Đang tải dữ liệu...</Text>
                    </View>
                ) : null}

                {items.map((item) => (
                    <View key={String(item.SpinGrantID || item.QRCode)} style={styles.card}>
                        <InfoRow label="QR Code" value={item.QRCode} />
                        <InfoRow label="Khách hàng" value={item.CustomerName} />
                        <InfoRow label="Điện thoại" value={item.PhoneNumber} />
                        <InfoRow label="Dự án" value={item.ProjectCode} />
                        <InfoRow label="Tổng lượt" value={String(item.SpinsGranted ?? 0)} />
                        <InfoRow label="Đã quay" value={String(item.SpinsUsed ?? 0)} />
                        <InfoRow label="Tổng bill" value={Number(item.BillValue || 0).toLocaleString('vi-VN')} />
                        <Pressable onPress={() => openDetail(item)} style={styles.detailButton}>
                            <Text style={styles.detailText}>Xem trúng thưởng</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.pagination, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <Pressable disabled={page <= 1 || isLoading} onPress={() => setPage((value) => Math.max(1, value - 1))} style={[styles.pageButton, (page <= 1 || isLoading) && styles.disabledButton]}>
                    <Text style={styles.pageButtonText}>Trước</Text>
                </Pressable>
                <Text style={styles.pageText}>{page}/{totalPages}</Text>
                <Pressable disabled={page >= totalPages || isLoading} onPress={() => setPage((value) => Math.min(totalPages, value + 1))} style={[styles.pageButton, (page >= totalPages || isLoading) && styles.disabledButton]}>
                    <Text style={styles.pageButtonText}>Sau</Text>
                </Pressable>
            </View>

            <Modal animationType="slide" visible={!!selectedSpin} onRequestClose={() => setSelectedSpin(null)}>
                <SafeAreaView style={styles.modalPage}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết trúng thưởng</Text>
                        <Pressable onPress={() => setSelectedSpin(null)} style={styles.closeButton}>
                            <Text style={styles.closeText}>Đóng</Text>
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        {selectedSpin ? (
                            <>
                                <View style={styles.previewRow}>
                                    <Pressable onPress={() => setPreview({ type: 'qr', uri: qrValue || selectedSpin.QRCode })} style={styles.qrBox}>
                                        <QRCode value={qrValue || selectedSpin.QRCode} size={150} />
                                        <View style={styles.qrLinkRow}>
                                            <Text style={styles.qrLink} numberOfLines={2}>{qrValue || selectedSpin.QRCode}</Text>
                                            <Pressable
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    copyQrLink(qrValue || selectedSpin.QRCode);
                                                }}
                                                style={styles.copyButton}
                                                accessibilityRole="button"
                                                accessibilityLabel="Sao chép link QR"
                                            >
                                                <CopyIcon />
                                            </Pressable>
                                        </View>
                                    </Pressable>
                                    {selectedSpin.BillImagePath ? (
                                        <Pressable onPress={() => setPreview({ type: 'image', uri: selectedSpin.BillImagePath })} style={styles.billImageButton}>
                                            <Image source={{ uri: selectedSpin.BillImagePath }} style={styles.billImage} />
                                        </Pressable>
                                    ) : (
                                        <View style={styles.billImagePlaceholder}><Text style={styles.muted}>Không có ảnh bill</Text></View>
                                    )}
                                </View>
                                <Text style={styles.sectionTitle}>Danh sách giải thưởng</Text>
                                {isLoadingWinnings ? <ActivityIndicator /> : null}
                                {winnings.length ? winnings.map((winning) => (
                                    <View key={String(winning.WinningID || `${winning.PrizeName}-${winning.WonAt}`)} style={styles.winningRow}>
                                        <Text style={styles.winningPrize}>{winning.PrizeName}</Text>
                                        <Text style={styles.winningTime}>{winning.WonAt ? new Date(winning.WonAt).toLocaleString('vi-VN') : ''}</Text>
                                    </View>
                                )) : <Text style={styles.muted}>Chưa trúng thưởng</Text>}
                            </>
                        ) : null}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <Modal animationType="fade" transparent visible={!!preview} onRequestClose={() => setPreview(null)}>
                <Pressable onPress={() => setPreview(null)} style={styles.previewBackdrop}>
                    <Pressable onPress={(event) => event.stopPropagation()} style={styles.previewContent}>
                        <Pressable onPress={() => setPreview(null)} style={styles.previewCloseButton}>
                            <Text style={styles.previewCloseText}>Đóng</Text>
                        </Pressable>
                        {preview?.type === 'qr' ? (
                            <View style={styles.previewQrBox}>
                                <QRCode value={preview.uri} size={280} />
                                <View style={styles.previewQrLinkRow}>
                                    <Text style={styles.previewQrLink} numberOfLines={3}>{preview.uri}</Text>
                                    <Pressable
                                        onPress={() => copyQrLink(preview.uri)}
                                        style={styles.copyButton}
                                        accessibilityRole="button"
                                        accessibilityLabel="Sao chép link QR"
                                    >
                                        <CopyIcon />
                                    </Pressable>
                                </View>
                            </View>
                        ) : null}
                        {preview?.type === 'image' ? (
                            <Image source={{ uri: preview.uri }} resizeMode="contain" style={styles.previewImage} />
                        ) : null}
                    </Pressable>
                </Pressable>
            </Modal>

        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || ''}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#eef2f7', padding: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
    title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    meta: { marginTop: 4, color: '#64748b' },
    refreshButton: { minHeight: 40, justifyContent: 'center', borderRadius: 6, backgroundColor: '#2563eb', paddingHorizontal: 14 },
    refreshText: { color: '#fff', fontWeight: '800' },
    searchInput: { minHeight: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#fff', paddingHorizontal: 12, marginBottom: 12 },
    filterLabel: { marginBottom: 6, color: '#475569', fontWeight: '800' },
    dropdownWrap: { position: 'relative', zIndex: 10, marginBottom: 10 },
    dropdown: { minHeight: 44, borderRadius: 6, borderColor: '#cbd5e1', backgroundColor: '#fff', paddingHorizontal: 12 },
    dropdownContainer: { borderColor: '#cbd5e1', borderRadius: 6, backgroundColor: '#fff' },
    dropdownText: { color: '#0f172a', fontWeight: '800', fontSize: 14 },
    dropdownPlaceholder: { color: '#94a3b8', fontWeight: '800' },
    selectClearButton: { position: 'absolute', right: 38, top: 0, width: 34, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
    selectClearText: { color: '#64748b', fontSize: 20, lineHeight: 22, fontWeight: '900' },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 10 },
    loading: { padding: 28, alignItems: 'center', gap: 8 },
    muted: { color: '#64748b' },
    card: { borderRadius: 8, backgroundColor: '#fff', padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
    rowLabel: { flex: 0.9, color: '#64748b', fontWeight: '700' },
    rowValue: { flex: 1.1, color: '#0f172a', textAlign: 'right' },
    detailButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#e2e8f0', marginTop: 10 },
    detailText: { color: '#0f172a', fontWeight: '800' },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 4 },
    pageButton: { minWidth: 88, minHeight: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 6, backgroundColor: '#0f172a' },
    disabledButton: { opacity: 0.45 },
    pageButtonText: { color: '#fff', fontWeight: '800' },
    pageText: { color: '#0f172a', fontWeight: '800' },
    modalPage: { flex: 1, backgroundColor: '#eef2f7' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    modalTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#0f172a' },
    closeButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12 },
    closeText: { color: '#2563eb', fontWeight: '800' },
    modalBody: { padding: 12, paddingBottom: 28 },
    previewRow: { gap: 12 },
    qrBox: { alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#fff', padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    qrLinkRow: {
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    qrLink: { flex: 1, color: '#2563eb', fontSize: 12 },
    copyButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    billImageButton: { width: '100%' },
    billImage: { width: '100%', height: 190, borderRadius: 8, backgroundColor: '#f1f5f9' },
    billImagePlaceholder: { height: 140, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    sectionTitle: { color: '#0f172a', fontWeight: '800', fontSize: 16, marginTop: 16, marginBottom: 10 },
    winningRow: { borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 8 },
    winningPrize: { color: '#0f172a', fontWeight: '800' },
    winningTime: { color: '#64748b', marginTop: 4 },
    previewBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', alignItems: 'center', justifyContent: 'center', padding: 18 },
    previewContent: { width: '100%', maxWidth: 720, maxHeight: '86%', alignItems: 'center', justifyContent: 'center' },
    previewCloseButton: {
        alignSelf: 'flex-end',
        minHeight: 40,
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    previewCloseText: { color: '#0f172a', fontWeight: '800' },
    previewQrBox: { width: '100%', maxWidth: 360, alignItems: 'center', borderRadius: 8, backgroundColor: '#fff', padding: 20 },
    previewQrLinkRow: {
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    previewQrLink: { flex: 1, color: '#475569', fontSize: 12 },
    previewImage: { width: '100%', height: 520, maxHeight: '90%', borderRadius: 8 },
});
