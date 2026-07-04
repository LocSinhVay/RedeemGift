import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Card({ children }: { children?: React.ReactNode }) {
    return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: 'white', borderRadius: 8, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 } });
