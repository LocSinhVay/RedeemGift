import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function DropdownMenu({ label, children }: { label?: string; children?: React.ReactNode }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.label}><Text>{label}</Text></TouchableOpacity>
            <View style={styles.menu}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    label: { padding: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 },
    menu: { marginTop: 6 },
});
