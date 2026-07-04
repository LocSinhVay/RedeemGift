import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NavLink({ to, children }: { to: string; children?: React.ReactNode }) {
    const nav = useNavigation();
    return (
        <TouchableOpacity style={styles.link} onPress={() => (nav as any).navigate(to)}>
            <Text>{children}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({ link: { padding: 8 } });
