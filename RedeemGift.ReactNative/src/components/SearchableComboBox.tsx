import React from 'react';
import Select from './ui/select';

export default function SearchableComboBox({ label, onPress }: { label?: string; onPress?: () => void }) {
    return <Select label={label} onPress={onPress} />;
}
