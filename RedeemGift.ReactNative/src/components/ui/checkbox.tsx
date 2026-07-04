import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function Checkbox({ checked = false, onChange }: { checked?: boolean; onChange?: (v: boolean) => void }) {
    return (
        <TouchableOpacity onPress={() => onChange && onChange(!checked)} style={styles.wrapper}>
            <View style={[styles.box, checked && styles.boxChecked]}>{checked && <Text style={styles.check}>✓</Text>}</View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: { padding: 4 },
    box: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
    boxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    check: { color: 'white', fontSize: 12 },
});
