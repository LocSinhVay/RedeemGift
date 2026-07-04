import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button, ViewStyle } from 'react-native';

interface FilterBarProps {
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
    onAdd?: () => void;
    addLabel?: string;
    onRefresh?: () => void;
    showAdd?: boolean;
    showRefresh?: boolean;
    style?: ViewStyle;
}

export default function FilterBar({
    onSearch,
    searchPlaceholder = 'Tim kiem...',
    onAdd,
    addLabel = 'Them moi',
    onRefresh,
    showAdd = true,
    showRefresh = true,
    style,
}: FilterBarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (value: string) => {
        setSearchTerm(value);
        onSearch?.(value);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        onSearch?.('');
        onRefresh?.();
    };

    return (
        <View style={[styles.container, style]}>
            <TextInput
                value={searchTerm}
                placeholder={searchPlaceholder}
                onChangeText={handleChange}
                style={styles.input}
            />
            <View style={styles.actions}>
                {showRefresh && onRefresh ? (
                    <View style={styles.buttonWrapper}>
                        <Button title="Lam moi" onPress={handleRefresh} />
                    </View>
                ) : null}
                {showAdd && onAdd ? (
                    <View style={styles.buttonWrapper}>
                        <Button title={addLabel} onPress={onAdd} />
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginVertical: 8,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
});
