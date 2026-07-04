import React, { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

export type DropDownPickerItem<T = string | number | null> = {
    label: string;
    value: T;
};

type BaseProps<T> = {
    open: boolean;
    items: DropDownPickerItem<T>[];
    setOpen: (value: boolean | ((current: boolean) => boolean)) => void;
    setItems?: (items: DropDownPickerItem<T>[] | ((current: DropDownPickerItem<T>[]) => DropDownPickerItem<T>[])) => void;
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    listMode?: 'DEFAULT' | 'FLATLIST' | 'SCROLLVIEW' | 'MODAL';
    modalTitle?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    placeholderStyle?: StyleProp<TextStyle>;
    dropDownContainerStyle?: StyleProp<ViewStyle>;
    badgeStyle?: StyleProp<ViewStyle>;
    badgeTextStyle?: StyleProp<TextStyle>;
};

type SingleProps<T> = BaseProps<T> & {
    multiple?: false;
    value: T | null;
    setValue: (value: T | null | ((current: T | null) => T | null)) => void;
    onChangeValue?: (value: T | null) => void;
};

type MultipleProps<T> = BaseProps<T> & {
    multiple: true;
    value: T[];
    setValue: (value: T[] | ((current: T[]) => T[])) => void;
    onChangeValue?: (value: T[]) => void;
    mode?: 'DEFAULT' | 'SIMPLE' | 'BADGE';
};

type Props<T> = SingleProps<T> | MultipleProps<T>;

const sameValue = (left: unknown, right: unknown) => String(left) === String(right);

export default function DropDownPicker<T = string | number | null>(props: Props<T>) {
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        const key = search.trim().toLowerCase();
        if (!key) return props.items;
        return props.items.filter((item) => item.label.toLowerCase().includes(key) || String(item.value).toLowerCase().includes(key));
    }, [props.items, search]);

    const selectedItems = props.multiple
        ? props.items.filter((item) => props.value.some((value) => sameValue(value, item.value)))
        : props.items.filter((item) => sameValue(item.value, props.value));

    const close = () => props.setOpen(false);

    const toggleItem = (item: DropDownPickerItem<T>) => {
        if (props.multiple) {
            const current = props.value;
            const exists = current.some((value) => sameValue(value, item.value));
            const next = exists ? current.filter((value) => !sameValue(value, item.value)) : [...current, item.value];
            props.setValue(next);
            props.onChangeValue?.(next);
            return;
        }

        props.setValue(item.value);
        props.onChangeValue?.(item.value);
        close();
    };

    const displayText = selectedItems.length ? selectedItems.map((item) => item.label).join(', ') : props.placeholder || 'Chọn';

    return (
        <>
            <Pressable onPress={() => props.setOpen(true)} style={[styles.control, props.style]}>
                {props.multiple && selectedItems.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
                        {selectedItems.map((item) => (
                            <View key={String(item.value)} style={[styles.badge, props.badgeStyle]}>
                                <Text numberOfLines={1} style={[styles.badgeText, props.badgeTextStyle]}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text
                        numberOfLines={1}
                        style={[styles.controlText, props.textStyle, !selectedItems.length && props.placeholderStyle]}
                    >
                        {displayText}
                    </Text>
                )}
                <Text style={styles.chevron}>⌄</Text>
            </Pressable>

            <Modal animationType="fade" transparent visible={props.open} onRequestClose={close}>
                <Pressable onPress={close} style={styles.backdrop}>
                    <Pressable onPress={(event) => event.stopPropagation()} style={[styles.panel, props.dropDownContainerStyle]}>
                        <Text style={styles.title}>{props.modalTitle || props.placeholder || 'Chọn'}</Text>
                        {props.searchable ? (
                            <TextInput
                                autoCapitalize="none"
                                onChangeText={setSearch}
                                placeholder={props.searchPlaceholder || 'Tìm kiếm...'}
                                style={styles.search}
                                value={search}
                            />
                        ) : null}
                        <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
                            {filteredItems.map((item) => {
                                const selected = selectedItems.some((selectedItem) => sameValue(selectedItem.value, item.value));
                                return (
                                    <Pressable
                                        key={String(item.value)}
                                        onPress={() => toggleItem(item)}
                                        style={[styles.option, selected && styles.optionActive]}
                                    >
                                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{item.label}</Text>
                                        {selected ? <Text style={styles.check}>✓</Text> : null}
                                    </Pressable>
                                );
                            })}
                            {!filteredItems.length ? <Text style={styles.empty}>Không có dữ liệu</Text> : null}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    control: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
        paddingLeft: 12,
        paddingRight: 36,
    },
    controlText: {
        flex: 1,
        color: '#0f172a',
        fontWeight: '800',
    },
    chevron: {
        position: 'absolute',
        right: 12,
        color: '#64748b',
        fontSize: 18,
        fontWeight: '900',
    },
    badgeRow: {
        alignItems: 'center',
        gap: 6,
        paddingRight: 6,
    },
    badge: {
        borderRadius: 6,
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#1d4ed8',
        fontSize: 12,
        fontWeight: '800',
    },
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15,23,42,0.35)',
        padding: 18,
    },
    panel: {
        width: '100%',
        maxWidth: 420,
        maxHeight: '82%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
        padding: 12,
    },
    title: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 8,
    },
    search: {
        minHeight: 42,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    list: {
        maxHeight: 420,
    },
    option: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 6,
        paddingHorizontal: 12,
        marginTop: 4,
    },
    optionActive: {
        backgroundColor: '#eff6ff',
    },
    optionText: {
        flex: 1,
        color: '#0f172a',
        fontWeight: '800',
    },
    optionTextActive: {
        color: '#1d4ed8',
    },
    check: {
        color: '#1d4ed8',
        fontWeight: '900',
    },
    empty: {
        padding: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});
