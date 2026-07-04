import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function SearchComponent({ value, onChange }: { value?: string; onChange?: (s: string) => void }) {
    return <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Search" />;
}

const styles = StyleSheet.create({ input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 6 } });
