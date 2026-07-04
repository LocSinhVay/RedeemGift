import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export type Column<T> = {
    key: keyof T;
    title: string;
    width?: number;
    render?: (item: T) => React.ReactNode;
};

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.statusText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (!data.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.statusText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrapper}>
            <View style={styles.table}>
                <View style={[styles.row, styles.headerRow]}>
                    {columns.map((column) => (
                        <View key={String(column.key)} style={[styles.cell, { width: column.width ?? 140 }]}>
                            <Text style={[styles.cellText, styles.headerText]}>{column.title}</Text>
                        </View>
                    ))}
                </View>

                {data.map((item, rowIndex) => (
                    <View key={rowIndex} style={[styles.row, rowIndex % 2 === 1 && styles.evenRow]}>
                        {columns.map((column) => (
                            <View key={String(column.key)} style={[styles.cell, { width: column.width ?? 140 }]}>
                                {column.render ? (
                                    column.render(item)
                                ) : (
                                    <Text style={styles.cellText}>{String(item[column.key] ?? '')}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', marginVertical: 8 },
    table: { minWidth: '100%' },
    row: { flexDirection: 'row', alignItems: 'center' },
    headerRow: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    cell: { padding: 12, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
    cellText: { fontSize: 14, color: '#1f2937' },
    headerText: { fontWeight: '700', color: '#111827' },
    evenRow: { backgroundColor: '#f8fafc' },
    loadingContainer: { padding: 24, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { padding: 24, alignItems: 'center', justifyContent: 'center' },
    statusText: { marginTop: 12, color: '#6b7280' },
});
