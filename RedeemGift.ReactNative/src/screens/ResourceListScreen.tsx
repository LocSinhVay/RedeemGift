import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import DropDownPicker from '../components/DropDownPicker';

type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'project' | 'projects' | 'gift' | 'role' | 'emailType' | 'menu' | 'image';

type FieldConfig = {
    key: string;
    label: string;
    type?: FieldType;
    required?: boolean;
    hiddenOnCreate?: boolean;
    disabledOnEdit?: boolean;
    readOnly?: boolean;
    defaultValue?: any;
};

type ActionConfig = {
    insert?: string;
    update?: string;
    delete?: { endpoint: string; key: string };
    toggleStatus?: {
        endpoint: string;
        idKey: string;
        payload: (row: any) => Record<string, any>;
    };
};

type ResourceConfig = {
    title: string;
    endpoint: string;
    searchParam?: string;
    projectParam?: string;
    statusParam?: string;
    columns: { key: string; title: string; format?: (value: any, row: any) => string }[];
    idKey?: string;
    formFields?: FieldConfig[];
    actions?: ActionConfig;
    multipart?: boolean;
};

type Option = {
    value: string;
    label: string;
    meta?: any;
};

type DropdownOpenUpdater = boolean | ((current: boolean) => boolean);
type DropdownSingleSetter<T> = T | null | ((current: T | null) => T | null);
type DropdownMultiSetter<T> = T[] | ((current: T[]) => T[]);

type MenuNode = any & {
    Children: MenuNode[];
};

const today = () => new Date().toISOString().slice(0, 10);

const numberDigits = (value: any) => String(value ?? '').replace(/[^0-9]/g, '');
const toNumber = (value: any) => Number(numberDigits(value)) || 0;
const formatNumber = (value: any) => toNumber(value).toLocaleString('en-US');

const normalizeApiDate = (value: any) => {
    if (!value) return '';
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const yyyy = value.getFullYear();
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        const [, dd, mm, yyyy] = match;
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? text : date.toISOString().slice(0, 10);
};

const toDisplayDate = (value: any) => {
    if (!value) return '';
    const normalized = normalizeApiDate(value);
    const date = new Date(`${normalized}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const boolText = (value: any) => (value ? 'Đang hoạt động' : 'Tạm dừng');

export const RESOURCE_CONFIGS: Record<string, ResourceConfig> = {
    '/dashboard': {
        title: 'Dashboard',
        endpoint: '/project/ProjectGetPagedList',
        statusParam: 'status',
        columns: [
            { key: 'ProjectCode', title: 'Mã dự án' },
            { key: 'ProjectName', title: 'Tên dự án' },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/project': {
        title: 'Quản lý Dự án',
        endpoint: '/project/ProjectGetPagedList',
        statusParam: 'status',
        idKey: 'ProjectID',
        multipart: true,
        formFields: [
            { key: 'ProjectCode', label: 'Mã dự án', required: true, disabledOnEdit: true },
            { key: 'ProjectName', label: 'Tên dự án', required: true },
        ],
        actions: {
            insert: '/project/InsertProject',
            update: '/project/UpdateProject',
            toggleStatus: {
                endpoint: '/project/UpdateProjectStatus',
                idKey: 'ProjectID',
                payload: (row) => ({ ProjectID: row.ProjectID, IsActive: !row.IsActive }),
            },
        },
        columns: [
            { key: 'ProjectID', title: 'ID' },
            { key: 'ProjectCode', title: 'Mã dự án' },
            { key: 'ProjectName', title: 'Tên dự án' },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/gift': {
        title: 'Quản lý Quà tặng',
        endpoint: '/gift/GiftGetPagedList',
        projectParam: 'projectCode',
        statusParam: 'status',
        idKey: 'GiftID',
        multipart: true,
        formFields: [
            { key: 'GiftName', label: 'Tên quà tặng', required: true },
            { key: 'ProjectCode', label: 'Dự án', type: 'project', required: true },
            { key: 'Quantity', label: 'Số lượng', type: 'number', defaultValue: 0 },
            { key: 'IsUnlimited', label: 'Không giới hạn', type: 'boolean', defaultValue: false },
        ],
        actions: {
            insert: '/gift/InsertGift',
            update: '/gift/UpdateGift',
            toggleStatus: {
                endpoint: '/gift/UpdateGiftStatus',
                idKey: 'GiftID',
                payload: (row) => ({ id: row.GiftID, status: !row.IsActive ? 1 : 0 }),
            },
        },
        columns: [
            { key: 'GiftName', title: 'Tên quà tặng' },
            { key: 'ProjectCode', title: 'Dự án' },
            { key: 'Quantity', title: 'Số lượng', format: (value, row) => (row.IsUnlimited ? 'Không giới hạn' : formatNumber(value)) },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/prizes': {
        title: 'Quản lý Giải thưởng',
        endpoint: '/prize/PrizeGetPagedList',
        projectParam: 'projectCode',
        statusParam: 'status',
        idKey: 'PrizeID',
        multipart: true,
        formFields: [
            { key: 'ProjectCode', label: 'Dự án', type: 'project', required: true },
            { key: 'GiftID', label: 'Giải thưởng', type: 'gift', required: true },
            { key: 'Quantity', label: 'Số lượng tồn kho', type: 'number', defaultValue: 0, readOnly: true },
            { key: 'Weight', label: 'Trọng số (%)', type: 'number', required: true, defaultValue: 0 },
        ],
        actions: {
            insert: '/prize/InsertPrize',
            update: '/prize/UpdatePrize',
            delete: { endpoint: '/prize/DeletePrize', key: 'PrizeID' },
        },
        columns: [
            { key: 'PrizeName', title: 'Giải thưởng' },
            { key: 'ProjectCode', title: 'Dự án' },
            { key: 'Quantity', title: 'Tồn kho', format: (value, row) => (row.IsUnlimited ? 'Không giới hạn' : formatNumber(value)) },
            { key: 'Weight', title: 'Trọng số (%)' },
            { key: 'RemainingWeight', title: 'Còn lại (%)' },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/redeemSpin': {
        title: 'Cấu hình vòng quay',
        endpoint: '/redeemSpin/RedeemSpinGetPagedList',
        projectParam: 'projectCode',
        statusParam: 'status',
        idKey: 'RuleID',
        multipart: true,
        formFields: [
            { key: 'ProjectCode', label: 'Dự án', type: 'project', required: true },
            { key: 'StartDate', label: 'Từ ngày', type: 'date', defaultValue: today },
            { key: 'EndDate', label: 'Đến ngày', type: 'date', defaultValue: today },
            { key: 'BillValuePerSpin', label: 'Giá trị hóa đơn', type: 'number', required: true, defaultValue: 0 },
            { key: 'MaxSpinsPerBill', label: 'Số lượt tối đa', type: 'number', required: true, defaultValue: 1 },
        ],
        actions: {
            insert: '/redeemSpin/InsertRedeemSpin',
            update: '/redeemSpin/UpdateRedeemSpin',
            delete: { endpoint: '/redeemSpin/DeleteRedeemSpin', key: 'RuleID' },
        },
        columns: [
            { key: 'ProjectCode', title: 'Dự án' },
            { key: 'StartDate', title: 'Từ ngày', format: toDisplayDate },
            { key: 'EndDate', title: 'Đến ngày', format: toDisplayDate },
            { key: 'BillValuePerSpin', title: 'Giá trị', format: formatNumber },
            { key: 'MaxSpinsPerBill', title: 'Lượt tối đa', format: formatNumber },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/historySpin': {
        title: 'Lịch sử quay',
        endpoint: '/customerSpin/CustomerSpinGetPagedList',
        projectParam: 'projectCode',
        columns: [
            { key: 'CustomerName', title: 'Khách hàng' },
            { key: 'Phone', title: 'Điện thoại' },
            { key: 'PrizeName', title: 'Giải thưởng' },
            { key: 'CreatedDate', title: 'Ngày tạo', format: toDisplayDate },
        ],
    },
    '/userSystem': {
        title: 'Quản lý Người dùng',
        endpoint: '/systemUser/UserSystemGetPagedList',
        projectParam: 'projectCode',
        statusParam: 'status',
        idKey: 'UserID',
        multipart: true,
        formFields: [
            { key: 'AvatarImage', label: 'Ảnh đại diện', type: 'image' },
            { key: 'RoleID', label: 'Vai trò', type: 'role', required: true },
            { key: 'ProjectCodes', label: 'Dự án', type: 'projects' },
            { key: 'Username', label: 'Username', required: true, disabledOnEdit: true },
            { key: 'FullName', label: 'Họ tên', required: true },
            { key: 'Email', label: 'Email' },
            { key: 'Phone', label: 'Điện thoại' },
            { key: 'Status', label: 'Kích hoạt', type: 'boolean', defaultValue: true },
        ],
        actions: {
            insert: '/systemUser/Insert',
            update: '/systemUser/Update',
            delete: { endpoint: '/systemUser/Delete', key: 'UserID' },
        },
        columns: [
            { key: 'Username', title: 'Username' },
            { key: 'FullName', title: 'Họ tên' },
            { key: 'RoleName', title: 'Quyền' },
            { key: 'StatusName', title: 'Tình trạng' },
        ],
    },
    '/role': {
        title: 'Quản lý Quyền',
        endpoint: '/role/RoleGetPagedList',
        statusParam: 'status',
        idKey: 'RoleID',
        formFields: [
            { key: 'RoleName', label: 'Tên quyền', required: true },
            { key: 'Symbol', label: 'Ký hiệu', required: true },
            { key: 'Status', label: 'Kích hoạt', type: 'boolean', defaultValue: true },
        ],
        actions: {
            insert: '/role/Insert',
            update: '/role/Update',
            delete: { endpoint: '/role/Delete', key: 'RoleID' },
        },
        columns: [
            { key: 'RoleID', title: 'ID' },
            { key: 'RoleName', title: 'Tên quyền' },
            { key: 'Symbol', title: 'Ký hiệu' },
            { key: 'Status', title: 'Tình trạng', format: (value) => (Number(value) === 1 ? 'Đang hoạt động' : 'Tạm dừng') },
        ],
    },
    '/menu': {
        title: 'Quản lý Menu',
        endpoint: '/menu/MenuGetPagedList',
        statusParam: 'status',
        idKey: 'MenuID',
        multipart: true,
        formFields: [
            { key: 'MenuName', label: 'Tên menu', required: true },
            { key: 'MenuPath', label: 'Đường dẫn' },
            { key: 'ParentId', label: 'Thuộc menu', type: 'menu' },
            { key: 'Icon', label: 'Icon' },
            { key: 'DisplayOrder', label: 'Thứ tự', type: 'number', defaultValue: 1 },
            { key: 'Status', label: 'Kích hoạt', type: 'boolean', defaultValue: true },
        ],
        actions: {
            insert: '/menu/Insert',
            update: '/menu/Update',
            delete: { endpoint: '/menu/Delete', key: 'MenuID' },
        },
        columns: [
            { key: 'MenuName', title: 'Tên menu' },
            { key: 'MenuPath', title: 'Đường dẫn' },
            { key: 'DisplayOrder', title: 'Thứ tự' },
            { key: 'Status', title: 'Tình trạng', format: boolText },
        ],
    },
    '/emailConfig': {
        title: 'Cấu hình Email',
        endpoint: '/emailConfig/EmailConfigGetPagedList',
        searchParam: 'search',
        idKey: 'Id',
        multipart: true,
        formFields: [
            { key: 'Type', label: 'Loại Email', type: 'emailType', defaultValue: 'SMTP', required: true },
            { key: 'SmtpServer', label: 'SMTP Server' },
            { key: 'SmtpPort', label: 'SMTP Port', type: 'number', defaultValue: 587 },
            { key: 'SenderEmail', label: 'Email người gửi', required: true },
            { key: 'SenderPassword', label: 'Mật khẩu' },
            { key: 'ClientId', label: 'Client ID' },
            { key: 'ClientSecret', label: 'Client Secret' },
            { key: 'RedirectUri', label: 'Redirect URI' },
        ],
        actions: {
            insert: '/emailConfig/Insert',
            update: '/emailConfig/Update',
            delete: { endpoint: '/emailConfig/Delete', key: 'Id' },
        },
        columns: [
            { key: 'SenderEmail', title: 'Email' },
            { key: 'SmtpServer', title: 'SMTP' },
            { key: 'Type', title: 'Loại email' },
            { key: 'IsActive', title: 'Tình trạng', format: boolText },
        ],
    },
    '/qr': {
        title: 'Quản lý QR',
        endpoint: '/qr/QRGetPagedList',
        projectParam: 'projectCode',
        statusParam: 'status',
        columns: [
            { key: 'ProjectCode', title: 'Dự án' },
            { key: 'QRName', title: 'Tên QR' },
            { key: 'CreatedDate', title: 'Ngày tạo', format: toDisplayDate },
        ],
    },
};

type Props = {
    route: {
        params?: {
            path?: string;
            title?: string;
        };
    };
};

function createFormData(config: ResourceConfig, values: Record<string, any>, editingItem: any) {
    const fd = new FormData();
    if (editingItem && config.idKey) {
        fd.append(config.idKey, String(editingItem[config.idKey]));
    }

    config.formFields?.forEach((field) => {
        if (field.hiddenOnCreate && !editingItem) return;
        let value = values[field.key];
        if (field.type === 'image') {
            if (value?.uri) {
                fd.append('File', {
                    uri: value.uri,
                    name: value.fileName || value.name || `avatar-${Date.now()}.jpg`,
                    type: value.mimeType || value.type || 'image/jpeg',
                } as any);
            }
            return;
        }
        if (field.key === 'Quantity' && values.IsUnlimited) value = 0;
        if (field.key === 'Status') value = value ? 1 : 0;
        if (field.key === 'ProjectCodes' && Array.isArray(value)) value = value.join(',');
        if (field.type === 'number') value = numberDigits(value);
        if (field.type === 'date') value = normalizeApiDate(value);
        if (field.type === 'menu' && !value) return;
        fd.append(field.key, value === undefined || value === null ? '' : String(value));
    });

    return fd;
}

function createJsonPayload(config: ResourceConfig, values: Record<string, any>, editingItem: any) {
    const payload: Record<string, any> = {};
    if (editingItem && config.idKey) payload[config.idKey] = editingItem[config.idKey];

    config.formFields?.forEach((field) => {
        let value = values[field.key];
        if (field.key === 'Status') value = value ? 1 : 0;
        if (field.key === 'ProjectCodes' && Array.isArray(value)) value = value.join(',');
        if (field.type === 'number') value = numberDigits(value);
        if (field.type === 'date') value = normalizeApiDate(value);
        payload[field.key] = value;
    });

    if (config.idKey === 'RoleID') {
        payload.listRoleMenu = [];
    }

    return payload;
}

export default function ResourceListScreen({ route }: Props) {
    const { auth } = useAuth();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWebWide = Platform.OS === 'web' && width >= 900;
    const path = route.params?.path || '/dashboard';
    const config = RESOURCE_CONFIGS[path] || {
        title: route.params?.title || 'Chức năng',
        endpoint: '',
        columns: [],
    };

    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [emailTypeFilter, setEmailTypeFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [projects, setProjects] = useState<Option[]>([]);
    const [giftOptions, setGiftOptions] = useState<Option[]>([]);
    const [menuOptions, setMenuOptions] = useState<any[]>([]);
    const [roleOptions, setRoleOptions] = useState<any[]>([]);
    const [selectedMenus, setSelectedMenus] = useState<number[]>([]);
    const [expandedMenus, setExpandedMenus] = useState<number[]>([]);
    const [emailConfigOptions, setEmailConfigOptions] = useState<Option[]>([]);
    const [activeEmailConfig, setActiveEmailConfig] = useState<Option | null>(null);
    const [openEmailCombo, setOpenEmailCombo] = useState<null | 'default' | 'project' | 'type' | 'status'>(null);
    const [openProjectFilter, setOpenProjectFilter] = useState(false);
    const [openRoleFilter, setOpenRoleFilter] = useState(false);
    const [openFormDropdown, setOpenFormDropdown] = useState<null | string>(null);
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [datePickerField, setDatePickerField] = useState<string | null>(null);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());

    const allowedProjectCodes = useMemo(() => {
        if (!auth?.ProjectCodes) return [];
        return auth.ProjectCodes.split(',').map((item) => item.trim()).filter(Boolean);
    }, [auth?.ProjectCodes]);
    const hasProjectRestriction = allowedProjectCodes.length > 0;
    const isAllProject = !hasProjectRestriction;
    const selectedProject = projectFilter || (hasProjectRestriction ? auth?.SelectedProject || allowedProjectCodes[0] || '' : '');
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const canWrite = !!config.formFields?.length && !!config.actions?.insert;

    const visibleProjects = useMemo(() => {
        if (isAllProject) return projects;
        return projects.filter((project) => allowedProjectCodes.includes(project.value));
    }, [allowedProjectCodes, isAllProject, projects]);

    const projectFilterItems = useMemo(
        () => [
            { label: 'Tất cả dự án', value: '' },
            ...visibleProjects.map((project) => ({ label: project.label, value: project.value })),
        ],
        [visibleProjects]
    );

    const projectItems = useMemo(
        () => visibleProjects.map((project) => ({ label: project.label, value: project.value })),
        [visibleProjects]
    );

    const roleItems = useMemo(
        () => roleOptions.map((role) => ({ label: role.RoleName, value: Number(role.RoleID) })),
        [roleOptions]
    );

    const roleFilterItems = useMemo(
        () => [
            { label: 'Tất cả quyền', value: '' },
            ...roleOptions.map((role) => ({ label: role.RoleName, value: String(role.RoleID) })),
        ],
        [roleOptions]
    );

    const menuItems = useMemo(() => {
        const currentMenuId = Number(editingItem?.MenuID || 0);
        return [
            { label: 'Không thuộc menu', value: '' },
            ...menuOptions
                .filter((menu) => Number(menu.MenuID) !== currentMenuId)
                .map((menu) => ({ label: menu.MenuName || String(menu.MenuID), value: String(menu.MenuID) })),
        ];
    }, [editingItem?.MenuID, menuOptions]);

    const menuTree = useMemo(() => {
        const map = new Map<number, MenuNode>();
        const roots: MenuNode[] = [];

        [...menuOptions]
            .sort((a, b) => Number(a.DisplayOrder ?? a.OrderIndex ?? 0) - Number(b.DisplayOrder ?? b.OrderIndex ?? 0))
            .forEach((menu) => {
                map.set(Number(menu.MenuID), { ...menu, Children: [] });
            });

        map.forEach((node) => {
            const parentId = Number(node.ParentId || 0);
            if (parentId && map.has(parentId)) {
                map.get(parentId)?.Children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }, [menuOptions]);

    const params = useMemo(() => {
        const query: Record<string, any> = {
            pageSize,
            offset: (page - 1) * pageSize,
        };
        if (search.trim()) query[config.searchParam || 'keySearch'] = search.trim();
        if (config.projectParam && selectedProject) query[config.projectParam] = selectedProject;
        if (config.statusParam && statusFilter) query[config.statusParam] = statusFilter;
        if (path === '/userSystem' && roleFilter) query.roleId = roleFilter;
        if (path === '/emailConfig') {
            if (projectFilter) query.projectCode = projectFilter;
            if (emailTypeFilter) query.type = emailTypeFilter;
            if (statusFilter) query.status = statusFilter;
        }
        return query;
    }, [config.projectParam, config.searchParam, config.statusParam, emailTypeFilter, page, pageSize, path, projectFilter, roleFilter, search, selectedProject, statusFilter]);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await new ApiService('/project/getAllProject', 'get').request<any>();
            const data = Array.isArray(response?.Data) ? response.Data : [];
            setProjects(data.map((item: any) => ({ value: item.ProjectCode, label: item.ProjectName || item.ProjectCode })));
        } catch {
            setProjects([]);
        }
    }, []);

    const fetchGiftOptions = useCallback(async (projectCode: string) => {
        if (!projectCode) {
            setGiftOptions([]);
            return;
        }
        try {
            const response = await new ApiService('/prize/GetPrizesByProject', 'get', true).request<any>({}, { projectCode });
            const data = Array.isArray(response?.Data) ? response.Data : [];
            setGiftOptions(
                data.map((item: any) => ({
                    value: String(item.GiftID),
                    label: item.PrizeName || item.GiftName || String(item.GiftID),
                    meta: item,
                }))
            );
        } catch {
            setGiftOptions([]);
        }
    }, []);

    const fetchMenus = useCallback(async () => {
        try {
            const response = await new ApiService('/menu/GetAllMenu', 'get').request<any>();
            setMenuOptions(Array.isArray(response?.Data) ? response.Data : []);
        } catch {
            setMenuOptions([]);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await new ApiService('/systemUser/GetAllRole', 'get').request<any>();
            setRoleOptions(Array.isArray(response?.Data) ? response.Data : []);
        } catch {
            setRoleOptions([]);
        }
    }, []);

    const fetchEmailConfigOptions = useCallback(async () => {
        try {
            const response = await new ApiService('/emailConfig/GetAllEmailConfig', 'get').request<any>();
            const data = Array.isArray(response?.Data) ? response.Data : [];
            const mapped = data.map((item: any) => ({
                value: String(item.EmailId ?? item.Id),
                label: item.SenderEmail || item.Email || String(item.EmailId ?? item.Id),
                meta: item,
            }));
            setEmailConfigOptions(mapped);
            setActiveEmailConfig(mapped.find((item: Option) => !!item.meta?.IsActive) || null);
        } catch {
            setEmailConfigOptions([]);
            setActiveEmailConfig(null);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!config.endpoint) {
            setItems([]);
            setTotal(0);
            setError('Chức năng này chưa có endpoint mobile.');
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const response = await new ApiService(config.endpoint, 'get', true).request<any>({}, params);
            const data = Array.isArray(response?.Data) ? response.Data : [];
            const sortedData = path === '/emailConfig' ? [...data].sort((a, b) => Number(!!b.IsActive) - Number(!!a.IsActive)) : data;
            setItems(sortedData);
            setTotal(Number(data[0]?.TotalRow || data.length || 0));
        } catch (requestError: any) {
            const message = requestError?.message || 'Không thể tải dữ liệu.';
            setError(message);
            Alert.alert('Lỗi', message);
        } finally {
            setIsLoading(false);
        }
    }, [config.endpoint, params, path]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (hasProjectRestriction && !projectFilter && selectedProject) {
            setProjectFilter(selectedProject);
        }
    }, [hasProjectRestriction, projectFilter, selectedProject]);

    useEffect(() => {
        if (path === '/role' || path === '/menu') {
            fetchMenus();
        }
    }, [fetchMenus, path]);

    useEffect(() => {
        if (path === '/userSystem') {
            fetchRoles();
        }
    }, [fetchRoles, path]);

    useEffect(() => {
        if (path === '/emailConfig') {
            fetchEmailConfigOptions();
        }
    }, [fetchEmailConfigOptions, path]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (path === '/prizes') {
            fetchGiftOptions(String(formValues.ProjectCode || selectedProject || ''));
        }
    }, [fetchGiftOptions, formValues.ProjectCode, path, selectedProject]);

    const setFieldValue = (key: string, value: any) => {
        setFormValues((current) => {
            const next = { ...current, [key]: value };
            if (path === '/gift' && key === 'IsUnlimited' && value) next.Quantity = 0;
            if (path === '/prizes' && key === 'ProjectCode') {
                next.GiftID = '';
                next.Quantity = 0;
                next.RemainingWeight = 0;
                next.Weight = 0;
            }
            if (path === '/prizes' && key === 'GiftID') {
                const gift = giftOptions.find((item) => item.value === String(value))?.meta;
                next.Quantity = gift?.stockQuantity ?? gift?.Quantity ?? 0;
                next.RemainingWeight = gift?.remainingWeight ?? gift?.RemainingWeight ?? 0;
                next.Weight = 0;
            }
            if (path === '/userSystem' && key === 'RoleID' && Number(value) === 1) {
                next.ProjectCodes = [];
            }
            return next;
        });
    };

    const getDefaultFormValues = (item?: any) => {
        const defaults: Record<string, any> = {};
        config.formFields?.forEach((field) => {
            if (item && item[field.key] !== undefined && item[field.key] !== null) {
                if (field.type === 'date') {
                    defaults[field.key] = normalizeApiDate(item[field.key]);
                } else if (field.key === 'ProjectCodes') {
                    defaults[field.key] = String(item[field.key] || '').split(',').map((value) => value.trim()).filter(Boolean);
                } else if (field.type === 'image') {
                    defaults[field.key] = item.AvatarImage || '';
                } else {
                    defaults[field.key] = item[field.key];
                }
            } else if (field.type === 'project') {
                defaults[field.key] = selectedProject || visibleProjects[0]?.value || '';
            } else if (field.type === 'projects') {
                defaults[field.key] = selectedProject ? [selectedProject] : [];
            } else if (field.type === 'role') {
                defaults[field.key] = roleOptions[0]?.RoleID || 0;
            } else if (typeof field.defaultValue === 'function') {
                defaults[field.key] = field.defaultValue();
            } else if (field.defaultValue !== undefined) {
                defaults[field.key] = field.defaultValue;
            } else {
                defaults[field.key] = field.type === 'number' ? 0 : '';
            }
        });
        return defaults;
    };

    const openForm = (item?: any) => {
        setOpenFormDropdown(null);
        setEditingItem(item || null);
        setFormValues(getDefaultFormValues(item));
        if (path === '/role') {
            const checkedMenus = item?.listRoleMenu
                ?.filter((menu: any) => menu.IsChecked)
                .map((menu: any) => Number(menu.MenuID)) || [];
            setSelectedMenus(checkedMenus);
            setExpandedMenus(item ? menuOptions.map((menu) => Number(menu.MenuID)) : []);
        }
        if (path === '/userSystem' && !item && roleOptions[0]?.Symbol) {
            new ApiService('/systemUser/GetNewUsername', 'get', true)
                .request<any>({}, { symbol: roleOptions[0].Symbol })
                .then((response) => {
                    if (response?.Data) {
                        setFormValues((current) => ({ ...current, Username: response.Data }));
                    }
                })
                .catch(() => undefined);
        }
        setModalVisible(true);
    };

    const validateForm = () => {
        const missing = config.formFields?.find((field) => field.required && !String(formValues[field.key] ?? '').trim());
        if (missing) {
            Alert.alert('Thông báo', `Vui lòng nhập ${missing.label}.`);
            return false;
        }
        if (path === '/redeemSpin') {
            if (toNumber(formValues.BillValuePerSpin) <= 0 || toNumber(formValues.MaxSpinsPerBill) <= 0) {
                Alert.alert('Thông báo', 'Vui lòng nhập Giá trị hóa đơn và Số lượt tối đa lớn hơn 0.');
                return false;
            }
            const start = new Date(`${normalizeApiDate(formValues.StartDate)}T00:00:00`);
            const end = new Date(`${normalizeApiDate(formValues.EndDate)}T00:00:00`);
            if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > end) {
                Alert.alert('Thông báo', 'Từ ngày không được lớn hơn Đến ngày.');
                return false;
            }
        }
        if (path === '/prizes') {
            const weight = toNumber(formValues.Weight);
            const maxWeight = Number(formValues.RemainingWeight || 0) + (editingItem ? Number(editingItem.Weight || 0) : 0);
            if (weight <= 0) {
                Alert.alert('Thông báo', 'Vui lòng nhập Trọng số lớn hơn 0.');
                return false;
            }
            if (maxWeight >= 0 && weight > maxWeight) {
                Alert.alert('Thông báo', `Trọng số không được vượt quá ${maxWeight}%.`);
                return false;
            }
        }
        return true;
    };

    const generateUsername = async (roleId: any) => {
        if (editingItem || path !== '/userSystem') return;
        const role = roleOptions.find((item) => Number(item.RoleID) === Number(roleId));
        if (!role?.Symbol) return;
        try {
            const response = await new ApiService('/systemUser/GetNewUsername', 'get', true).request<any>({}, { symbol: role.Symbol });
            if (response?.Data) {
                setFormValues((current) => ({ ...current, Username: response.Data }));
            }
        } catch {
            // Manual username entry still works if generation fails.
        }
    };

    const saveForm = async () => {
        if (!config.actions || !validateForm()) return;

        const endpoint = editingItem ? config.actions.update : config.actions.insert;
        if (!endpoint) return;

        try {
            setIsSaving(true);
            if (path === '/role') {
                const rolePayload = createJsonPayload(config, formValues, editingItem);
                rolePayload.listRoleMenu = menuOptions.map((menu) => ({
                    RoleID: editingItem?.RoleID || 0,
                    MenuID: menu.MenuID,
                    IsChecked: selectedMenus.includes(Number(menu.MenuID)),
                }));
                if (!rolePayload.listRoleMenu.some((menu: any) => menu.IsChecked)) {
                    Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một menu.');
                    return;
                }
                await new ApiService(endpoint, 'post').request(rolePayload);
            } else if (config.multipart) {
                await new ApiService(endpoint, 'post').requestMultipart(createFormData(config, formValues, editingItem));
            } else {
                await new ApiService(endpoint, 'post').request(createJsonPayload(config, formValues, editingItem));
            }
            setModalVisible(false);
            fetchData();
        } catch (requestError: any) {
            Alert.alert('Lỗi', requestError?.message || 'Không thể lưu dữ liệu.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteItem = (item: any) => {
        if (!config.actions?.delete) return;
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bản ghi này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await new ApiService(config.actions!.delete!.endpoint, 'post').request({
                            [config.actions!.delete!.key]: item[config.actions!.delete!.key],
                        });
                        fetchData();
                    } catch (requestError: any) {
                        Alert.alert('Lỗi', requestError?.message || 'Không thể xóa dữ liệu.');
                    }
                },
            },
        ]);
    };

    const toggleStatus = async (item: any) => {
        if (!config.actions?.toggleStatus) return;
        try {
            const action = config.actions.toggleStatus;
            await new ApiService(action.endpoint, 'post', true).request({}, action.payload(item));
            fetchData();
        } catch (requestError: any) {
            Alert.alert('Lỗi', requestError?.message || 'Không thể cập nhật trạng thái.');
        }
    };

    const resetPassword = (item: any) => {
        Alert.alert('Xác nhận', `Reset mật khẩu cho ${item.Username || item.FullName}?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Reset',
                onPress: async () => {
                    try {
                        await new ApiService('/systemUser/UpdatePassword', 'post').request({ UserID: item.UserID });
                        Alert.alert('Thành công', 'Đã reset mật khẩu.');
                    } catch (requestError: any) {
                        Alert.alert('Lỗi', requestError?.message || 'Không thể reset mật khẩu.');
                    }
                },
            },
        ]);
    };

    const chooseEmailConfig = async (itemOrId: any) => {
        try {
            const emailId = typeof itemOrId === 'object' ? itemOrId.EmailId ?? itemOrId.Id : itemOrId;
            await new ApiService('/emailConfig/ChooseEmailConfig', 'post').request({ EmailId: Number(emailId) });
            Alert.alert('Thành công', 'Đã chọn Email Config mặc định. Các email config khác đã được khóa.');
            await Promise.all([fetchEmailConfigOptions(), fetchData()]);
        } catch (requestError: any) {
            Alert.alert('Lỗi', requestError?.message || 'Không thể chọn email config.');
        }
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const pickImageField = async (fieldKey: string) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Thông báo', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (!result.canceled && result.assets[0]) setFieldValue(fieldKey, result.assets[0]);
    };

    const openDatePicker = (fieldKey: string, value: any) => {
        const current = new Date(`${normalizeApiDate(value) || today()}T00:00:00`);
        setCalendarMonth(Number.isNaN(current.getTime()) ? new Date() : current);
        setDatePickerField(fieldKey);
    };

    const calendarDays = useMemo(() => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const first = new Date(year, month, 1);
        const start = new Date(year, month, 1 - first.getDay());
        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    }, [calendarMonth]);

    const selectCalendarDate = (date: Date) => {
        if (!datePickerField) return;
        setFieldValue(datePickerField, normalizeApiDate(date));
        setDatePickerField(null);
    };

    const renderProjectSelector = (
        value: string,
        onChange: (next: string) => void,
        title = 'Dự án',
        allowClear = true,
        dropdownKey = 'project'
    ) => {
        const isFilter = dropdownKey === 'projectFilter';
        const open = isFilter ? openProjectFilter : openFormDropdown === dropdownKey;
        const items = allowClear ? projectFilterItems : projectItems;

        return (
            <View style={styles.dropdownWrap}>
                <DropDownPicker<string>
                    open={open}
                    value={value || ''}
                    items={items}
                    setOpen={(nextOpen: DropdownOpenUpdater) => {
                        const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(open) : nextOpen;
                        if (isFilter) {
                            setOpenProjectFilter(resolvedOpen);
                        } else {
                            setOpenFormDropdown(resolvedOpen ? dropdownKey : null);
                        }
                    }}
                    setValue={(nextValue: DropdownSingleSetter<string>) => {
                        const next = typeof nextValue === 'function' ? nextValue(value || '') : nextValue;
                        onChange(String(next ?? ''));
                    }}
                    setItems={() => undefined}
                    onChangeValue={(next: string | null) => onChange(String(next ?? ''))}
                    placeholder={allowClear ? 'Tất cả dự án' : `Chọn ${title.toLowerCase()}`}
                    searchable
                    searchPlaceholder="Tìm kiếm..."
                    listMode="MODAL"
                    modalTitle={title}
                    style={styles.dropdown}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    dropDownContainerStyle={styles.dropdownContainer}
                />
                {allowClear && value ? (
                    <Pressable onPress={() => onChange('')} style={styles.dropdownClearButton}>
                        <Text style={styles.dropdownClearText}>×</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    };

    const renderProjectMultiSelector = (value: any, onChange: (next: string[]) => void, title = 'Dự án') => {
        const selectedValues = Array.isArray(value) ? value : String(value || '').split(',').filter(Boolean);
        return (
            <View style={styles.dropdownWrap}>
                <DropDownPicker<string>
                    multiple
                    mode="BADGE"
                    open={openFormDropdown === 'ProjectCodes'}
                    value={selectedValues}
                    items={projectItems}
                    setOpen={(nextOpen: DropdownOpenUpdater) => {
                        const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(openFormDropdown === 'ProjectCodes') : nextOpen;
                        setOpenFormDropdown(resolvedOpen ? 'ProjectCodes' : null);
                    }}
                    setValue={(nextValue: DropdownMultiSetter<string>) => {
                        const next = typeof nextValue === 'function' ? nextValue(selectedValues) : nextValue;
                        onChange(next);
                    }}
                    setItems={() => undefined}
                    onChangeValue={(next: string[]) => onChange(next)}
                    placeholder={`Chọn ${title.toLowerCase()}`}
                    searchable
                    searchPlaceholder="Tìm kiếm..."
                    listMode="MODAL"
                    modalTitle={title}
                    style={styles.dropdown}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    dropDownContainerStyle={styles.dropdownContainer}
                    badgeStyle={styles.dropdownBadge}
                    badgeTextStyle={styles.dropdownBadgeText}
                />
                {selectedValues.length ? (
                    <Pressable onPress={() => onChange([])} style={styles.dropdownClearButton}>
                        <Text style={styles.dropdownClearText}>×</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    };

    const renderRoleSelector = (value: any, onChange: (next: number) => void) => (
        <DropDownPicker<number>
            open={openFormDropdown === 'RoleID'}
            value={Number(value) || null}
            items={roleItems}
            setOpen={(nextOpen: DropdownOpenUpdater) => {
                const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(openFormDropdown === 'RoleID') : nextOpen;
                setOpenFormDropdown(resolvedOpen ? 'RoleID' : null);
            }}
            setValue={(nextValue: DropdownSingleSetter<number>) => {
                const currentValue = Number(value) || null;
                const next = typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;
                onChange(Number(next || 0));
            }}
            setItems={() => undefined}
            onChangeValue={(next: number | null) => {
                const roleId = Number(next || 0);
                onChange(roleId);
                generateUsername(roleId);
            }}
            placeholder="Chọn vai trò"
            searchable
            searchPlaceholder="Tìm kiếm..."
            listMode="MODAL"
            modalTitle="Vai trò"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            dropDownContainerStyle={styles.dropdownContainer}
        />
    );

    const renderRoleFilter = () => (
        <View style={styles.filterBlock}>
            <Text style={styles.filterLabel}>Quyền</Text>
            <View style={styles.dropdownWrap}>
                <DropDownPicker<string>
                    open={openRoleFilter}
                    value={roleFilter}
                    items={roleFilterItems}
                    setOpen={(nextOpen: DropdownOpenUpdater) => {
                        const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(openRoleFilter) : nextOpen;
                        setOpenRoleFilter(resolvedOpen);
                    }}
                    setValue={(nextValue: DropdownSingleSetter<string>) => {
                        const next = typeof nextValue === 'function' ? nextValue(roleFilter) : nextValue;
                        setRoleFilter(String(next ?? ''));
                        setPage(1);
                    }}
                    setItems={() => undefined}
                    onChangeValue={(next: string | null) => {
                        setRoleFilter(String(next ?? ''));
                        setPage(1);
                    }}
                    placeholder="Tất cả quyền"
                    searchable
                    searchPlaceholder="Tìm kiếm..."
                    listMode="MODAL"
                    modalTitle="Quyền"
                    style={styles.dropdown}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    dropDownContainerStyle={styles.dropdownContainer}
                />
                {roleFilter ? (
                    <Pressable onPress={() => setRoleFilter('')} style={styles.dropdownClearButton}>
                        <Text style={styles.dropdownClearText}>×</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );

    const renderGiftSelector = (value: any, onChange: (next: string) => void) => (
        <DropDownPicker<string>
            open={openFormDropdown === 'GiftID'}
            value={String(value || '')}
            items={giftOptions.map((gift) => ({ label: gift.label, value: gift.value }))}
            setOpen={(nextOpen: DropdownOpenUpdater) => {
                const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(openFormDropdown === 'GiftID') : nextOpen;
                setOpenFormDropdown(resolvedOpen ? 'GiftID' : null);
            }}
            setValue={(nextValue: DropdownSingleSetter<string>) => {
                const next = typeof nextValue === 'function' ? nextValue(String(value || '')) : nextValue;
                onChange(String(next ?? ''));
            }}
            setItems={() => undefined}
            onChangeValue={(next: string | null) => onChange(String(next ?? ''))}
            placeholder="Chọn giải thưởng"
            searchable
            searchPlaceholder="Tìm kiếm..."
            listMode="MODAL"
            modalTitle="Giải thưởng"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            dropDownContainerStyle={styles.dropdownContainer}
        />
    );

    const renderMenuSelector = (value: any, onChange: (next: string) => void) => (
        <DropDownPicker<string>
            open={openFormDropdown === 'ParentId'}
            value={String(value || '')}
            items={menuItems}
            setOpen={(nextOpen: DropdownOpenUpdater) => {
                const resolvedOpen = typeof nextOpen === 'function' ? nextOpen(openFormDropdown === 'ParentId') : nextOpen;
                setOpenFormDropdown(resolvedOpen ? 'ParentId' : null);
            }}
            setValue={(nextValue: DropdownSingleSetter<string>) => {
                const next = typeof nextValue === 'function' ? nextValue(String(value || '')) : nextValue;
                onChange(String(next ?? ''));
            }}
            setItems={() => undefined}
            onChangeValue={(next: string | null) => onChange(String(next ?? ''))}
            placeholder="Không thuộc menu"
            searchable
            searchPlaceholder="Tìm kiếm..."
            listMode="MODAL"
            modalTitle="Thuộc menu"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            dropDownContainerStyle={styles.dropdownContainer}
        />
    );

    const renderStatusFilter = () => (
        <View style={styles.segment}>
            {[
                { value: '', label: 'Tất cả' },
                { value: '1', label: 'Hoạt động' },
                { value: '0', label: 'Khóa' },
            ].map((item) => (
                <Pressable
                    key={item.value || 'all'}
                    onPress={() => {
                        setStatusFilter(item.value);
                        setPage(1);
                    }}
                    style={[styles.segmentItem, statusFilter === item.value && styles.segmentItemActive]}
                >
                    <Text style={[styles.segmentText, statusFilter === item.value && styles.segmentTextActive]}>{item.label}</Text>
                </Pressable>
            ))}
        </View>
    );

    const emailTypeOptions: Option[] = [
        { value: '', label: 'Loại Email' },
        { value: 'SMTP', label: 'SMTP' },
        { value: 'GMAIL', label: 'Gmail (OAuth)' },
    ];

    const emailStatusOptions: Option[] = [
        { value: '', label: 'Chọn tình trạng' },
        { value: '1', label: 'Đang hoạt động' },
        { value: '0', label: 'Khóa' },
    ];

    const activeEmailLabel = activeEmailConfig?.label || 'Chưa chọn';
    const selectedEmailTypeLabel = emailTypeOptions.find((item) => item.value === emailTypeFilter)?.label || 'Loại Email';
    const selectedEmailStatusLabel = emailStatusOptions.find((item) => item.value === statusFilter)?.label || 'Chọn tình trạng';

    const renderComboField = (label: string, value: string, onPress: () => void, style?: any) => (
        <Pressable onPress={onPress} style={[styles.filterCombo, style]}>
            <Text numberOfLines={1} style={styles.filterComboText}>{value || label}</Text>
            <View style={styles.comboDivider} />
            <Text style={styles.comboChevron}>v</Text>
        </Pressable>
    );

    const getOpenEmailComboOptions = () => {
        if (openEmailCombo === 'default') return emailConfigOptions;
        if (openEmailCombo === 'type') return emailTypeOptions;
        // if (openEmailCombo === 'project') return emailProjectOptions;
        if (openEmailCombo === 'status') return emailStatusOptions;
        return [];
    };

    const getOpenEmailComboTitle = () => {
        if (openEmailCombo === 'default') return 'Email Config mặc định';
        if (openEmailCombo === 'type') return 'Loại Email';
        if (openEmailCombo === 'status') return 'Tình trạng';
        if (openEmailCombo === 'project') return 'Dự án';
        return '';
    };

    const selectEmailComboOption = (option: Option) => {
        if (openEmailCombo === 'default') {
            const isActive = String(activeEmailConfig?.value || '') === String(option.value);
            if (!isActive) chooseEmailConfig(option.value);
        }

        if (openEmailCombo === 'project') {
            setProjectFilter(option.value);
            setPage(1);
        }

        if (openEmailCombo === 'type') {
            setEmailTypeFilter(option.value);
            setPage(1);
        }

        if (openEmailCombo === 'status') {
            setStatusFilter(option.value);
            setPage(1);
        }

        setOpenEmailCombo(null);
    };

    // const emailProjectOptions: Option[] = [
    //     { value: '', label: 'Dự án' },
    //     ...visibleProjects,
    // ];

    // const selectedEmailProjectLabel = emailProjectOptions.find((item) => item.value === projectFilter)?.label || 'Dự án';

    const renderField = (field: FieldConfig) => {
        const value = formValues[field.key];
        const disabled = !!editingItem && !!field.disabledOnEdit;

        if (path === '/userSystem' && field.key === 'ProjectCodes' && Number(formValues.RoleID) === 1) {
            return null;
        }

        if (path === '/emailConfig') {
            const emailType = String(formValues.Type || 'SMTP').toUpperCase();
            const smtpOnlyFields = ['SmtpServer', 'SmtpPort'];
            const gmailOnlyFields = ['ClientId', 'ClientSecret', 'RedirectUri'];

            if (emailType !== 'SMTP' && smtpOnlyFields.includes(field.key)) {
                return null;
            }

            if (emailType !== 'GMAIL' && gmailOnlyFields.includes(field.key)) {
                return null;
            }
        }

        if (field.type === 'boolean') {
            return (
                <View key={field.key} style={styles.switchRow}>
                    <Text style={styles.label}>{field.label}</Text>
                    <Switch value={!!value} onValueChange={(next) => setFieldValue(field.key, next)} disabled={disabled} />
                </View>
            );
        }

        if (field.type === 'project') {
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderProjectSelector(String(value || ''), (next) => setFieldValue(field.key, next), field.label, false, field.key)}
                </View>
            );
        }

        if (field.type === 'projects') {
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderProjectMultiSelector(value, (next) => setFieldValue(field.key, next), field.label)}
                </View>
            );
        }

        if (field.type === 'role') {
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderRoleSelector(value, (next) => setFieldValue(field.key, next))}
                </View>
            );
        }

        if (field.type === 'gift') {
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderGiftSelector(value, (next) => setFieldValue(field.key, next))}
                    {!giftOptions.length ? <Text style={styles.helper}>Chọn dự án để tải giải thưởng.</Text> : null}
                </View>
            );
        }

        if (field.type === 'menu') {
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    {renderMenuSelector(value, (next) => setFieldValue(field.key, next))}
                </View>
            );
        }

        if (field.type === 'image') {
            const uri = typeof value === 'string' ? value : value?.uri;
            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarPreview}>
                            {uri ? <Image source={{ uri }} style={styles.avatarImage} /> : <Text style={styles.avatarInitial}>?</Text>}
                        </View>
                        <View style={styles.avatarActions}>
                            <Pressable onPress={() => pickImageField(field.key)} style={styles.secondaryActionButton}>
                                <Text style={styles.actionText}>Chọn ảnh</Text>
                            </Pressable>
                            {uri ? (
                                <Pressable onPress={() => setFieldValue(field.key, '')} style={[styles.secondaryActionButton, styles.deleteButton]}>
                                    <Text style={styles.deleteText}>Xóa ảnh</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                </View>
            );
        }

        if (field.type === 'emailType') {
            const emailTypeOptions = [
                { value: 'SMTP', label: 'SMTP' },
                { value: 'GMAIL', label: 'Gmail (OAuth)' },
            ];

            return (
                <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <View style={styles.comboBox}>
                        {emailTypeOptions.map((option) => (
                            <Pressable
                                key={option.value}
                                onPress={() => setFieldValue(field.key, option.value)}
                                style={[styles.comboOption, String(value || 'SMTP').toUpperCase() === option.value && styles.comboOptionActive]}
                            >
                                <Text style={[styles.comboOptionText, String(value || 'SMTP').toUpperCase() === option.value && styles.comboOptionTextActive]}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            );
        }

        const isDisabled = disabled || !!field.readOnly || (path === '/gift' && field.key === 'Quantity' && !!formValues.IsUnlimited);
        const displayValue = field.type === 'number' ? (String(value ?? '') ? formatNumber(value) : '') : field.type === 'date' ? toDisplayDate(value) : String(value ?? '');

        return (
            <View key={field.key} style={styles.formGroup}>
                <Text style={styles.label}>{field.label}</Text>
                {field.type === 'date' ? (
                    <Pressable onPress={() => openDatePicker(field.key, value)} style={styles.dateButton}>
                        <Text style={[styles.dateText, !displayValue && styles.dropdownPlaceholder]}>{displayValue || 'Chọn ngày'}</Text>
                    </Pressable>
                ) : (
                    <TextInput
                        autoCapitalize="none"
                        editable={!isDisabled}
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        onChangeText={(next) => setFieldValue(field.key, field.type === 'number' ? numberDigits(next) : next)}
                        placeholder={field.label}
                        style={[styles.input, isDisabled && styles.inputDisabled]}
                        value={displayValue}
                    />
                )}
            </View>
        );
    };

    const getTreeMenuIds = (node: MenuNode): number[] => [
        Number(node.MenuID),
        ...node.Children.flatMap(getTreeMenuIds),
    ];

    const isTreeNodeChecked = (node: MenuNode) => getTreeMenuIds(node).every((menuId) => selectedMenus.includes(menuId));

    const toggleTreeNode = (node: MenuNode) => {
        const ids = getTreeMenuIds(node);
        setSelectedMenus((current) => {
            const shouldRemove = ids.every((menuId) => current.includes(menuId));
            if (shouldRemove) return current.filter((menuId) => !ids.includes(menuId));
            return [...new Set([...current, ...ids])];
        });
    };

    const toggleTreeExpanded = (menuId: number) => {
        setExpandedMenus((current) =>
            current.includes(menuId) ? current.filter((item) => item !== menuId) : [...current, menuId]
        );
    };

    const renderMenuTree = (nodes: MenuNode[], level = 0): React.ReactNode =>
        nodes.map((node) => {
            const menuId = Number(node.MenuID);
            const hasChildren = node.Children.length > 0;
            const expanded = expandedMenus.includes(menuId);
            const checked = isTreeNodeChecked(node);

            return (
                <View key={menuId}>
                    <View style={[styles.treeRow, { paddingLeft: 10 + level * 18 }]}>
                        <Pressable
                            disabled={!hasChildren}
                            onPress={() => toggleTreeExpanded(menuId)}
                            style={[styles.treeExpander, !hasChildren && styles.treeExpanderEmpty]}
                        >
                            <Text style={styles.treeExpanderText}>{hasChildren ? (expanded ? '⌄' : '›') : ''}</Text>
                        </Pressable>
                        <Pressable onPress={() => toggleTreeNode(node)} style={[styles.treeCheck, checked && styles.treeCheckActive]}>
                            <Text style={[styles.treeCheckText, checked && styles.treeCheckTextActive]}>{checked ? '✓' : ''}</Text>
                        </Pressable>
                        <Pressable onPress={() => toggleTreeNode(node)} style={styles.treeLabelButton}>
                            <Text style={styles.treeLabel} numberOfLines={2}>{node.MenuName}</Text>
                        </Pressable>
                    </View>
                    {hasChildren && expanded ? renderMenuTree(node.Children, level + 1) : null}
                </View>
            );
        });

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.page}>
            <View style={[styles.shell, isWebWide && styles.webShell]}>
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{config.title}</Text>
                        <Text style={styles.meta}>{total} bản ghi</Text>
                    </View>
                    <Pressable onPress={fetchData} style={styles.refreshButton}>
                        <Text style={styles.refreshText}>Tải lại</Text>
                    </Pressable>
                </View>

                <View style={styles.filterPanel}>
                    <View style={styles.emailFilterHeader}>
                        <Text style={styles.emailFilterLabel}>Bộ lọc</Text>
                        <Pressable
                            onPress={() => setFiltersExpanded((current) => !current)}
                            style={styles.collapseButton}
                        >
                            <Text style={styles.collapseText}>{filtersExpanded ? 'Thu gọn' : 'Mở rộng'}</Text>
                        </Pressable>
                    </View>
                    {filtersExpanded ? (
                        path === '/emailConfig' ? (
                            <View style={styles.emailFilterContent}>
                                {renderComboField('Email Config mặc định', activeEmailLabel, () => setOpenEmailCombo('default'), styles.defaultEmailCombo)}
                                {/* {renderComboField('Dự án', selectedEmailProjectLabel, () => setOpenEmailCombo('project'), styles.emailProjectCombo)} */}
                                {renderComboField('Loại Email', selectedEmailTypeLabel, () => setOpenEmailCombo('type'), styles.emailTypeCombo)}
                                {renderComboField('Chọn tình trạng', selectedEmailStatusLabel, () => setOpenEmailCombo('status'), styles.emailStatusCombo)}
                            </View>
                        ) : (
                            <>
                                <TextInput
                                    autoCapitalize="none"
                                    onChangeText={handleSearchChange}
                                    placeholder="Tìm kiếm..."
                                    style={styles.searchInput}
                                    value={search}
                                />
                                {config.projectParam ? (
                                    <View style={styles.filterBlock}>
                                        <Text style={styles.filterLabel}>Dự án</Text>
                                        {renderProjectSelector(selectedProject, (next) => {
                                            setProjectFilter(next || (hasProjectRestriction ? selectedProject : ''));
                                            setPage(1);
                                        }, 'Dự án', !hasProjectRestriction, 'projectFilter')}
                                    </View>
                                ) : null}
                                {path === '/userSystem' ? renderRoleFilter() : null}
                                {config.statusParam ? renderStatusFilter() : null}
                            </>
                        )
                    ) : null}
                </View>


                {canWrite ? (
                    <Pressable onPress={() => openForm()} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Thêm mới</Text>
                    </Pressable>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, isWebWide && styles.webScrollContent]}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
                    style={styles.scroll}
                >
                    {isLoading && !items.length ? (
                        <View style={styles.loading}>
                            <ActivityIndicator />
                            <Text style={styles.muted}>Đang tải dữ liệu...</Text>
                        </View>
                    ) : null}

                    {!isLoading && !items.length ? (
                        <View style={styles.empty}>
                            <Text style={styles.muted}>Không có dữ liệu</Text>
                        </View>
                    ) : null}

                    {items.map((item, index) => (
                        <View
                            key={String(item[config.idKey || 'ID'] || item.Id || item.ProjectID || item.GiftID || index)}
                            style={[styles.card, path === '/emailConfig' && item.IsActive && styles.activeRowCard, isWebWide && styles.webCard]}
                        >
                            {path === '/emailConfig' && item.IsActive ? (
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeBadgeText}>Đang hoạt động</Text>
                                </View>
                            ) : null}
                            {config.columns.map((column) => {
                                const rawValue = item[column.key];
                                const value = column.format ? column.format(rawValue, item) : String(rawValue ?? '');
                                return (
                                    <View key={column.key} style={styles.row}>
                                        <Text style={styles.rowLabel}>{column.title}</Text>
                                        <Text style={styles.rowValue}>{value}</Text>
                                    </View>
                                );
                            })}

                            {(config.actions?.update || config.actions?.delete || config.actions?.toggleStatus) ? (
                                <View style={styles.actions}>
                                    {config.actions?.update ? (
                                        <Pressable onPress={() => openForm(item)} style={styles.actionButton}>
                                            <Text style={styles.actionText}>Sửa</Text>
                                        </Pressable>
                                    ) : null}
                                    {config.actions?.toggleStatus ? (
                                        <Pressable onPress={() => toggleStatus(item)} style={styles.actionButton}>
                                            <Text style={styles.actionText}>{item.IsActive ? 'Tạm dừng' : 'Kích hoạt'}</Text>
                                        </Pressable>
                                    ) : null}
                                    {config.actions?.delete ? (
                                        <Pressable onPress={() => deleteItem(item)} style={[styles.actionButton, styles.deleteButton]}>
                                            <Text style={styles.deleteText}>Xóa</Text>
                                        </Pressable>
                                    ) : null}
                                    {path === '/userSystem' ? (
                                        <Pressable onPress={() => resetPassword(item)} style={styles.actionButton}>
                                            <Text style={styles.actionText}>Reset MK</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>
                    ))}
                </ScrollView>

                <View style={[styles.pagination, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <Pressable
                        disabled={page <= 1 || isLoading}
                        onPress={() => setPage((value) => Math.max(1, value - 1))}
                        style={[styles.pageButton, (page <= 1 || isLoading) && styles.disabledButton]}
                    >
                        <Text style={styles.pageButtonText}>Trước</Text>
                    </Pressable>
                    <Text style={styles.pageText}>
                        {page}/{totalPages}
                    </Text>
                    <Pressable
                        disabled={page >= totalPages || isLoading}
                        onPress={() => setPage((value) => Math.min(totalPages, value + 1))}
                        style={[styles.pageButton, (page >= totalPages || isLoading) && styles.disabledButton]}
                    >
                        <Text style={styles.pageButtonText}>Sau</Text>
                    </Pressable>
                </View>
            </View>

            <Modal animationType="fade" transparent visible={!!openEmailCombo} onRequestClose={() => setOpenEmailCombo(null)}>
                <Pressable onPress={() => setOpenEmailCombo(null)} style={styles.comboModalBackdrop}>
                    <Pressable onPress={(event) => event.stopPropagation()} style={styles.comboModalPanel}>
                        <Text style={styles.comboModalTitle}>{getOpenEmailComboTitle()}</Text>
                        {getOpenEmailComboOptions().map((option) => {
                            const isSelected =
                                (openEmailCombo === 'default' && String(activeEmailConfig?.value || '') === String(option.value)) ||
                                (openEmailCombo === 'project' && projectFilter === option.value) ||
                                (openEmailCombo === 'type' && emailTypeFilter === option.value) ||
                                (openEmailCombo === 'status' && statusFilter === option.value);

                            return (
                                <Pressable
                                    key={option.value || 'all'}
                                    onPress={() => selectEmailComboOption(option)}
                                    style={[styles.comboModalOption, isSelected && styles.comboModalOptionActive]}
                                >
                                    <Text style={[styles.comboModalOptionText, isSelected && styles.comboModalOptionTextActive]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal animationType="fade" transparent visible={!!datePickerField} onRequestClose={() => setDatePickerField(null)}>
                <Pressable onPress={() => setDatePickerField(null)} style={styles.comboModalBackdrop}>
                    <Pressable onPress={(event) => event.stopPropagation()} style={styles.calendarPanel}>
                        <View style={styles.calendarHeader}>
                            <Pressable
                                onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                                style={styles.calendarNavButton}
                            >
                                <Text style={styles.calendarNavText}>‹</Text>
                            </Pressable>
                            <Text style={styles.calendarTitle}>
                                {calendarMonth.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                            </Text>
                            <Pressable
                                onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                                style={styles.calendarNavButton}
                            >
                                <Text style={styles.calendarNavText}>›</Text>
                            </Pressable>
                        </View>
                        <View style={styles.weekRow}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                <Text key={day} style={styles.weekText}>{day}</Text>
                            ))}
                        </View>
                        <View style={styles.dayGrid}>
                            {calendarDays.map((date) => {
                                const apiDate = normalizeApiDate(date);
                                const selected = datePickerField ? normalizeApiDate(formValues[datePickerField]) === apiDate : false;
                                const muted = date.getMonth() !== calendarMonth.getMonth();
                                return (
                                    <Pressable
                                        key={apiDate}
                                        onPress={() => selectCalendarDate(date)}
                                        style={[styles.dayButton, selected && styles.dayButtonActive]}
                                    >
                                        <Text style={[styles.dayText, muted && styles.dayTextMuted, selected && styles.dayTextActive]}>
                                            {date.getDate()}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.modalPage}>
                    <View style={[styles.modalHeader, isWebWide && styles.webModalSection]}>
                        <Text style={styles.modalTitle}>{editingItem ? 'Cập nhật' : 'Thêm mới'} {config.title}</Text>
                        <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeText}>Đóng</Text>
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={[styles.modalBody, isWebWide && styles.webModalSection]} keyboardShouldPersistTaps="handled">
                        {config.formFields?.map(renderField)}
                        {path === '/role' ? (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Menu</Text>
                                <View style={styles.treePanel}>
                                    {renderMenuTree(menuTree)}
                                </View>
                                {!menuOptions.length ? <Text style={styles.helper}>Không tải được danh sách menu.</Text> : null}
                            </View>
                        ) : null}
                    </ScrollView>
                    <View style={[styles.modalFooter, isWebWide && styles.webModalSection, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <Pressable disabled={isSaving} onPress={saveForm} style={[styles.saveButton, isSaving && styles.disabledButton]}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu</Text>}
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#eef2f7',
        padding: 12,
    },
    shell: {
        flex: 1,
    },
    webShell: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1180,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 10,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    },
    meta: {
        marginTop: 4,
        color: '#64748b',
    },
    refreshButton: {
        minHeight: 40,
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#2563eb',
        paddingHorizontal: 14,
    },
    refreshText: {
        color: '#fff',
        fontWeight: '800',
    },
    searchInput: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    filterBlock: {
        marginBottom: 10,
    },
    filterLabel: {
        marginBottom: 6,
        color: '#475569',
        fontWeight: '800',
    },
    filterPanel: {
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
    },
    emailFilterContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    emailFilterHeader: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    emailFilterLabel: {
        flex: 1,
        color: '#0f172a',
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 20,
    },
    collapseButton: {
        minHeight: 34,
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 12,
    },
    collapseText: {
        color: '#0369a1',
        fontWeight: '800',
    },
    filterCombo: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 170,
        maxWidth: 280,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#dbe1ea',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    defaultEmailCombo: {
        minWidth: 230,
        maxWidth: 300,
    },
    emailProjectCombo: {
        minWidth: 170,
        maxWidth: 230,
    },
    emailTypeCombo: {
        minWidth: 170,
        maxWidth: 230,
    },
    emailStatusCombo: {
        minWidth: 190,
        maxWidth: 240,
    },
    filterComboText: {
        flex: 1,
        color: '#0f172a',
        fontSize: 14,
        paddingHorizontal: 12,
    },
    comboDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#d1d5db',
    },
    comboChevron: {
        width: 36,
        color: '#9ca3af',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '800',
    },
    comboModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
    },
    comboModalPanel: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
    },
    calendarPanel: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 14,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    calendarNavButton: {
        width: 40,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
    },
    calendarNavText: {
        color: '#0f172a',
        fontSize: 24,
        fontWeight: '900',
        lineHeight: 26,
    },
    calendarTitle: {
        color: '#0f172a',
        fontWeight: '900',
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    weekText: {
        flex: 1,
        textAlign: 'center',
        color: '#64748b',
        fontWeight: '800',
        fontSize: 12,
    },
    dayGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayButton: {
        width: '14.285%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    dayButtonActive: {
        backgroundColor: '#2563eb',
    },
    dayText: {
        color: '#0f172a',
        fontWeight: '800',
    },
    dayTextMuted: {
        color: '#cbd5e1',
    },
    dayTextActive: {
        color: '#fff',
    },
    comboModalTitle: {
        color: '#0f172a',
        fontWeight: '900',
        fontSize: 16,
        marginBottom: 8,
    },
    comboModalOption: {
        minHeight: 46,
        justifyContent: 'center',
        borderRadius: 6,
        paddingHorizontal: 12,
        marginTop: 4,
    },
    comboModalOptionActive: {
        backgroundColor: '#eff6ff',
    },
    comboModalOptionText: {
        color: '#0f172a',
        fontWeight: '800',
    },
    comboModalOptionTextActive: {
        color: '#1d4ed8',
    },
    comboModalOptionMeta: {
        marginTop: 2,
        color: '#64748b',
        fontSize: 12,
        fontWeight: '700',
    },
    defaultEmailBlock: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dbeafe',
        backgroundColor: '#eff6ff',
        padding: 12,
        marginBottom: 12,
    },
    activeEmailCard: {
        borderRadius: 6,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        padding: 12,
        marginBottom: 10,
    },
    activeEmailLabel: {
        color: '#1d4ed8',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    activeEmailValue: {
        marginTop: 4,
        color: '#0f172a',
        fontWeight: '800',
    },
    optionScroller: {
        flexGrow: 0,
    },
    optionPill: {
        minHeight: 38,
        justifyContent: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        marginRight: 8,
    },
    optionPillActive: {
        backgroundColor: '#0f172a',
        borderColor: '#0f172a',
    },
    optionText: {
        color: '#334155',
        fontWeight: '700',
    },
    optionTextActive: {
        color: '#fff',
    },
    dropdownWrap: {
        position: 'relative',
        zIndex: 10,
    },
    dropdown: {
        minHeight: 44,
        borderRadius: 6,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    dropdownContainer: {
        borderColor: '#cbd5e1',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    dropdownText: {
        color: '#0f172a',
        fontWeight: '800',
        fontSize: 14,
    },
    dropdownPlaceholder: {
        color: '#94a3b8',
        fontWeight: '800',
    },
    dropdownClearButton: {
        position: 'absolute',
        right: 38,
        top: 0,
        width: 34,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    dropdownClearText: {
        color: '#64748b',
        fontSize: 20,
        lineHeight: 22,
        fontWeight: '900',
    },
    dropdownBadge: {
        borderRadius: 6,
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
    },
    dropdownBadgeText: {
        color: '#1d4ed8',
        fontWeight: '800',
    },
    emailOptionPill: {
        minHeight: 52,
        justifyContent: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        marginRight: 8,
    },
    emailOptionPillActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    emailOptionText: {
        color: '#0f172a',
        fontWeight: '800',
    },
    emailOptionTextActive: {
        color: '#fff',
    },
    emailOptionStatus: {
        marginTop: 2,
        color: '#64748b',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emailOptionStatusActive: {
        color: '#dcfce7',
    },
    comboBox: {
        flexDirection: 'row',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    comboOption: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    comboOptionActive: {
        backgroundColor: '#2563eb',
    },
    comboOptionText: {
        color: '#334155',
        fontWeight: '800',
        textAlign: 'center',
    },
    comboOptionTextActive: {
        color: '#fff',
    },
    segment: {
        flexDirection: 'row',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        marginBottom: 10,
        overflow: 'hidden',
    },
    segmentItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 38,
    },
    segmentItemActive: {
        backgroundColor: '#dbeafe',
    },
    segmentText: {
        color: '#475569',
        fontWeight: '700',
    },
    segmentTextActive: {
        color: '#1d4ed8',
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
        borderRadius: 6,
        backgroundColor: '#16a34a',
        marginBottom: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '800',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    webScrollContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'stretch',
    },
    loading: {
        padding: 28,
        alignItems: 'center',
        gap: 8,
    },
    empty: {
        padding: 28,
        alignItems: 'center',
    },
    muted: {
        color: '#64748b',
    },
    error: {
        marginBottom: 10,
        color: '#b91c1c',
        fontWeight: '700',
    },
    card: {
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeRowCard: {
        borderColor: '#16a34a',
        borderWidth: 2,
    },
    activeBadge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    activeBadgeText: {
        color: '#15803d',
        fontSize: 12,
        fontWeight: '900',
    },
    webCard: {
        width: '32.6%',
        marginBottom: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 6,
    },
    rowLabel: {
        flex: 0.9,
        color: '#64748b',
        fontWeight: '700',
    },
    rowValue: {
        flex: 1.1,
        color: '#0f172a',
        textAlign: 'right',
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginTop: 10,
        paddingTop: 10,
    },
    actionButton: {
        minHeight: 34,
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 12,
    },
    actionText: {
        color: '#0f172a',
        fontWeight: '800',
    },
    deleteButton: {
        backgroundColor: '#fee2e2',
    },
    deleteText: {
        color: '#b91c1c',
        fontWeight: '800',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 4,
    },
    pageButton: {
        minWidth: 88,
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        backgroundColor: '#0f172a',
    },
    disabledButton: {
        opacity: 0.45,
    },
    pageButtonText: {
        color: '#fff',
        fontWeight: '800',
    },
    pageText: {
        color: '#0f172a',
        fontWeight: '800',
    },
    modalPage: {
        flex: 1,
        backgroundColor: '#eef2f7',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        paddingBottom: 28,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    closeButton: {
        minHeight: 36,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    closeText: {
        color: '#2563eb',
        fontWeight: '800',
    },
    modalBody: {
        padding: 12,
        paddingBottom: 14,
    },
    webModalSection: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 720,
    },
    modalFooter: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    formGroup: {
        marginBottom: 14,
    },
    label: {
        marginBottom: 6,
        color: '#1f2937',
        fontWeight: '800',
    },
    helper: {
        marginTop: 6,
        color: '#64748b',
    },
    input: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#e2e8f0',
        color: '#64748b',
    },
    dateButton: {
        minHeight: 46,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    dateText: {
        color: '#0f172a',
        fontSize: 14,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        padding: 12,
    },
    avatarPreview: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
        backgroundColor: '#e0f2fe',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarInitial: {
        color: '#0369a1',
        fontSize: 26,
        fontWeight: '900',
    },
    avatarActions: {
        flex: 1,
        gap: 8,
    },
    secondaryActionButton: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 12,
    },
    switchRow: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        marginBottom: 14,
    },
    menuCheckRow: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    menuCheckText: {
        flex: 1,
        paddingRight: 12,
        color: '#0f172a',
        fontWeight: '700',
    },
    treePanel: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        paddingVertical: 6,
        overflow: 'hidden',
    },
    treeRow: {
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    treeExpander: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
        marginRight: 6,
    },
    treeExpanderEmpty: {
        backgroundColor: 'transparent',
    },
    treeExpanderText: {
        color: '#475569',
        fontSize: 18,
        fontWeight: '900',
        lineHeight: 20,
    },
    treeCheck: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        marginRight: 8,
    },
    treeCheckActive: {
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
    },
    treeCheckText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    treeCheckTextActive: {
        color: '#fff',
    },
    treeLabelButton: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    treeLabel: {
        color: '#0f172a',
        fontWeight: '800',
    },
    saveButton: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#2563eb',
    },
    saveText: {
        color: '#fff',
        fontWeight: '800',
    },
});




