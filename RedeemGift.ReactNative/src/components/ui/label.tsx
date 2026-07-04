import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function Label({ children }: { children?: React.ReactNode }) {
    return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({ label: { fontSize: 14, marginBottom: 6, color: '#374151' } });
