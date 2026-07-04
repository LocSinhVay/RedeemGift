import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Props { text?: string; style?: ViewStyle; textStyle?: TextStyle }

export default function Badge({ text, style, textStyle }: Props) {
    return (
        <View style={[styles.badge, style]}>
            <Text style={[styles.text, textStyle]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    text: { color: 'white', fontSize: 12, fontWeight: '600' },
});
