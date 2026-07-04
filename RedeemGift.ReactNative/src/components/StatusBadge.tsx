import React from 'react';
import Badge from './ui/badge';

export default function StatusBadge({ text }: { text?: string }) {
    return <Badge text={text} />;
}
