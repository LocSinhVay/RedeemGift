import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPrev?: () => void;
    onNext?: () => void;
}

export default function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
    return (
        <View style={styles.row}>
            <Button title="Truoc" onPress={onPrev} disabled={page <= 1} />
            <Text style={styles.text}>{`${page} / ${totalPages}`}</Text>
            <Button title="Tiep" onPress={onNext} disabled={page >= totalPages} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 12,
    },
    text: { marginHorizontal: 8, fontWeight: '600' },
});
