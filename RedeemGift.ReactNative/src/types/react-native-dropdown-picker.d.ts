declare module 'react-native-dropdown-picker' {
    import * as React from 'react';
    import { StyleProp, TextStyle, ViewStyle } from 'react-native';

    export type DropDownPickerItem<T = string | number | null> = {
        label: string;
        value: T;
        [key: string]: unknown;
    };

    type DropDownPickerBaseProps<T = string | number | null> = {
        open: boolean;
        items: DropDownPickerItem<T>[];
        setOpen: (value: boolean | ((current: boolean) => boolean)) => void;
        setItems?: (items: DropDownPickerItem<T>[] | ((current: DropDownPickerItem<T>[]) => DropDownPickerItem<T>[])) => void;
        mode?: 'DEFAULT' | 'SIMPLE' | 'BADGE';
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
        [key: string]: unknown;
    };

    export type DropDownPickerSingleProps<T = string | number | null> = DropDownPickerBaseProps<T> & {
        multiple?: false;
        value: T | null;
        setValue: (value: T | null | ((current: T | null) => T | null)) => void;
        onChangeValue?: (value: T | null) => void;
    };

    export type DropDownPickerMultipleProps<T = string | number | null> = DropDownPickerBaseProps<T> & {
        multiple: true;
        value: T[];
        setValue: (value: T[] | ((current: T[]) => T[])) => void;
        onChangeValue?: (value: T[]) => void;
    };

    export type DropDownPickerProps<T = string | number | null> =
        | DropDownPickerSingleProps<T>
        | DropDownPickerMultipleProps<T>;

    export default function DropDownPicker<T = string | number | null>(props: DropDownPickerProps<T>): React.ReactElement;
}
