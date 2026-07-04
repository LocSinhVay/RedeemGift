import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export default function Textarea(props: TextInputProps) {
    return <TextInput multiline style={[styles.input, props.style]} {...props} />;
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 10,
        borderRadius: 6,
        minHeight: 100,
        textAlignVertical: 'top'
    },
});
