import React from 'react';
import { TouchableOpacity, Text, GestureResponderEvent, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Props {
    children?: React.ReactNode;
    onPress?: (e: GestureResponderEvent) => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({ children, onPress, style, textStyle }: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
            <Text style={[styles.text, textStyle]}>{children}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#2563eb',
        borderRadius: 6,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontWeight: '600',
    },
});
