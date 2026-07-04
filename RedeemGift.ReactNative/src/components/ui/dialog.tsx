import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Dialog({ visible, onClose, title, children }: { visible: boolean; onClose?: () => void; title?: string; children?: React.ReactNode }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.box}>
                    {title ? <Text style={styles.title}>{title}</Text> : null}
                    <View style={styles.content}>{children}</View>
                    <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnText}>Close</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    box: { width: '90%', backgroundColor: 'white', borderRadius: 8, padding: 16 },
    title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    content: { marginBottom: 12 },
    btn: { alignSelf: 'flex-end', padding: 8 },
    btnText: { color: '#2563eb' },
});
