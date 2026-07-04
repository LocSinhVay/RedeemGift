import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default function Table({ children }: { children?: React.ReactNode }) {
    return (
        <ScrollView horizontal>
            <View style={styles.table}>{children}</View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    table: { minWidth: 600 },
});
