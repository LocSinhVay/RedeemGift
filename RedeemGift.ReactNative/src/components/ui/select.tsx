import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Select({ label, onPress }: { label?: string; onPress?: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Text>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({ container: { borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 6 } });
